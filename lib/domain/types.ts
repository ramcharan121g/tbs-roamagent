// Prayanam - Core Domain Types and Data Contracts

export type TransportMode = 'bus' | 'cab' | 'auto' | 'metro';
export type SeatClass = 'sleeper' | 'seater' | 'semi-sleeper' | 'any';
export type ServiceStatus = 'scheduled' | 'delayed' | 'cancelled' | 'departed' | 'completed';

export interface Location {
  id: string;
  name: string;
  city: string;
  district?: string;
  type: 'terminal' | 'stop' | 'destination';
  coordinates?: { lat: number; lng: number };
  amenity?: string;
  source?: 'seed' | 'osm_live' | 'scraped_ap' | 'verified_cache' | 'simulated';
  simulated: boolean;
}

export interface ScrapedLocationResult {
  location: Location;
  nearestHub?: Location;
  distanceToNearestHubKm?: number;
  synthesizedServices?: TransportService[];
  source: 'osm_live' | 'scraped_ap' | 'seed' | 'offline_ap' | 'verified_cache';
  confidence: number;
  verifiedAt: string;
}

export interface ServiceStopTime {
  serviceId: string;
  stopSequence: number;
  stopId: string;
  stopName: string;
  arrivalTime: string;   // e.g. "06:45 AM" or ISO
  departureTime: string; // e.g. "06:50 AM" or ISO
  distanceFromOriginKm: number;
  pickupAllowed: boolean;
  dropoffAllowed: boolean;
}

export interface TransportService {
  id: string;
  serviceNumber?: string;
  operatorId: string;
  operatorName: string;
  mode: TransportMode;
  busType?: 'Pallevelugu' | 'Express' | 'Super Luxury' | 'Garuda Plus' | 'Amaravati' | 'Sleeper' | 'Local Feeder';
  originId: string;
  destinationId: string;
  departureTime: string; // ISO 8601 with Asia/Kolkata offset
  arrivalTime: string;   // ISO 8601 with Asia/Kolkata offset
  fareInr: number;
  seatClass: SeatClass;
  totalCapacity: number;
  confirmedSeats: number;
  heldSeats: number;
  hasLuggageSpace: boolean;
  isAccessible: boolean;
  status: ServiceStatus;
  routeCode: string;
  delayMinutes: number;
  distanceKm?: number;
  operatingDays?: string[]; // e.g. ['Daily']
  intermediateStops?: ServiceStopTime[];
  liveLocation?: { lat: number; lng: number; lastUpdated: string };
  lastVerifiedAt?: string;
  simulated: boolean;
}

export interface BusStop {
  id: string;
  name: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  stationType: 'bus_station' | 'intermediate_stop' | 'tourist_hub' | 'transfer_junction';
}

export interface BusFare {
  serviceId: string;
  boardingStopId: string;
  destinationStopId: string;
  fareInr: number;
  seatClass: SeatClass;
  passengerCategory?: 'general' | 'senior' | 'child';
  verifiedDate?: string;
}

export interface TransitConnection {
  id: string;
  firstServiceId: string;
  transferStationId: string;
  transferStationName: string;
  secondServiceId: string;
  transferWaitingMinutes: number;
  totalDurationMinutes: number;
  totalDistanceKm: number;
  targetDestination: string;
}

export interface TripConstraints {
  origin: string;
  destination: string;
  originLocationId: string;
  destinationLocationId: string;
  departureDate: string; // YYYY-MM-DD
  earliestDeparture: string | null;
  arrivalDeadline: string; // ISO 8601 e.g. 2026-10-11T09:00:00+05:30
  passengers: number;
  budgetInr: number;
  budgetScope: 'per_person' | 'group_total';
  preferredClass: SeatClass;
  hasLuggage: boolean;
  accessibilityNeeds: string[];
  maxTransfers: number;
  language: string;
  hardConstraints: string[];
  softPreferences: string[];
  clarificationNeeded: string[];
  viaWaypoints?: string[];
  dataSource?: 'verified_timetable' | 'scraped_live' | 'hybrid';
}

export interface ItineraryLeg {
  id: string;
  serviceId: string;
  mode: TransportMode;
  operatorName: string;
  origin: Location;
  destination: Location;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  fareInr: number;
  seatClass: SeatClass;
  delayMinutes: number;
  status: ServiceStatus;
}

