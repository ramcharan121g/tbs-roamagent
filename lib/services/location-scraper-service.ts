// TBS RoamAgent - Location Intelligence & Web Scraper Service
// Implements ₹0-budget live OpenStreetMap Nominatim scraping + Deterministic Offline AP Geographical Fallback
import { Location, TransportService, ScrapedLocationResult } from '../domain/types';
import { DemoRepository } from '../repositories/demo-repository';
import { addMinutesToIso } from '../domain/time';
import { AP_COMPREHENSIVE_STATIONS } from '../seed/ap-comprehensive-stations';
import { SEED_LOCATIONS } from '../seed/locations';

export interface OfflineAPPlace {
  id: string;
  name: string;
  city: string;
  district: string;
  type: 'terminal' | 'stop' | 'destination';
  lat: number;
  lng: number;
  nearestHubId: string;
  isGhatOrHilly?: boolean;
  aliases: string[];
}

// 1. Comprehensive Offline Andhra Pradesh & Corridors Dataset
export const OFFLINE_AP_PLACES: OfflineAPPlace[] = [
  // Agency / ASR / Visakhapatnam Regional
  {
    id: 'stop-lambasingi',
    name: 'Lambasingi Hill View Point & Bus Stand',
    city: 'Lambasingi',
    district: 'Alluri Sitharama Raju',
    type: 'destination',
    lat: 17.8203,
    lng: 82.5204,
    nearestHubId: 'stop-narsipatnam-cbs',
    isGhatOrHilly: true,
    aliases: ['lambasingi', 'లంబసింగి', 'lammasingi', 'kashmir of andhra', 'chintapalli lambasingi'],
  },
  {
    id: 'stop-narsipatnam-cbs',
    name: 'Narsipatnam RTC Depot & Bus Stand',
    city: 'Narsipatnam',
    district: 'Anakapalli',
    type: 'terminal',
    lat: 17.6710,
    lng: 82.6139,
    nearestHubId: 'stop-rjy-cbs',
    isGhatOrHilly: false,
    aliases: ['narsipatnam', 'నర్సీపట్నం', 'narseepatnam', 'narsipatnam rtc'],
  },
  {
    id: 'stop-chintapalli',
    name: 'Chintapalli RTC Bus Stand',
    city: 'Chintapalli',
    district: 'Alluri Sitharama Raju',
    type: 'stop',
    lat: 17.8667,
    lng: 82.3500,
    nearestHubId: 'stop-narsipatnam-cbs',
    isGhatOrHilly: true,
    aliases: ['chintapalli', 'చింతపల్లి', 'chinthapalli'],
  },
  {
    id: 'stop-paderu',
    name: 'Paderu Agency Bus Station',
    city: 'Paderu',
    district: 'Alluri Sitharama Raju',
    type: 'terminal',
    lat: 18.0833,
    lng: 82.6667,
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: true,
    aliases: ['paderu', 'పాడేరు'],
  },
  {
    id: 'stop-anakapalle-cbs',
    name: 'Anakapalle RTC Bus Stand',
    city: 'Anakapalle',
    district: 'Anakapalli',
    type: 'terminal',
    lat: 17.6896,
    lng: 83.0033,
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: false,
    aliases: ['anakapalle', 'అనకాపల్లి', 'anakapalli'],
  },
  {
    id: 'stop-tuni-cbs',
    name: 'Tuni RTC Bus Stand',
    city: 'Tuni',
    district: 'Kakinada',
    type: 'terminal',
    lat: 17.3583,
    lng: 82.5500,
    nearestHubId: 'stop-rjy-cbs',
    isGhatOrHilly: false,
    aliases: ['tuni', 'తుని'],
  },
  {
    id: 'stop-annavaram-temple',
    name: 'Annavaram Satyanarayana Swamy Temple',
    city: 'Annavaram',
    district: 'Kakinada',
    type: 'destination',
    lat: 17.2833,
    lng: 82.4000,
    nearestHubId: 'stop-rjy-cbs',
    isGhatOrHilly: false,
    aliases: ['annavaram', 'అన్నవరం', 'ratnagiri annavaram'],
  },

  // Srisailam & Kurnool Regional
  {
    id: 'stop-srisailam-cbs',
    name: 'Srisailam RTC Complex (Mallikarjuna Swamy)',
    city: 'Srisailam',
    district: 'Nandyal',
    type: 'destination',
    lat: 16.0748,
    lng: 78.8687,
    nearestHubId: 'stop-kurnool-cbs',
    isGhatOrHilly: true,
    aliases: ['srisailam', 'శ్రీశైలం', 'srisaila', 'mallikarjuna', 'srisailam temple'],
  },
  {
    id: 'stop-ahobilam-temple',
    name: 'Ahobilam Upper/Lower Narasimha Hub',
    city: 'Ahobilam',
    district: 'Nandyal',
    type: 'destination',
    lat: 15.1333,
    lng: 78.7167,
    nearestHubId: 'stop-kurnool-cbs',
    isGhatOrHilly: true,
    aliases: ['ahobilam', 'అహోబిలం', 'ahobila', 'narasimha swamy ahobilam'],
  },
  {
    id: 'stop-mahanandi',
    name: 'Mahanandi Temple Bus Stop',
    city: 'Mahanandi',
    district: 'Nandyal',
    type: 'destination',
    lat: 15.4833,
    lng: 78.6167,
    nearestHubId: 'stop-kurnool-cbs',
    isGhatOrHilly: false,
    aliases: ['mahanandi', 'మహానంది'],
  },
  {
    id: 'stop-nandyal-cbs',
    name: 'Nandyal RTC Bus Station',
    city: 'Nandyal',
    district: 'Nandyal',
    type: 'terminal',
    lat: 15.4833,
    lng: 78.4833,
    nearestHubId: 'stop-kurnool-cbs',
    isGhatOrHilly: false,
    aliases: ['nandyal', 'నంద్యాల', 'nandyala'],
  },

  // Rayalaseema & Chittoor / Horsley Hills
  {
    id: 'stop-horsley-hills',
    name: 'Horsley Hills Hill Resort Stop',
    city: 'Horsley Hills',
    district: 'Annamayya',
    type: 'destination',
    lat: 13.6500,
    lng: 78.4000,
    nearestHubId: 'stop-madanapalle-cbs',
    isGhatOrHilly: true,
    aliases: ['horsley hills', 'హార్స్లీ హిల్స్', 'horsley', 'yenugu mallamma konda'],
  },
  {
    id: 'stop-madanapalle-cbs',
    name: 'Madanapalle RTC Central Stand',
    city: 'Madanapalle',
    district: 'Annamayya',
    type: 'terminal',
    lat: 13.5500,
    lng: 78.5000,
    nearestHubId: 'stop-tpt-cbs',
    isGhatOrHilly: false,
    aliases: ['madanapalle', 'మదనపల్లె', 'madanapalli'],
  },
  {
    id: 'stop-chittoor-cbs',
    name: 'Chittoor RTC Central Bus Stand',
    city: 'Chittoor',
    district: 'Chittoor',
    type: 'terminal',
    lat: 13.2172,
    lng: 79.1003,
    nearestHubId: 'stop-tpt-cbs',
    isGhatOrHilly: false,
    aliases: ['chittoor', 'చిత్తూరు', 'chittor'],
  },
  {
    id: 'stop-kanipakam-temple',
    name: 'Kanipakam Varasiddhi Vinayaka Temple',
    city: 'Kanipakam',
    district: 'Chittoor',
    type: 'destination',
    lat: 13.2667,
    lng: 79.0333,
    nearestHubId: 'stop-tpt-cbs',
    isGhatOrHilly: false,
    aliases: ['kanipakam', 'కాణిపాకం', 'vinayaka temple kanipakam'],
  },

  // Coastal / Krishna / Godavari
  {
    id: 'stop-machilipatnam-cbs',
    name: 'Machilipatnam RTC Central Stand',
    city: 'Machilipatnam',
    district: 'Krishna',
    type: 'terminal',
    lat: 16.1809,
    lng: 81.1303,
    nearestHubId: 'stop-vja-pnbs',
    isGhatOrHilly: false,
    aliases: ['machilipatnam', 'మచిలీపట్నం', 'bandar', 'masula'],
  },
  {
    id: 'stop-eluru-cbs',
    name: 'Eluru New Bus Stand',
    city: 'Eluru',
    district: 'Eluru',
    type: 'terminal',
    lat: 16.7107,
    lng: 81.0952,
    nearestHubId: 'stop-vja-pnbs',
    isGhatOrHilly: false,
    aliases: ['eluru', 'ఏలూరు', 'ellore'],
  },
  {
    id: 'stop-bhimavaram-cbs',
    name: 'Bhimavaram RTC Stand',
    city: 'Bhimavaram',
    district: 'West Godavari',
    type: 'terminal',
    lat: 16.5449,
    lng: 81.5212,
    nearestHubId: 'stop-rjy-cbs',
    isGhatOrHilly: false,
    aliases: ['bhimavaram', 'భీమవరం'],
  },
  {
    id: 'stop-ongole-cbs',
    name: 'Ongole Central Bus Stand',
    city: 'Ongole',
    district: 'Prakasam',
    type: 'terminal',
    lat: 15.5057,
    lng: 80.0499,
    nearestHubId: 'stop-vja-pnbs',
    isGhatOrHilly: false,
    aliases: ['ongole', 'ఒంగోలు'],
  },
  {
    id: 'stop-nellore-cbs',
    name: 'Nellore Atmakur Bus Station',
    city: 'Nellore',
    district: 'SPSR Nellore',
    type: 'terminal',
    lat: 14.4426,
    lng: 79.9865,
    nearestHubId: 'stop-tpt-cbs',
    isGhatOrHilly: false,
    aliases: ['nellore', 'నెల్లూరు', 'simhapuri'],
  },
  {
    id: 'stop-srikakulam-cbs',
    name: 'Srikakulam RTC Complex',
    city: 'Srikakulam',
    district: 'Srikakulam',
    type: 'terminal',
    lat: 18.2949,
    lng: 83.8938,
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: false,
    aliases: ['srikakulam', 'శ్రీకాకుళం', 'chicacole'],
  },
  {
    id: 'stop-vizianagaram-cbs',
    name: 'Vizianagaram RTC Complex',
    city: 'Vizianagaram',
    district: 'Vizianagaram',
    type: 'terminal',
    lat: 18.1133,
    lng: 83.3977,
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: false,
    aliases: ['vizianagaram', 'విజయనగరం', 'vzmn'],
  },
];

