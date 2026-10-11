// Prayanam - Central In-Memory Demo Repository & Atomic Inventory Controller
import {
  AuditEvent,
  Booking,
  DisruptionEvent,
  HumanBookingApproval,
  Itinerary,
  Location,
  Notification,
  RecoveryCase,
  SeatHold,
  SimulatedPaymentRecord,
  TransportService,
} from '../domain/types';
import { SEED_SERVICES } from '../seed/services';
import { SEED_LOCATIONS, registerDynamicLocationResolver } from '../seed/locations';
import { getFastStationById, searchFastAPStations } from '../seed/ap-comprehensive-stations';
import { addMinutesToIso, toKolkataIsoString } from '../domain/time';

export class DemoRepository {
  private static instance: DemoRepository;

  private services: TransportService[] = [];
  private locations: Location[] = [];
  private bookings: Map<string, Booking> = new Map();
  private holds: Map<string, SeatHold> = new Map();
  private recoveryCases: Map<string, RecoveryCase> = new Map();
  private approvals: Map<string, HumanBookingApproval> = new Map();
  private payments: Map<string, SimulatedPaymentRecord> = new Map();
  private disruptionEvents: DisruptionEvent[] = [];
  private auditEvents: AuditEvent[] = [];
  private notifications: Notification[] = [];
  private simulatedTime: string = '2026-10-10T18:00:00+05:30';

  private constructor() {
    this.resetToSeed();
  }

  public static getInstance(): DemoRepository {
    if (!DemoRepository.instance) {
      DemoRepository.instance = new DemoRepository();
      registerDynamicLocationResolver(
        (id) => DemoRepository.instance.getLocationById(id),
        (name) => DemoRepository.instance.findLocationByName(name)
      );
    }
    return DemoRepository.instance;
  }

  public resetToSeed(): void {
    this.services = JSON.parse(JSON.stringify(SEED_SERVICES));
    this.locations = JSON.parse(JSON.stringify(SEED_LOCATIONS));
    this.bookings.clear();
    this.holds.clear();
    this.recoveryCases.clear();
    this.approvals.clear();
    this.payments.clear();
    this.disruptionEvents = [];
    this.auditEvents = [];
    this.notifications = [];
    this.simulatedTime = '2026-10-10T18:00:00+05:30';

    this.recordAudit('system', 'RESET_DEMO', 'Database restored to initial deterministic seed state.');
    this.addNotification({
      recipient: 'admin',
      title: 'Demo Environment Reset',
      message: 'Initial transport schedules, passenger profiles, and fleet capacity restored.',
      type: 'info',
    });
  }

  // --- Clock Management ---
  public getSimulatedTime(): string {
    return this.simulatedTime;
  }

  public advanceSimulatedTime(minutes: number): string {
    this.simulatedTime = addMinutesToIso(this.simulatedTime, minutes);
    this.recordAudit('simulator', 'ADVANCE_TIME', `Simulated clock advanced by ${minutes} minutes to ${this.simulatedTime}`);
    this.checkHoldExpirations();
    return this.simulatedTime;
  }

  public setSimulatedTime(timeIso: string): void {
    this.simulatedTime = timeIso;
    this.checkHoldExpirations();
  }

  // --- Locations ---
  public getLocations(): Location[] {
    return [...this.locations];
  }

  public getLocationById(id: string): Location | undefined {
    const loc = this.locations.find((l) => l.id === id);
    if (loc) return loc;
    const fast = getFastStationById(id);
    if (fast) {
      this.locations.push(fast);
      return fast;
    }
    return undefined;
  }

  public findLocationByName(query: string): Location | undefined {
    const q = query.toLowerCase().trim();
    // 1. Exact match
    const exact = this.locations.find(
      (loc) => loc.name.toLowerCase() === q || loc.city.toLowerCase() === q || loc.id === q
    );
    if (exact) return exact;

    // 2. Substring match
    const sub = this.locations.find(
      (loc) => loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q) || (loc.district && loc.district.toLowerCase().includes(q))
    );
    if (sub) return sub;

    // 3. Multi-word token match (e.g. "HITEC City, Hyderabad")
    const cleanQ = q.replace(/[(),.-/]/g, ' ').replace(/\s+/g, ' ').trim();
    const tokens = cleanQ.split(' ').filter((t) => t.length > 1);
    if (tokens.length > 0) {
      const tokenMatch = this.locations.find((loc) => {
        const text = `${loc.name} ${loc.city} ${loc.district || ''}`.toLowerCase();
        return tokens.every((t) => text.includes(t));
      });
      if (tokenMatch) return tokenMatch;
    }

