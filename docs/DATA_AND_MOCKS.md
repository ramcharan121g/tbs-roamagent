# Prayanam — Data Sources, Mocks & Simulation Disclaimers

## 1. Transparency & Simulation Contract
Prayanam strictly follows the integrity guidelines of the Samartha Hackathon:
> **Never fabricate live schedules, availability, fares, GPS positions, or booking authority if they do not exist.**

All schedules, seat availability numbers, GPS status updates, disruption events, and boarding passes in this demonstration are explicitly labelled:
```
DEMO MODE · SIMULATED DATA
```

## 2. Simulated Corridors & Seed Graph
The prototype operates on the **Visakhapatnam ↔ Hyderabad** transport corridor.

### Node Graph (Locations):
1. **Visakhapatnam (Origin Terminals)**:
   - Dwaraka Bus Station (RTC Complex) (`vizag-rtc`)
   - Maddilapalem Junction (`vizag-maddilapalem`)
   - Gajuwaka Junction (`vizag-gajuwaka`)
2. **Hyderabad Transit Hubs (Interchanges)**:
   - Mahatma Gandhi Bus Station (MGBS) (`hyd-mgbs`)
   - LB Nagar Ring Road (`hyd-lb-nagar`)
   - Ameerpet Transit Interchange (`hyd-ameerpet`)
3. **Hyderabad Final Destination Areas**:
   - HITEC City (Cyber Towers) (`hyd-hitec-city`)
   - Gachibowli Financial District (`hyd-gachibowli`)
   - Secunderabad Junction Area (`hyd-secunderabad`)

### Scheduled Services & Operators:
- **Orange Travels**: AC Sleeper service departing 20:30 IST, reaching MGBS at 06:15 IST (Fare: ₹850).
- **Morning Star Travels**: AC Sleeper service departing 21:15 IST, reaching MGBS at 06:50 IST (Fare: ₹920).
- **APSRTC Express**: Super Luxury Seater departing 20:00 IST (Fare: ₹650).
- **Kaveri Travels**: Multi-Axle Sleeper direct to HITEC City departing 21:45 IST (Fare: ₹1,150).
- **TSRTC Garuda Plus & Relief Buses**: Midnight relief services with finite capacities (5, 4, and 2 spare seats).
- **First/Last-Mile Mobility Providers**:
  - City Auto Express (Pre-booked auto from MGBS to HITEC City, Fare: ₹130, Duration: 45m).
  - SmartRide EV Cab (Electric Sedan from MGBS to HITEC City, Fare: ₹220, Duration: 45m).

## 3. Disruption Scenarios & State Changes
1. **90-Minute Bus Delay**:
   - Updates bus arrival from 06:15 AM to 07:45 AM.
   - Onward cab shifts from 06:30 AM to 08:00 AM, arriving at HITEC City at 08:45 AM.
   - Remaining deadline buffer: exactly 15 minutes before 09:00 AM.
2. **Cancellation & 12-Passenger Mass Rescue**:
   - 12 passengers with diverse budgets and deadlines.
   - Available spare seats across replacement fleet: exactly 11 seats.
   - Result: 11 matched safely without double booking; 1 passenger truthfully reported unresolved.
3. **Smart Missed-Bus Reboarding**:
   - Evaluates trusted boarding record after terminal departure.
   - Finds next future service only.

## 4. Privacy & Personal Data Protections
- Zero real payment credentials (cards, UPI PINs, net banking passwords) are collected.
- Synthetic passenger identities (e.g. `Rajesh Kumar`, `Ananya Sharma`) with masked emails (`r***@example.com`).
- A dedicated **Reset Demo Environment** button restores initial seed data at any time.