// Helper: Haversine distance in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const FALLBACK_AP_HUB: Location = {
  id: 'vizag-rtc',
  name: 'Dwaraka Bus Station (RTC Complex)',
  city: 'Visakhapatnam',
  district: 'Visakhapatnam',
  type: 'terminal',
  coordinates: { lat: 17.7265, lng: 83.3032 },
  source: 'seed',
  simulated: true,
};

export class LocationScraperService {
  private static instance: LocationScraperService;
  private cache: Map<string, ScrapedLocationResult> = new Map();

  public static getInstance(): LocationScraperService {
    if (!LocationScraperService.instance) {
      LocationScraperService.instance = new LocationScraperService();
    }
    return LocationScraperService.instance;
  }

  /**
   * Primary entry point: Resolves or scrapes a location by user query.
   * Checks: Cache -> Local Repo -> Live OpenStreetMap Scraper -> Offline AP Dataset
   */
  public async resolveLocation(
    query: string,
    simulatedDate = '2026-10-10'
  ): Promise<ScrapedLocationResult> {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      throw new Error('Location query cannot be empty');
    }

    // 1. Check memory cache
    if (this.cache.has(normalized)) {
      const cached = this.cache.get(normalized)!;
      return cached;
    }

    const repo = DemoRepository.getInstance();

