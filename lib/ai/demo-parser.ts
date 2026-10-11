// Prayanam - Deterministic Demo Parser with Robust Speech Normalization
import { IConstraintParser, TripConstraintsSchema } from './parser-interface';
import { TripConstraints } from '../domain/types';

interface HubDefinition {
  name: string;
  locationId: string;
  aliases: string[];
}

const KNOWN_HUBS: HubDefinition[] = [
  // Visakhapatnam & Stops
  {
    name: 'Visakhapatnam',
    locationId: 'vizag-rtc',
    aliases: ['visakhapatnam', 'vizag', 'vaizag', 'వైజాగ్', 'విశాఖపట్నం', 'విశాఖ', 'visakha', 'dwaraka', 'rtc complex', 'why zag', 'vizac', 'vishakapatnam', 'visakapatnam'],
  },
  {
    name: 'Maddilapalem Junction, Vizag',
    locationId: 'vizag-maddilapalem',
    aliases: ['maddilapalem', 'మద్దిలపాలెం', 'madilapalem'],
  },
  {
    name: 'Gajuwaka Junction, Vizag',
    locationId: 'vizag-gajuwaka',
    aliases: ['gajuwaka', 'గాజువాక', 'gajuwaka junction', 'gaju vaka'],
  },

  // Hyderabad
  {
    name: 'HITEC City, Hyderabad',
    locationId: 'hyd-hitec-city',
    aliases: ['hitec city', 'cyber towers', 'hitech city', 'హైటెక్ సిటీ', 'hyderabad', 'హైదరాబాద్', 'hyd'],
  },
  {
    name: 'Gachibowli, Hyderabad',
    locationId: 'hyd-gachibowli',
    aliases: ['gachibowli', 'గచ్చిబౌలి', 'financial district'],
  },
  {
    name: 'LB Nagar, Hyderabad',
    locationId: 'hyd-lb-nagar',
    aliases: ['lb nagar', 'ఎల్బీ నగర్', 'l b nagar'],
  },
  {
    name: 'Mahatma Gandhi Bus Station (MGBS), Hyderabad',
    locationId: 'hyd-mgbs',
    aliases: ['mgbs', 'imlibun', 'ఎంజీబీఎస్', 'bus station terminal'],
  },

  // Tirupati & Tirumala
  {
    name: 'Tirumala Bus Station (CRO)',
    locationId: 'stop-trm-cro',
    aliases: ['tirumala', 'తిరుమల', 'thirumala', 'tirumalla', 'cro', 'balaji temple', 'venkateswara'],
  },
  {
    name: 'Tirupati Central Bus Station',
    locationId: 'stop-tpt-cbs',
    aliases: ['tirupati', 'తిరుపతి', 'tirupathi', 'tripati', 'thirupathi', 'tpt', 'cbs'],
  },
  {
    name: 'Srikalahasti RTC Stand',
    locationId: 'stop-skht-cbs',
    aliases: ['srikalahasti', 'శ్రీకాళహస్తి', 'kalahasti', 'sri kalahasti'],
  },

  // Araku Valley
  {
    name: 'Araku Valley Bus Station',
    locationId: 'stop-araku-bus',
    aliases: ['araku', 'అరకు', 'araku valley', 'arak', 'aruku', 'a raccoon', 'araku bus'],
  },
  {
    name: 'Borra Caves Junction',
    locationId: 'stop-borra',
    aliases: ['borra caves', 'బొర్రా గుహలు', 'borra', 'bora caves'],
  },

  // Vijayawada & Amaravati
  {
    name: 'Amaravati Dhyana Buddha Heritage',
    locationId: 'stop-amr-temple',
    aliases: ['amaravati', 'అమరావతి', 'dhyana buddha', 'amaravathi'],
  },
  {
    name: 'Vijayawada PNBS',
    locationId: 'stop-vja-pnbs',
    aliases: ['vijayawada', 'విజయవాడ', 'pnbs', 'bejawada', 'bezawada', 'vja', 'vijay wada', 'vijayavada'],
  },
  {
    name: 'Guntur NTR Bus Station',
    locationId: 'stop-gnt-cbs',
    aliases: ['guntur', 'గుంటూరు', 'guntur cbs'],
  },

  // Gandikota & Belum Caves
  {
    name: 'Gandikota Fort Heritage Hub',
    locationId: 'stop-gandikota',
    aliases: ['gandikota', 'గండికోట', 'gandi kota', 'grand canyon of india'],
  },
  {
    name: 'Belum Caves Entrance Hub',
    locationId: 'stop-belum-caves',
    aliases: ['belum caves', 'బెలుం గుహలు', 'belum', 'bellam caves', 'bellam', 'balloon caves'],
  },
  {
    name: 'Kadapa Central Bus Station',
    locationId: 'stop-kadapa-cbs',
    aliases: ['kadapa', 'కడప', 'cuddapah'],
  },
  {
    name: 'Kurnool RTC Central Stand',
    locationId: 'stop-kurnool-cbs',
    aliases: ['kurnool', 'కర్నూలు', 'kurnul'],
  },
  {
    name: 'Jammalamadugu RTC Bus Station',
    locationId: 'stop-jmdg-cbs',
    aliases: ['jammalamadugu', 'జమ్మలమడుగు'],
  },

  // Rajahmundry & Maredumilli
  {
    name: 'Maredumilli Eco-Tourism Center',
    locationId: 'stop-maredumilli',
    aliases: ['maredumilli', 'మారేడుమిల్లి', 'maredmilli', 'maredumalli', 'valamuru'],
  },
  {
    name: 'Rajahmundry Central Bus Stand',
    locationId: 'stop-rjy-cbs',
    aliases: ['rajahmundry', 'రాజమండ్రి', 'rajamahendravaram', 'rajamundry', 'rjy'],
  },
  {
    name: 'Polavaram / Papikondalu Boat Point',
    locationId: 'stop-polavaram',
    aliases: ['polavaram', 'పోలవరం', 'papikondalu', 'papi hills'],
  },
  {
    name: 'Kakinada RTC Complex',
    locationId: 'stop-kakinada-cbs',
    aliases: ['kakinada', 'కాకినాడ'],
  },

  // Lepakshi
  {
    name: 'Lepakshi Veerabhadra Temple',
    locationId: 'stop-lepakshi-temple',
    aliases: ['lepakshi', 'లేపాక్షి', 'veerabhadra', 'lepaksi', 'lay pakshi'],
  },
  {
    name: 'Hindupur RTC Bus Station',
    locationId: 'stop-hindupur-cbs',
    aliases: ['hindupur', 'హిందూపురం'],
  },
  {
    name: 'Bengaluru Majestic CBS',
    locationId: 'stop-blr-majestic',
    aliases: ['bengaluru', 'bangalore', 'బెంగళూరు', 'majestic'],
  },
  {
    name: 'Anantapur RTC Central Stand',
    locationId: 'stop-anantapur-cbs',
    aliases: ['anantapur', 'అనంతపురం'],
  },
  // Regional Andhra Pradesh / Scraped Network Hubs
  {
    name: 'Lambasingi Hill View Point',
    locationId: 'stop-lambasingi',
    aliases: ['lambasingi', 'లంబసింగి', 'lammasingi', 'kashmir of andhra'],
  },
  {
    name: 'Narsipatnam RTC Depot',
    locationId: 'stop-narsipatnam-cbs',
    aliases: ['narsipatnam', 'నర్సీపట్నం', 'narseepatnam'],
  },
  {
    name: 'Srisailam RTC Complex',
    locationId: 'stop-srisailam-cbs',
    aliases: ['srisailam', 'శ్రీశైలం', 'srisaila', 'mallikarjuna'],
  },
  {
    name: 'Ahobilam Narasimha Hub',
    locationId: 'stop-ahobilam-temple',
    aliases: ['ahobilam', 'అహోబిలం'],
  },
  {
    name: 'Horsley Hills Hill Resort',
    locationId: 'stop-horsley-hills',
    aliases: ['horsley hills', 'హార్స్లీ హిల్స్', 'horsley'],
  },
  {
    name: 'Madanapalle RTC Stand',
    locationId: 'stop-madanapalle-cbs',
    aliases: ['madanapalle', 'మదనపల్లె', 'madanapalli'],
  },
  {
    name: 'Chittoor RTC Stand',
    locationId: 'stop-chittoor-cbs',
    aliases: ['chittoor', 'చిత్తూరు'],
  },
  {
    name: 'Eluru New Bus Stand',
    locationId: 'stop-eluru-cbs',
    aliases: ['eluru', 'ఏలూరు'],
  },
  {
    name: 'Ongole Central Bus Stand',
    locationId: 'stop-ongole-cbs',
    aliases: ['ongole', 'ఒంగోలు'],
  },
  {
    name: 'Nellore Atmakur Bus Station',
    locationId: 'stop-nellore-cbs',
    aliases: ['nellore', 'నెల్లూరు'],
  },
  {
    name: 'Srikakulam RTC Complex',
    locationId: 'stop-srikakulam-cbs',
    aliases: ['srikakulam', 'శ్రీకాకుళం'],
  },
  {
    name: 'Vizianagaram RTC Complex',
    locationId: 'stop-vizianagaram-cbs',
    aliases: ['vizianagaram', 'విజయనగరం'],
  },
];