    // 4. Pre-indexed AP comprehensive station match
    const fastHit = searchFastAPStations(query, 1)[0];
    if (fastHit) {
      if (!this.locations.some((l) => l.id === fastHit.id)) {
        this.locations.push(fastHit);
      }
      return fastHit;
    }

    return undefined;
  }

  public addLocation(loc: Location): void {
    if (!this.locations.some((l) => l.id === loc.id)) {
      this.locations.push(loc);
    }
  }

  // --- Services & Inventory ---
  public getServices(): TransportService[] {
    return [...this.services];
  }

  public addService(service: TransportService): void {
    if (!this.services.some((s) => s.id === service.id)) {
      this.services.push(service);
    }
  }

  public getServiceById(id: string): TransportService | undefined {
    return this.services.find((s) => s.id === id);
  }

  public updateServiceStatus(
    serviceId: string,
    status: TransportService['status'],
    delayMinutes = 0
  ): TransportService | null {
    const s = this.getServiceById(serviceId);
    if (!s) return null;

    s.status = status;
    s.delayMinutes = delayMinutes;
    if (delayMinutes > 0) {
      s.arrivalTime = addMinutesToIso(s.arrivalTime, delayMinutes);
    }

    this.recordAudit(
      'simulator',
      'SERVICE_STATUS_CHANGE',
      `Service ${s.operatorName} (${serviceId}) updated to ${status} with +${delayMinutes}m delay.`
    );
    return s;
  }

  // --- Atomic Seat Allocation & Temporary Holds ---
  /**
   * Atomically creates a temporary seat hold. Prevents double-booking.
   */
  public createSeatHold(
    serviceId: string,
    passengerCount: number,
    recoveryCaseId: string,
    ttlSeconds = 300
  ): { success: boolean; hold?: SeatHold; error?: string } {
    const service = this.getServiceById(serviceId);
    if (!service) {
      return { success: false, error: 'SERVICE_NOT_FOUND' };
    }

    const availableCapacity = service.totalCapacity - service.confirmedSeats - service.heldSeats;
    if (availableCapacity < passengerCount) {
      this.recordAudit(
        'operator',
        'HOLD_REJECTED',
        `Insufficient capacity on ${service.operatorName}: requested ${passengerCount}, available ${availableCapacity}.`
      );
      return { success: false, error: 'INSUFFICIENT_CAPACITY' };
    }

    // Atomically reserve hold
    service.heldSeats += passengerCount;

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const hold: SeatHold = {
      id: `hold-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      serviceId,
      passengerCount,
      recoveryCaseId,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt,
      ttlSeconds,
    };

    this.holds.set(hold.id, hold);

    this.recordAudit(
      'operator',
      'HOLD_CREATED',
      `Temporary hold ${hold.id} created for ${passengerCount} seat(s) on ${service.operatorName}. Expires at ${expiresAt}.`
    );

    return { success: true, hold };
  }

  /**
   * Atomically confirms a hold into a confirmed allocation
   */
  public confirmSeatHold(
    holdId: string,
    recoveryCaseId: string
  ): { success: boolean; error?: string } {
    const hold = this.holds.get(holdId);
    if (!hold) return { success: false, error: 'HOLD_NOT_FOUND' };
    if (hold.recoveryCaseId !== recoveryCaseId) return { success: false, error: 'UNAUTHORIZED_CASE' };
    if (hold.status !== 'active') return { success: false, error: `HOLD_ALREADY_${hold.status.toUpperCase()}` };

    const service = this.getServiceById(hold.serviceId);
    if (!service) return { success: false, error: 'SERVICE_NOT_FOUND' };

    // Atomically convert hold to confirmed
    service.heldSeats = Math.max(0, service.heldSeats - hold.passengerCount);
    service.confirmedSeats += hold.passengerCount;
    hold.status = 'consumed';

    this.recordAudit(
      'traveller',
      'HOLD_CONFIRMED',
      `Seat hold ${holdId} confirmed and consumed. ${hold.passengerCount} seat(s) assigned on ${service.operatorName}.`
    );

    return { success: true };
  }

  /**
   * Releases a temporary hold back to free inventory
   */
  public releaseSeatHold(holdId: string, reason = 'TRAVELLER_DECLINED'): boolean {
    const hold = this.holds.get(holdId);
    if (!hold || hold.status !== 'active') return false;

    const service = this.getServiceById(hold.serviceId);
    if (service) {
      service.heldSeats = Math.max(0, service.heldSeats - hold.passengerCount);
    }
    hold.status = 'released';

    this.recordAudit('system', 'HOLD_RELEASED', `Hold ${holdId} released (${reason}). Capacity restored.`);
    return true;
  }

  /**
   * Checks and expires all active holds that passed their TTL
   */
  public checkHoldExpirations(): number {
    const now = Date.now();
    let expiredCount = 0;

    for (const hold of this.holds.values()) {
      if (hold.status === 'active' && new Date(hold.expiresAt).getTime() <= now) {
        hold.status = 'expired';
        const service = this.getServiceById(hold.serviceId);
        if (service) {
          service.heldSeats = Math.max(0, service.heldSeats - hold.passengerCount);
        }
        expiredCount++;
        this.recordAudit('system', 'HOLD_EXPIRED', `Hold ${hold.id} expired. Capacity returned to service ${service?.operatorName}.`);
      }
    }
    return expiredCount;
  }

  public expireAllHoldsNow(): number {
    let count = 0;
    for (const hold of this.holds.values()) {
      if (hold.status === 'active') {
        hold.status = 'expired';
        const service = this.getServiceById(hold.serviceId);
        if (service) {
          service.heldSeats = Math.max(0, service.heldSeats - hold.passengerCount);
        }
        count++;
      }
    }
    this.recordAudit('simulator', 'EXPIRE_HOLDS_MANUAL', `Manually expired ${count} active hold(s).`);
    return count;
  }

  // --- Human Approval & Payment Tracking ---
  public recordHumanApproval(approval: HumanBookingApproval): HumanBookingApproval {
    this.approvals.set(approval.id, approval);
    this.recordAudit(
      'traveller',
      'HUMAN_APPROVAL_RECORDED',
      `Explicit human approval ${approval.id} recorded for itinerary ${approval.itineraryId}. Amount: ₹${approval.approvedAmount} for ${approval.passengerCount} passenger(s).`
    );
    return approval;
  }

  public getHumanApproval(id: string): HumanBookingApproval | undefined {
    return this.approvals.get(id);
  }

  public invalidateHumanApproval(id: string, reason: string): boolean {
    const app = this.approvals.get(id);
    if (!app) return false;
    app.status = 'invalidated';
    this.recordAudit('system', 'HUMAN_APPROVAL_INVALIDATED', `Approval ${id} invalidated: ${reason}.`);
    return true;
  }

  public recordSimulatedPayment(payment: SimulatedPaymentRecord): SimulatedPaymentRecord {
    this.payments.set(payment.transactionId, payment);
    this.recordAudit(
      'traveller',
      'SIMULATED_PAYMENT_PROCESSED',
      `Simulated payment ${payment.transactionId} processed with status ${payment.status}. Amount: ₹${payment.amount} via ${payment.method}.`
    );
    return payment;
  }

  public getSimulatedPayment(transactionId: string): SimulatedPaymentRecord | undefined {
    return this.payments.get(transactionId);
  }

  // --- Bookings ---
  public createBooking(
    itinerary: Itinerary,
    passengerCount: number,
    passengerName: string,
    idempotencyKey: string,
    approvalId?: string,
    paymentTransactionId?: string,
    paymentMethod?: string,
    seatHoldId?: string
  ): { booking: Booking; isDuplicate: boolean; error?: string } {
    // 1. Check idempotency
    for (const b of this.bookings.values()) {
      if (b.idempotencyKey === idempotencyKey) {
        return { booking: b, isDuplicate: true };
      }
    }

    // 2. Validate Seat Hold if provided
    if (seatHoldId) {
      const hold = this.holds.get(seatHoldId);
      if (!hold) {
        return { booking: {} as Booking, isDuplicate: false, error: 'HOLD_NOT_FOUND' };
      }
      if (hold.status === 'expired') {
        return { booking: {} as Booking, isDuplicate: false, error: 'HOLD_EXPIRED' };
      }
      if (hold.status !== 'active') {
        return { booking: {} as Booking, isDuplicate: false, error: `HOLD_ALREADY_${hold.status.toUpperCase()}` };
      }
      hold.status = 'consumed';
    }

    // 3. Validate Approval if provided
    if (approvalId) {
      const app = this.approvals.get(approvalId);
      if (app) {
        if (app.status === 'invalidated') {
          return { booking: {} as Booking, isDuplicate: false, error: 'APPROVAL_INVALIDATED' };
        }
        app.status = 'consumed';
      }
    }

    const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passId = `PASS-VZ-HYD-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking: Booking = {
      id: bookingId,
      itinerary,
      passengerCount,
      totalFareInr: itinerary.totalFareInr * passengerCount,
      status: 'confirmed',
      passengerName,
      idempotencyKey,
      boardingPassId: passId,
      approvalId,
      paymentTransactionId,
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'upi_demo',
      createdAt: toKolkataIsoString(new Date()),
      simulated: true,
    };

    // Deduct seats on confirmed service
    const busLeg = itinerary.legs.find((l) => l.mode === 'bus');
    if (busLeg) {
      const s = this.getServiceById(busLeg.serviceId);
      if (s) {
        if (seatHoldId) {
          s.heldSeats = Math.max(0, s.heldSeats - passengerCount);
        }
        s.confirmedSeats += passengerCount;
      }
    }

    this.bookings.set(bookingId, booking);
    this.recordAudit(
      'traveller',
      'SIMULATED_BOOKING_CONFIRMED',
      `Booking ${bookingId} confirmed for ${passengerName}. Pass ${passId} issued (SIMULATED). Payment Txn: ${paymentTransactionId || 'N/A'}.`
    );

    this.addNotification({
      recipient: 'traveller',
      title: 'Simulated Booking Confirmed',
      message: `Your journey from ${itinerary.legs[0].origin.name} to ${itinerary.legs[itinerary.legs.length - 1].destination.name} is booked. Pass: ${passId}.`,
      type: 'success',
    });

    return { booking, isDuplicate: false };
  }

  public getBooking(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  public getAllBookings(): Booking[] {
    return Array.from(this.bookings.values());
  }

  // --- Recovery Cases ---
  public createRecoveryCase(
    bookingId: string,
    disruptionId: string,
    passengerName: string,
    currentLocationId: string,
    proposedItineraries: Itinerary[]
  ): RecoveryCase {
    const caseId = `rec-${Date.now()}`;
    const location = SEED_LOCATIONS.find((l) => l.id === currentLocationId) || SEED_LOCATIONS[0];

    const recoveryCase: RecoveryCase = {
      id: caseId,
      bookingId,
      disruptionId,
      passengerName,
      currentLocation: location,
      simulatedTime: this.simulatedTime,
      status: 'options_found',
      proposedItineraries,
      auditTrail: [],
      requiresOperatorApproval: true,
      operatorApproved: false,
      travellerApproved: false,
    };

    this.recoveryCases.set(caseId, recoveryCase);
    this.recordAudit(
      'system',
      'RECOVERY_CASE_OPENED',
      `Opened recovery case ${caseId} for passenger ${passengerName} following disruption ${disruptionId}.`
    );

    return recoveryCase;
  }

  public getRecoveryCase(caseId: string): RecoveryCase | undefined {
    return this.recoveryCases.get(caseId);
  }

  public getAllRecoveryCases(): RecoveryCase[] {
    return Array.from(this.recoveryCases.values());
  }

  public updateRecoveryCase(caseId: string, updates: Partial<RecoveryCase>): RecoveryCase | null {
    const rc = this.recoveryCases.get(caseId);
    if (!rc) return null;

    Object.assign(rc, updates);
    return rc;
  }

  // --- Audit Trail & Notifications ---
  public recordAudit(actor: AuditEvent['actor'], action: string, reason: string): void {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: toKolkataIsoString(new Date()),
      actor,
      action,
      reason,
    };
    this.auditEvents.unshift(event);
  }

  public getAuditTrail(): AuditEvent[] {
    return [...this.auditEvents];
  }

  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const n: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: toKolkataIsoString(new Date()),
      read: false,
      ...notification,
    };
    this.notifications.unshift(n);
    return n;
  }

  public getNotifications(recipient?: 'traveller' | 'operator' | 'admin'): Notification[] {
    if (!recipient) return [...this.notifications];
    return this.notifications.filter((n) => n.recipient === recipient || n.recipient === 'admin');
  }

  public clearDemoData(): void {
    this.resetToSeed();
  }
}

export const demoRepo = DemoRepository.getInstance();