    // 2. Check existing registered locations in SEED_LOCATIONS with active services
    const existing = repo.findLocationByName(normalized);
    if (existing && SEED_LOCATIONS.some((sl) => sl.id === existing.id)) {
      const existingServices = repo.getServices().filter((s) => s.originId === existing.id);
      if (existingServices.length > 0) {
        const result: ScrapedLocationResult = {
          location: existing,
          source: 'seed',
          synthesizedServices: existingServices,
          confidence: 0.98,
          verifiedAt: new Date().toISOString(),
        };
        this.cache.set(normalized, result);
        return result;
      }
    }

    // 3. Check curated AP geographic & transit dataset first
    const offlineResult = this.resolveOfflineAPPlace(normalized, simulatedDate);
    if (offlineResult) {
      this.cache.set(normalized, offlineResult);
      repo.addLocation(offlineResult.location);
      if (offlineResult.synthesizedServices) {
        for (const s of offlineResult.synthesizedServices) {
          repo.addService(s);
        }
      }
      return offlineResult;
    }

    // 4. Try Live OpenStreetMap (Nominatim) Scraper with 3000ms timeout for arbitrary AP landmarks/towns
    try {
      const osmResult = await this.scrapeOpenStreetMap(normalized, simulatedDate);
      if (osmResult) {
        this.cache.set(normalized, osmResult);
        repo.addLocation(osmResult.location);
        if (osmResult.synthesizedServices) {
          for (const s of osmResult.synthesizedServices) {
            repo.addService(s);
          }
        }
        return osmResult;
      }
    } catch (err) {
      console.warn(`[LocationScraper] Live OSM lookup failed for "${normalized}", falling back to generic synthesis:`, err);
    }

