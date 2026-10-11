// TBS RoamAgent - Seed Locations (Visakhapatnam & Hyderabad Corridor)
import { Location } from '../domain/types';

export const SEED_LOCATIONS: Location[] = [
  // Visakhapatnam
  {
    id: 'vizag-rtc',
    name: 'Dwaraka Bus Station (RTC Complex)',
    city: 'Visakhapatnam',
    type: 'terminal',
    coordinates: { lat: 17.7265, lng: 83.3032 },
    simulated: true,
  },
  {
    id: 'vizag-maddilapalem',
    name: 'Maddilapalem Junction',
    city: 'Visakhapatnam',
    type: 'stop',
    coordinates: { lat: 17.7402, lng: 83.3325 },
    simulated: true,
  },
  {
    id: 'vizag-gajuwaka',
    name: 'Gajuwaka Junction',
    city: 'Visakhapatnam',
    type: 'stop',
    coordinates: { lat: 17.6908, lng: 83.2105 },
    simulated: true,
  },

  // Hyderabad Terminals & Hubs
  {
    id: 'hyd-mgbs',
    name: 'Mahatma Gandhi Bus Station (MGBS)',
    city: 'Hyderabad',
    type: 'terminal',
    coordinates: { lat: 17.3786, lng: 78.4812 },
    simulated: true,
  },
  {
    id: 'hyd-lb-nagar',
    name: 'LB Nagar Ring Road Stop',
    city: 'Hyderabad',
    type: 'stop',
    coordinates: { lat: 17.3457, lng: 78.5522 },
    simulated: true,
  },
  {
    id: 'hyd-ameerpet',
    name: 'Ameerpet Transit Interchange',
    city: 'Hyderabad',
    type: 'stop',
    coordinates: { lat: 17.4375, lng: 78.4482 },
    simulated: true,
  },

  // Hyderabad Final Destinations
  {
    id: 'hyd-hitec-city',
    name: 'HITEC City (Cyber Towers)',
    city: 'Hyderabad',
    type: 'destination',
    coordinates: { lat: 17.4504, lng: 78.3808 },
    simulated: true,
  },
  {
    id: 'hyd-gachibowli',
    name: 'Gachibowli (Financial District)',
    city: 'Hyderabad',
    type: 'destination',
    coordinates: { lat: 17.4401, lng: 78.3489 },
    simulated: true,
  },
  {
    id: 'hyd-secunderabad',
    name: 'Secunderabad Junction Area',
    city: 'Hyderabad',
    type: 'destination',
    coordinates: { lat: 17.4399, lng: 78.5017 },
    simulated: true,
  },

  // --- Andhra Pradesh 6 Tourist Destinations Hubs ---
  // A. Tirupati & Tirumala
  { id: 'stop-tpt-cbs', name: 'Tirupati Central Bus Station (CBS)', city: 'Tirupati', type: 'terminal', coordinates: { lat: 13.6288, lng: 79.4192 }, simulated: true },
  { id: 'stop-trm-cro', name: 'Tirumala Bus Station (CRO)', city: 'Tirumala', type: 'destination', coordinates: { lat: 13.6833, lng: 79.3472 }, simulated: true },
  { id: 'stop-skht-cbs', name: 'Srikalahasti RTC Stand', city: 'Srikalahasti', type: 'destination', coordinates: { lat: 13.7501, lng: 79.7037 }, simulated: true },

  // B. Visakhapatnam & Araku Valley
  { id: 'stop-araku-bus', name: 'Araku Valley Bus Station', city: 'Araku Valley', type: 'destination', coordinates: { lat: 18.3333, lng: 82.8833 }, simulated: true },
  { id: 'stop-borra', name: 'Borra Caves Junction', city: 'Araku Valley', type: 'stop', coordinates: { lat: 18.2811, lng: 83.0406 }, simulated: true },

  // C. Vijayawada & Amaravati
  { id: 'stop-vja-pnbs', name: 'Vijayawada Pandit Nehru Bus Station (PNBS)', city: 'Vijayawada', type: 'terminal', coordinates: { lat: 16.5062, lng: 80.6480 }, simulated: true },
  { id: 'stop-amr-temple', name: 'Amaravati Dhyana Buddha Heritage', city: 'Amaravati', type: 'destination', coordinates: { lat: 16.5742, lng: 80.3575 }, simulated: true },
  { id: 'stop-gnt-cbs', name: 'Guntur NTR Bus Station', city: 'Guntur', type: 'terminal', coordinates: { lat: 16.3067, lng: 80.4365 }, simulated: true },

  // D. Gandikota & Belum Caves
  { id: 'stop-kadapa-cbs', name: 'Kadapa Central Bus Station', city: 'Kadapa', type: 'terminal', coordinates: { lat: 14.4673, lng: 78.8242 }, simulated: true },
  { id: 'stop-jmdg-cbs', name: 'Jammalamadugu RTC Bus Station', city: 'Jammalamadugu', type: 'terminal', coordinates: { lat: 14.8500, lng: 78.3833 }, simulated: true },
  { id: 'stop-gandikota', name: 'Gandikota Fort Heritage Hub', city: 'Gandikota', type: 'destination', coordinates: { lat: 14.8142, lng: 78.2861 }, simulated: true },
  { id: 'stop-belum-caves', name: 'Belum Caves Entrance Hub', city: 'Belum Caves', type: 'destination', coordinates: { lat: 15.1031, lng: 78.1114 }, simulated: true },
  { id: 'stop-kurnool-cbs', name: 'Kurnool RTC Central Stand', city: 'Kurnool', type: 'terminal', coordinates: { lat: 15.8281, lng: 78.0373 }, simulated: true },

  // E. Rajahmundry & Maredumilli
  { id: 'stop-rjy-cbs', name: 'Rajahmundry Central Bus Stand', city: 'Rajahmundry', type: 'terminal', coordinates: { lat: 16.9891, lng: 81.7840 }, simulated: true },
  { id: 'stop-maredumilli', name: 'Maredumilli Eco-Tourism Center', city: 'Maredumilli', type: 'destination', coordinates: { lat: 17.5933, lng: 81.7133 }, simulated: true },
  { id: 'stop-polavaram', name: 'Polavaram / Papikondalu Boat Point', city: 'Polavaram', type: 'destination', coordinates: { lat: 17.2519, lng: 81.6444 }, simulated: true },
  { id: 'stop-kakinada-cbs', name: 'Kakinada RTC Complex', city: 'Kakinada', type: 'terminal', coordinates: { lat: 16.9890, lng: 82.2475 }, simulated: true },

  // F. Lepakshi
  { id: 'stop-hindupur-cbs', name: 'Hindupur RTC Bus Station', city: 'Hindupur', type: 'terminal', coordinates: { lat: 13.8283, lng: 77.4919 }, simulated: true },
  { id: 'stop-lepakshi-temple', name: 'Lepakshi Veerabhadra Temple', city: 'Lepakshi', type: 'destination', coordinates: { lat: 13.8042, lng: 77.6083 }, simulated: true },
  { id: 'stop-anantapur-cbs', name: 'Anantapur RTC Central Stand', city: 'Anantapur', type: 'terminal', coordinates: { lat: 14.6819, lng: 77.6006 }, simulated: true },
  { id: 'stop-blr-majestic', name: 'Bengaluru Majestic CBS', city: 'Bengaluru', type: 'terminal', coordinates: { lat: 12.9774, lng: 77.5708 }, simulated: true },
];

let dynamicLookup: ((id: string) => Location | undefined) | null = null;
let dynamicNameLookup: ((name: string) => Location | undefined) | null = null;

import { getFastStationById, searchFastAPStations } from './ap-comprehensive-stations';

export function registerDynamicLocationResolver(
  byId: (id: string) => Location | undefined,
  byName: (name: string) => Location | undefined
) {
  dynamicLookup = byId;
  dynamicNameLookup = byName;
}

export function getLocationById(id: string): Location | undefined {
  if (dynamicLookup) {
    const loc = dynamicLookup(id);
    if (loc) return loc;
  }
  const seed = SEED_LOCATIONS.find((loc) => loc.id === id);
  if (seed) return seed;
  return getFastStationById(id);
}

export function findLocationByName(query: string): Location | undefined {
  if (dynamicNameLookup) {
    const loc = dynamicNameLookup(query);
    if (loc) return loc;
  }
  const q = query.toLowerCase().trim();
  const seed = SEED_LOCATIONS.find(
    (loc) => loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q)
  );
  if (seed) return seed;

  const fastHits = searchFastAPStations(query, 1);
  return fastHits.length > 0 ? fastHits[0] : undefined;
}