export interface Itinerary {
  id: string;
  legs: ItineraryLeg[];
  totalFareInr: number;
  departureTime: string;
  finalArrivalTime: string;
  totalDurationMinutes: number;
  transferTimeMinutes: number;
  lastMileDurationMinutes: number;
  lastMileFareInr: number;
  transferCount: number;
  deadlineBufferMinutes: number; // positive = arrives before deadline, negative = late
  isFeasible: boolean;
  constraintViolations: string[];
  preferenceMatches: string[];
  heuristicResilience: 'Higher' | 'Moderate' | 'Low';
  resilienceReason: string;
  backupCount: number;
  rankingScore: number;
  badge: string;
  simulated: boolean;
}

export interface ResilienceScenarioResult {
  scenario: string;
  availableBackups: number;
  estimatedExtraFareInr: number;
  revisedArrivalBufferMinutes: number;
  viable: boolean;
}

export interface ResiliencePassport {
  itineraryId: string;
  heuristicScore: 'Higher' | 'Moderate' | 'Low';
  backupRoutesCount: number;
  scenariosCovered: ResilienceScenarioResult[];
  vulnerabilities: string[];
  assumptions: string[];
  dataFreshness: string;
}

export interface DecisionEvidence {
  itineraryId: string;
  hardChecks: { name: string; passed: boolean; details: string }[];
  softChecks: { name: string; satisfied: boolean; details: string }[];
  alternativesEvaluated: number;
  alternativesRejected: { routeSummary: string; reason: string }[];
}

export interface HumanBookingApproval {
  id: string;
  itineraryId: string;
  passengerCount: number;
  approvedAmount: number;
  currency: 'INR';
  passengerName: string;
  approvedAt: string;
  bookingSessionId: string;
  status: 'valid' | 'invalidated' | 'consumed';
}

export type SimulatedPaymentMethod = 'upi_demo' | 'card_demo' | 'netbanking_demo';
export type SimulatedPaymentStatus = 'successful' | 'declined' | 'cancelled' | 'pending';

export interface SimulatedPaymentRecord {
  transactionId: string;
  approvalId: string;
  itineraryId: string;
  amount: number;
  currency: 'INR';
  method: SimulatedPaymentMethod;
  status: SimulatedPaymentStatus;
  timestamp: string;
  idempotencyKey: string;
}

export interface Booking {
  id: string;
  itinerary: Itinerary;
  passengerCount: number;
  totalFareInr: number;
  status: 'confirmed' | 'disrupted' | 'recovered' | 'cancelled';
  passengerName: string;
  passengerPhone?: string;
  idempotencyKey: string;
  boardingPassId: string;
  approvalId?: string;
  paymentTransactionId?: string;
  paymentStatus?: 'completed' | 'declined' | 'cancelled' | 'pending';
  paymentMethod?: string;
  createdAt: string;
  simulated: boolean;
}

export type DisruptionType = 'DELAY' | 'CANCEL' | 'MISSED_CONNECTION' | 'MISSED_BOARDING' | 'LAST_MILE_UNAVAILABLE';

export interface DisruptionEvent {
  id: string;
  type: DisruptionType;
  affectedServiceId: string;
  delayMinutes?: number;
  description: string;
  timestamp: string;
  simulated: boolean;
}

export interface SeatHold {
  id: string;
  serviceId: string;
  passengerCount: number;
  recoveryCaseId: string;
  status: 'active' | 'consumed' | 'released' | 'expired';
  createdAt: string;
  expiresAt: string; // ISO 8601
  ttlSeconds: number;
}

export type RecoveryStatus =
  | 'open'
  | 'options_found'
  | 'awaiting_operator'
  | 'capacity_held'
  | 'awaiting_traveller'
  | 'confirmed'
  | 'declined'
  | 'expired'
  | 'unresolved';

export interface RecoveryCase {
  id: string;
  bookingId: string;
  disruptionId: string;
  passengerName: string;
  currentLocation: Location;
  simulatedTime: string;
  status: RecoveryStatus;
  proposedItineraries: Itinerary[];
  selectedItinerary?: Itinerary;
  activeHoldId?: string;
  fareDifferenceInr?: number;
  auditTrail: AuditEvent[];
  requiresOperatorApproval: boolean;
  operatorApproved: boolean;
  travellerApproved: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: 'traveller' | 'operator' | 'system' | 'simulator';
  action: string;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  recipient: 'traveller' | 'operator' | 'admin';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'alert' | 'success';
  actionUrl?: string;
}

export interface BenchmarkMetrics {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  zeroViolationCheckPassed: boolean;
  zeroOverAllocationPassed: boolean;
  zeroUnauthorizedBookingPassed: boolean;
  idempotencyCheckPassed: boolean;
  concurrentSeatRacePassed: boolean;
  averagePlanningLatencyMs: number;
  results: {
    id: string;
    name: string;
    passed: boolean;
    durationMs: number;
    details: string;
  }[];
}