    // 5. If completely unknown, synthesize a safe AP Transit Point with closest regional hub
    const genericResult = this.synthesizeGenericLocation(normalized, simulatedDate);
    this.cache.set(normalized, genericResult);
    repo.addLocation(genericResult.location);
    if (genericResult.synthesizedServices) {
      for (const s of genericResult.synthesizedServices) {
        repo.addService(s);
      }
    }
    return genericResult;
  }

  /**
   * Scrapes OpenStreetMap (Nominatim) API for live coordinates and location metadata.
   * Free, zero-API-key endpoint.
   */
  private async scrapeOpenStreetMap(
    query: string,
    simulatedDate: string
  ): Promise<ScrapedLocationResult | null> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query + ' Andhra Pradesh India'
    )}&format=json&addressdetails=1&limit=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3200);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TBS-RoamAgent-Scraper/1.0 (hackathon-prototype; contact: support@tbsroam.in)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return null;

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    const hit = items[0];
    const lat = parseFloat(hit.lat);
    const lon = parseFloat(hit.lon);

    // Validate bounding box for South India / AP corridor
    // Lat: 12.0 to 20.5, Lon: 76.0 to 85.5
    if (isNaN(lat) || isNaN(lon) || lat < 12.0 || lat > 20.5 || lon < 76.0 || lon > 85.5) {
      return null;
    }

    const cityOrTown =
      hit.address?.city ||
      hit.address?.town ||
      hit.address?.village ||
      hit.address?.suburb ||
      query;
    const district = hit.address?.county || hit.address?.state_district || 'Andhra Pradesh';

    const cleanId = `scraped-${query.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const location: Location = {
      id: cleanId,
      name: `${cityOrTown} (RTC Bus Stand)`,
      city: cityOrTown,
      district,
      type: 'stop',
      coordinates: { lat, lng: lon },
      amenity: hit.type === 'station' ? 'bus_station' : 'stop',
      source: 'osm_live',
      simulated: true,
    };

    // Find nearest known terminal/depot hub
    const repo = DemoRepository.getInstance();
    const existingLocations = repo.getLocations();
    let nearestHub: Location | undefined;
    let minDistance = Infinity;

    for (const loc of existingLocations) {
      if (loc.coordinates && loc.id !== cleanId) {
        const d = calculateHaversineDistanceKm(lat, lon, loc.coordinates.lat, loc.coordinates.lng);
        if (d < minDistance) {
          minDistance = d;
          nearestHub = loc;
        }
      }
    }

    const hub = nearestHub || existingLocations[0] || FALLBACK_AP_HUB;
    const synthesizedServices = this.buildConnectingServices(
      location,
      hub,
      minDistance === Infinity ? 45 : minDistance,
      simulatedDate,
      false
    );

    return {
      location,
      nearestHub: hub,
      distanceToNearestHubKm: minDistance === Infinity ? 45 : minDistance,
      synthesizedServices,
      source: 'osm_live',
      confidence: 0.95,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Resolves query from the offline curated AP Places database.
   */
  private resolveOfflineAPPlace(
    query: string,
    simulatedDate: string
  ): ScrapedLocationResult | null {
    const q = query.toLowerCase().trim();
    // 1. Check comprehensive 110+ stations first (exact matches first)
    const compExact = AP_COMPREHENSIVE_STATIONS.find(
      (p) =>
        p.city.toLowerCase() === q ||
        p.name.toLowerCase() === q ||
        p.aliases.some((a) => a.toLowerCase() === q)
    );
    const comp = compExact || AP_COMPREHENSIVE_STATIONS.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
    );

    const offlineExact = OFFLINE_AP_PLACES.find(
      (p) =>
        p.city.toLowerCase() === q ||
        p.name.toLowerCase() === q ||
        p.aliases.some((a) => a.toLowerCase() === q)
    );
    const offlinePartial = OFFLINE_AP_PLACES.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
    );

    const match = comp
      ? {
          id: comp.id,
          name: comp.name,
          city: comp.city,
          district: comp.district,
          type: comp.type,
          lat: comp.coordinates.lat,
          lng: comp.coordinates.lng,
          nearestHubId: comp.nearestHubId,
          isGhatOrHilly: comp.isGhatOrHilly,
        }
      : (offlineExact || offlinePartial);

    if (!match) return null;

    const location: Location = {
      id: match.id,
      name: match.name,
      city: match.city,
      district: match.district,
      type: match.type,
      coordinates: { lat: match.lat, lng: match.lng },
      source: 'scraped_ap',
      simulated: true,
    };

    const repo = DemoRepository.getInstance();
    let nearestHub = repo.getLocationById(match.nearestHubId);
    if (!nearestHub) {
      const hubPlace = OFFLINE_AP_PLACES.find((p) => p.id === match.nearestHubId);
      if (hubPlace) {
        nearestHub = {
          id: hubPlace.id,
          name: hubPlace.name,
          city: hubPlace.city,
          district: hubPlace.district,
          type: hubPlace.type,
          coordinates: { lat: hubPlace.lat, lng: hubPlace.lng },
          source: 'scraped_ap',
          simulated: true,
        };
        repo.addLocation(nearestHub);

        // Also connect this hub to its destination hub (e.g. Narsipatnam -> Rajahmundry)
        const onwardHub = repo.getLocationById(hubPlace.nearestHubId) || repo.getLocations()[0] || FALLBACK_AP_HUB;
        const hubDist = calculateHaversineDistanceKm(
          hubPlace.lat,
          hubPlace.lng,
          onwardHub.coordinates?.lat || 16.98,
          onwardHub.coordinates?.lng || 81.78
        );
        const hubServices = this.buildConnectingServices(
          nearestHub,
          onwardHub,
          hubDist,
          simulatedDate,
          hubPlace.isGhatOrHilly || false
        );
        for (const s of hubServices) {
          repo.addService(s);
        }
      } else {
        nearestHub = repo.getLocations()[0] || FALLBACK_AP_HUB;
      }
    }

    const distanceKm = calculateHaversineDistanceKm(
      match.lat,
      match.lng,
      nearestHub.coordinates?.lat || 17.72,
      nearestHub.coordinates?.lng || 83.30
    );

    const synthesizedServices = this.buildConnectingServices(
      location,
      nearestHub,
      distanceKm,
      simulatedDate,
      match.isGhatOrHilly || false
    );

    return {
      location,
      nearestHub,
      distanceToNearestHubKm: distanceKm,
      synthesizedServices,
      source: 'scraped_ap',
      confidence: 0.99,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Fallback for arbitrary locations: creates safe simulated transit point.
   */
  private synthesizeGenericLocation(
    query: string,
    simulatedDate: string
  ): ScrapedLocationResult {
    const title = query.charAt(0).toUpperCase() + query.slice(1);
    const cleanId = `loc-${query.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const repo = DemoRepository.getInstance();
    const nearestHub = repo.getLocations()[0] || FALLBACK_AP_HUB; // Default to Vizag RTC Complex

    const location: Location = {
      id: cleanId,
      name: `${title} RTC Junction`,
      city: title,
      district: 'Andhra Pradesh',
      type: 'stop',
      coordinates: { lat: 17.70, lng: 83.25 },
      source: 'simulated',
      simulated: true,
    };

    const synthesizedServices = this.buildConnectingServices(
      location,
      nearestHub,
      35,
      simulatedDate,
      false
    );

    return {
      location,
      nearestHub,
      distanceToNearestHubKm: 35,
      synthesizedServices,
      source: 'offline_ap',
      confidence: 0.85,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Synthesizes validated, feasible APSRTC schedules between a location and its hub.
   * Conforms strictly to TransportService schema.
   */
  public buildConnectingServices(
    origin: Location,
    destination: Location,
    distanceKm: number,
    simulatedDate: string,
    isGhat: boolean
  ): TransportService[] {
    if (
      origin.id === destination.id ||
      origin.name.toLowerCase() === destination.name.toLowerCase() ||
      (origin.city.toLowerCase() === destination.city.toLowerCase() &&
        (origin.name.includes(destination.city) || destination.name.includes(origin.city)))
    ) {
      return [];
    }

    const services: TransportService[] = [];
    const roadDist = Math.max(15, Math.round(distanceKm * 1.25));
    const speedKmh = isGhat ? 30 : 42;
    const durationMinutes = Math.round((roadDist / speedKmh) * 60);

    // Standard schedule departures across morning, afternoon, and evening (10 slots -> 20 services round trip)
    const scheduleSlots = [
      { time: '06:00', type: 'Pallevelugu' as const, rate: 1.15, class: 'seater' as const },
      { time: '07:15', type: 'Express' as const, rate: 1.35, class: 'seater' as const },
      { time: '08:30', type: 'Super Luxury' as const, rate: 1.65, class: 'semi-sleeper' as const },
      { time: '10:00', type: 'Pallevelugu' as const, rate: 1.15, class: 'seater' as const },
      { time: '11:30', type: 'Express' as const, rate: 1.35, class: 'seater' as const },
      { time: '13:00', type: 'Pallevelugu' as const, rate: 1.15, class: 'seater' as const },
      { time: '14:30', type: 'Super Luxury' as const, rate: 1.65, class: 'semi-sleeper' as const },
      { time: '16:00', type: 'Express' as const, rate: 1.35, class: 'seater' as const },
      { time: '17:30', type: 'Pallevelugu' as const, rate: 1.15, class: 'seater' as const },
      { time: '19:15', type: 'Super Luxury' as const, rate: 1.65, class: 'semi-sleeper' as const },
    ];

    for (let i = 0; i < scheduleSlots.length; i++) {
      const slot = scheduleSlots[i];
      const fare = Math.max(30, Math.round(roadDist * slot.rate));
      const depIso = `${simulatedDate}T${slot.time}:00+05:30`;
      const arrIso = addMinutesToIso(depIso, durationMinutes);

      // Outbound (Origin -> Destination)
      const outboundService: TransportService = {
        id: `srv-scraped-${origin.id}-${destination.id}-${i + 1}`,
        serviceNumber: `APSRTC-${slot.type.substring(0, 3).toUpperCase()}-${origin.city.substring(0, 3).toUpperCase()}-${destination.city.substring(0, 3).toUpperCase()}-${slot.time.replace(':', '')}`,
        operatorId: 'op-apsrtc',
        operatorName: `APSRTC ${slot.type}`,
        mode: 'bus',
        busType: slot.type,
        originId: origin.id,
        destinationId: destination.id,
        departureTime: depIso,
        arrivalTime: arrIso,
        fareInr: fare,
        seatClass: slot.class,
        totalCapacity: slot.type === 'Super Luxury' ? 36 : 44,
        confirmedSeats: 12,
        heldSeats: 0,
        hasLuggageSpace: true,
        isAccessible: true,
        status: 'scheduled',
        routeCode: `APSRTC-${origin.city}-${destination.city}`,
        delayMinutes: 0,
        distanceKm: roadDist,
        simulated: true,
      };

      // Inbound (Destination -> Origin)
      const inboundDepIso = addMinutesToIso(depIso, 45); // Return leg after turnaround
      const inboundArrIso = addMinutesToIso(inboundDepIso, durationMinutes);
      const inboundService: TransportService = {
        id: `srv-scraped-${destination.id}-${origin.id}-${i + 1}`,
        serviceNumber: `APSRTC-${slot.type.substring(0, 3).toUpperCase()}-${destination.city.substring(0, 3).toUpperCase()}-${origin.city.substring(0, 3).toUpperCase()}-${slot.time.replace(':', '')}`,
        operatorId: 'op-apsrtc',
        operatorName: `APSRTC ${slot.type}`,
        mode: 'bus',
        busType: slot.type,
        originId: destination.id,
        destinationId: origin.id,
        departureTime: inboundDepIso,
        arrivalTime: inboundArrIso,
        fareInr: fare,
        seatClass: slot.class,
        totalCapacity: slot.type === 'Super Luxury' ? 36 : 44,
        confirmedSeats: 14,
        heldSeats: 0,
        hasLuggageSpace: true,
        isAccessible: true,
        status: 'scheduled',
        routeCode: `APSRTC-${destination.city}-${origin.city}`,
        delayMinutes: 0,
        distanceKm: roadDist,
        simulated: true,
      };

      services.push(outboundService, inboundService);
    }

    return services;
  }
}

export const locationScraper = LocationScraperService.getInstance();