import { locationScraper } from '../services/location-scraper-service';

export class DemoConstraintParser implements IConstraintParser {
  async parseRequest(
    text: string,
    languageHint: string = 'en',
    currentSimulatedDate = '2026-10-10'
  ): Promise<{
    constraints: TripConstraints;
    providerUsed: 'demo' | 'groq';
    clarifications: string[];
    rawParsed?: unknown;
  }> {
    // 1. Phonetic speech cleanup
    let cleaned = text.toLowerCase()
      .replace(/\bwhy\s*zag\b/g, 'vizag')
      .replace(/\bvizac\b/g, 'vizag')
      .replace(/\bvaizag\b/g, 'vizag')
      .replace(/\bbejawada\b/g, 'vijayawada')
      .replace(/\bbezawada\b/g, 'vijayawada')
      .replace(/\bvijay\s*wada\b/g, 'vijayawada')
      .replace(/\btripati\b/g, 'tirupati')
      .replace(/\btirupathi\b/g, 'tirupati')
      .replace(/\bthirumala\b/g, 'tirumala')
      .replace(/\btirumalla\b/g, 'tirumala')
      .replace(/\ba\s*raccoon\b/g, 'araku')
      .replace(/\baruk\b/g, 'araku')
      .replace(/\bgandi\s*kota\b/g, 'gandikota')
      .replace(/\bballoon\s*caves\b/g, 'belum caves')
      .replace(/\bbellam\s*caves\b/g, 'belum caves')
      .replace(/\blay\s*pakshi\b/g, 'lepakshi')
      .replace(/\brajamahendravaram\b/g, 'rajahmundry');

    const clarifications: string[] = [];

    // Language detection
    const isTelugu =
      languageHint === 'te' ||
      /[\u0C00-\u0C7F]/.test(text) ||
      cleaned.includes('వైజాగ్') ||
      cleaned.includes('హైదరాబాద్') ||
      cleaned.includes('కావాలి') ||
      cleaned.includes('నగదు');

    // 2. Hub entity detection with text positions
    interface FoundHub {
      hub: HubDefinition;
      pos: number;
      matchedAlias: string;
    }
    const foundHubs: FoundHub[] = [];

    for (const hub of KNOWN_HUBS) {
      for (const alias of hub.aliases) {
        const idx = cleaned.indexOf(alias);
        if (idx !== -1) {
          if (!foundHubs.some((fh) => fh.hub.locationId === hub.locationId)) {
            foundHubs.push({ hub, pos: idx, matchedAlias: alias });
          }
          break;
        }
      }
    }

    // Prioritize specific terminals over generic city hubs if both match (e.g. MGBS over generic Hyderabad)
    const hasSpecificHyd = foundHubs.some((fh) => ['hyd-mgbs', 'hyd-gachibowli', 'hyd-lb-nagar'].includes(fh.hub.locationId));
    const filteredHubs = hasSpecificHyd 
      ? foundHubs.filter((fh) => fh.hub.locationId !== 'hyd-hitec-city' || fh.matchedAlias === 'hitec city')
      : foundHubs;

    // Sort by appearance in string
    filteredHubs.sort((a, b) => a.pos - b.pos);

    let origin = 'Visakhapatnam';
    let originLocationId = 'vizag-rtc';
    let destination = 'HITEC City, Hyderabad';
    let destinationLocationId = 'hyd-hitec-city';

    if (filteredHubs.length >= 2) {
      const first = filteredHubs[0];
      const second = filteredHubs[1];

      const textBeforeFirst = cleaned.substring(0, first.pos).trim();
      const textBetween = cleaned.substring(first.pos + first.matchedAlias.length, second.pos).trim();

      // Detection of reverse phrasing: "To <Destination> from <Origin>" or "<Dest> ki <Origin> nunchi"
      const firstIsPrecededByTo = /^(to|reach|visit)\b|\b(to|reach|visit)$/.test(textBeforeFirst);
      const secondIsPrecededByFrom = /\b(from|starting\s*from)\b/.test(textBetween);
      const isReverse = firstIsPrecededByTo && secondIsPrecededByFrom;

      if (isReverse) {
        // Reverse order: Destination is first, Origin is second
        destination = first.hub.name;
        destinationLocationId = first.hub.locationId;
        origin = second.hub.name;
        originLocationId = second.hub.locationId;
      } else {
        // Natural order: First is Origin, Second is Destination
        // Covers: "from X to Y", "X to Y", "X nunchi Y", "X నుండి Y", "X nunchi Y ki"
        origin = first.hub.name;
        originLocationId = first.hub.locationId;
        destination = second.hub.name;
        destinationLocationId = second.hub.locationId;
      }
    } else if (filteredHubs.length === 1) {
      // Single hub found - determine whether it's origin or destination
      const single = filteredHubs[0];
      const textBefore = cleaned.substring(0, single.pos);
      const isDestinationHint =
        /\b(to|reach|visit|ki|కి|tak|destination|చూడాలి|వెళ్ళాలి)\b/.test(textBefore) ||
        cleaned.includes('to ' + single.matchedAlias) ||
        cleaned.includes(single.matchedAlias + ' ki') ||
        ['stop-trm-cro', 'stop-araku-bus', 'stop-amr-temple', 'stop-gandikota', 'stop-belum-caves', 'stop-maredumilli', 'stop-lepakshi-temple', 'hyd-mgbs', 'hyd-hitec-city'].includes(single.hub.locationId);

      if (isDestinationHint) {
        destination = single.hub.name;
        destinationLocationId = single.hub.locationId;

        // Logical origin pair
        if (single.hub.locationId === 'stop-trm-cro' || single.hub.locationId === 'stop-skht-cbs') {
          origin = 'Tirupati Central Bus Station';
          originLocationId = 'stop-tpt-cbs';
        } else if (single.hub.locationId === 'stop-araku-bus' || single.hub.locationId === 'stop-borra') {
          origin = 'Visakhapatnam';
          originLocationId = 'vizag-rtc';
        } else if (single.hub.locationId === 'stop-amr-temple') {
          origin = 'Vijayawada PNBS';
          originLocationId = 'stop-vja-pnbs';
        } else if (single.hub.locationId === 'stop-gandikota') {
          origin = 'Kadapa Central Bus Station';
          originLocationId = 'stop-kadapa-cbs';
        } else if (single.hub.locationId === 'stop-belum-caves') {
          origin = 'Kurnool RTC Central Stand';
          originLocationId = 'stop-kurnool-cbs';
        } else if (single.hub.locationId === 'stop-maredumilli' || single.hub.locationId === 'stop-polavaram') {
          origin = 'Rajahmundry Central Bus Stand';
          originLocationId = 'stop-rjy-cbs';
        } else if (single.hub.locationId === 'stop-lepakshi-temple') {
          origin = 'Hindupur RTC Bus Station';
          originLocationId = 'stop-hindupur-cbs';
        } else {
          origin = 'Visakhapatnam';
          originLocationId = 'vizag-rtc';
        }
      } else {
        // Assume origin
        origin = single.hub.name;
        originLocationId = single.hub.locationId;

        // Logical destination pair
        if (originLocationId === 'stop-tpt-cbs') {
          destination = 'Tirumala Bus Station (CRO)';
          destinationLocationId = 'stop-trm-cro';
        } else if (originLocationId === 'stop-vja-pnbs') {
          destination = 'Amaravati Dhyana Buddha Heritage';
          destinationLocationId = 'stop-amr-temple';
        } else if (originLocationId === 'stop-kadapa-cbs') {
          destination = 'Gandikota Fort Heritage Hub';
          destinationLocationId = 'stop-gandikota';
        } else if (originLocationId === 'stop-kurnool-cbs') {
          destination = 'Belum Caves Entrance Hub';
          destinationLocationId = 'stop-belum-caves';
        } else if (originLocationId === 'stop-rjy-cbs') {
          destination = 'Maredumilli Eco-Tourism Center';
          destinationLocationId = 'stop-maredumilli';
        } else if (originLocationId === 'stop-hindupur-cbs') {
          destination = 'Lepakshi Veerabhadra Temple';
          destinationLocationId = 'stop-lepakshi-temple';
        } else {
          destination = 'HITEC City, Hyderabad';
          destinationLocationId = 'hyd-hitec-city';
        }
      }
    }

    // Dynamic Location Intelligence: Check for "via" waypoint or custom "from X to Y"
    const viaWaypoints: string[] = [];
    const viaMatch = text.match(/\b(?:via|through|గుండా|ద్వారా)\s+([^,.;\n]+?)(?=[,.;]|\s+(?:to|reach|reach\s*by|by|before|at|\d)|$)/i);
    if (viaMatch) {
      const viaTerm = viaMatch[1].replace(/[,;.]/g, '').trim();
      try {
        const viaLoc = await locationScraper.resolveLocation(viaTerm, currentSimulatedDate);
        if (viaLoc) {
          viaWaypoints.push(viaLoc.location.id);
          clarifications.push(`Waypoint connection: ${viaLoc.location.name} (Source: ${viaLoc.source}).`);
        }
      } catch (e) {
        // Safe fallback
      }
    }

    if (filteredHubs.length < 2) {
      const fromToMatch = text.match(/\b(?:from|నుండి|nunchi)\s+([a-zA-Z\u0C00-\u0C7F\s]+?)\s+(?:to|కి|ki)\s+([a-zA-Z\u0C00-\u0C7F\s]+?)(?=\s+(?:via|by|reach|before|at|\d|$))/i);
      if (fromToMatch) {
        const oTerm = fromToMatch[1].trim();
        const dTerm = fromToMatch[2].trim();
        try {
          const oRes = await locationScraper.resolveLocation(oTerm, currentSimulatedDate);
          const dRes = await locationScraper.resolveLocation(dTerm, currentSimulatedDate);
          if (oRes && dRes) {
            origin = oRes.location.name;
            originLocationId = oRes.location.id;
            destination = dRes.location.name;
            destinationLocationId = dRes.location.id;
            clarifications.push(`Discovered locations via location intelligence: ${origin} → ${destination} (${oRes.source}).`);
          }
        } catch (e) {
          // Safe fallback
        }
      }
    }

    // 3. Arrival Deadline Detection
    let deadlineHour = 9;
    let deadlineMinute = 0;
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM|గంటలకు)/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = (timeMatch[3] || '').toLowerCase();
      if (meridiem === 'pm' && h < 12) h += 12;
      if (meridiem === 'am' && h === 12) h = 0;
      deadlineHour = h;
      deadlineMinute = m;
    } else if (cleaned.includes('8:30') || cleaned.includes('8.30')) {
      deadlineHour = 8;
      deadlineMinute = 30;
    }

    const nextDate = '2026-10-11';
    const arrivalDeadline = `${nextDate}T${String(deadlineHour).padStart(2, '0')}:${String(
      deadlineMinute
    ).padStart(2, '0')}:00+05:30`;

    // 4. Budget Extraction
    let budgetInr = 1000;
    const budgetMatch = text.match(/(?:₹|rs\.?|inr|రూ|రూపాయలు)?\s*(\d{3,5})/i);
    if (budgetMatch && parseInt(budgetMatch[1], 10) >= 100) {
      budgetInr = parseInt(budgetMatch[1], 10);
    } else if (cleaned.includes('low budget') || cleaned.includes('తక్కువ బడ్జెట్')) {
      budgetInr = 1200;
    } else if (cleaned.includes('high') || cleaned.includes('premium')) {
      budgetInr = 1600;
    }

    // 5. Seat Class
    let preferredClass: 'sleeper' | 'seater' | 'semi-sleeper' | 'any' = 'sleeper';
    if (cleaned.includes('seater') || cleaned.includes('సీటర్')) {
      preferredClass = 'seater';
    } else if (cleaned.includes('semi-sleeper') || cleaned.includes('సెమీ స్లీపర్')) {
      preferredClass = 'semi-sleeper';
    } else if (cleaned.includes('any') || cleaned.includes('ఏదైనా')) {
      preferredClass = 'any';
    }

    // 6. Luggage
    const hasLuggage =
      cleaned.includes('luggage') ||
      cleaned.includes('bag') ||
      cleaned.includes('లగేజ్') ||
      cleaned.includes('లగేజీ') ||
      cleaned.includes('సామాను');

    // 7. Accessibility Needs
    const accessibilityNeeds: string[] = [];
    if (
      cleaned.includes('wheelchair') ||
      cleaned.includes('wheel chair') ||
      cleaned.includes('వీల్‌చైర్')
    ) {
      accessibilityNeeds.push('wheelchair_boarding');
    }
    if (
      cleaned.includes('senior') ||
      cleaned.includes('elderly') ||
      cleaned.includes('సీనియర్') ||
      cleaned.includes('పెద్దవారు')
    ) {
      accessibilityNeeds.push('senior_lower_berth');
    }

    // 8. Clarifications needed
    clarifications.push('Simulated schedule date 2026-10-10 selected (overnight journey to 2026-10-11).');
    if (!budgetMatch && !cleaned.includes('budget') && !cleaned.includes('బడ్జెట్')) {
      clarifications.push('Budget scope assumed to be standard economic limit (₹1,000 per person).');
    }

    const candidate: TripConstraints = {
      origin,
      destination,
      originLocationId,
      destinationLocationId,
      departureDate: currentSimulatedDate,
      earliestDeparture: `${currentSimulatedDate}T19:00:00+05:30`,
      arrivalDeadline,
      passengers: 1,
      budgetInr,
      budgetScope: 'per_person',
      preferredClass,
      hasLuggage,
      accessibilityNeeds,
      maxTransfers: 1,
      language: isTelugu ? 'te' : (languageHint || 'en'),
      hardConstraints: ['arrivalDeadline', 'budgetInr'],
      softPreferences: [preferredClass !== 'any' ? 'preferredClass' : ''],
      clarificationNeeded: clarifications,
      viaWaypoints: viaWaypoints.length > 0 ? viaWaypoints : undefined,
      dataSource: (originLocationId.startsWith('scraped-') || originLocationId.startsWith('stop-lambasingi') || destinationLocationId.startsWith('scraped-') || destinationLocationId.startsWith('stop-narsipatnam')) ? 'scraped_live' : 'verified_timetable',
    };

    const validated = TripConstraintsSchema.parse(candidate);
    return {
      constraints: validated,
      providerUsed: 'demo',
      clarifications,
    };
  }
}
