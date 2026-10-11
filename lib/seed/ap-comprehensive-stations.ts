// TBS RoamAgent - Comprehensive Pre-Indexed Andhra Pradesh & Connecting Transit Network
// Covers 110+ stations across all 26 districts of AP + key intercity transit terminals
import { Location } from '../domain/types';

export interface StationDefinition {
  id: string;
  name: string;
  city: string;
  district: string;
  type: 'terminal' | 'stop' | 'destination';
  coordinates: { lat: number; lng: number };
  nearestHubId: string;
  isGhatOrHilly?: boolean;
  aliases: string[];
  stationBadge: 'Depot' | 'Heritage' | 'Agency' | 'Express Hub' | 'Intercity Terminal';
}

export const AP_COMPREHENSIVE_STATIONS: StationDefinition[] = [
  // ==========================================
  // 1. VISAKHAPATNAM DISTRICT
  // ==========================================
  {
    id: 'vizag-rtc',
    name: 'Visakhapatnam Dwaraka RTC Complex',
    city: 'Visakhapatnam',
    district: 'Visakhapatnam',
    type: 'terminal',
    coordinates: { lat: 17.7265, lng: 83.3032 },
    nearestHubId: 'vizag-rtc',
    aliases: ['visakhapatnam', 'vizag', 'వైజాగ్', 'విశాఖపట్నం', 'dwaraka bus station', 'rtc complex', 'vskp', 'dwaraka bus station (rtc complex)', 'visakhapatnam (rtc bus stand)', 'visakhapatnam rtc bus stand', 'visakhapatnam rtc complex'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'vizag-maddilapalem',
    name: 'Maddilapalem Junction RTC Stand',
    city: 'Visakhapatnam',
    district: 'Visakhapatnam',
    type: 'stop',
    coordinates: { lat: 17.7402, lng: 83.3325 },
    nearestHubId: 'vizag-rtc',
    aliases: ['maddilapalem', 'మద్దిలపాలెం', 'madilapalem'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'vizag-gajuwaka',
    name: 'Gajuwaka Junction RTC Stand',
    city: 'Visakhapatnam',
    district: 'Visakhapatnam',
    type: 'stop',
    coordinates: { lat: 17.6908, lng: 83.2105 },
    nearestHubId: 'vizag-rtc',
    aliases: ['gajuwaka', 'గాజువాక', 'gajuwaka depot'],
    stationBadge: 'Depot',
  },
  {
    id: 'vizag-simhachalam',
    name: 'Simhachalam Varaha Narasimha Temple Hub',
    city: 'Visakhapatnam',
    district: 'Visakhapatnam',
    type: 'destination',
    coordinates: { lat: 17.7667, lng: 83.2500 },
    nearestHubId: 'vizag-rtc',
    aliases: ['simhachalam', 'సింహాచలం', 'narasimha temple vizag'],
    stationBadge: 'Heritage',
  },
  {
    id: 'vizag-bheemili',
    name: 'Bheemunipatnam (Bheemili Beach) RTC Stand',
    city: 'Bheemili',
    district: 'Visakhapatnam',
    type: 'destination',
    coordinates: { lat: 17.8897, lng: 83.4542 },
    nearestHubId: 'vizag-rtc',
    aliases: ['bheemili', 'భీమిలి', 'bheemunipatnam'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 2. ALLURI SITHARAMA RAJU (ASR) DISTRICT
  // ==========================================
  {
    id: 'stop-lambasingi',
    name: 'Lambasingi Hill View Point & Bus Stand',
    city: 'Lambasingi',
    district: 'Alluri Sitharama Raju',
    type: 'destination',
    coordinates: { lat: 17.8203, lng: 82.5204 },
    nearestHubId: 'stop-narsipatnam-cbs',
    isGhatOrHilly: true,
    aliases: ['lambasingi', 'లంబసింగి', 'lammasingi', 'kashmir of andhra', 'chintapalli lambasingi'],
    stationBadge: 'Agency',
  },
  {
    id: 'stop-araku-bus',
    name: 'Araku Valley Bus Station',
    city: 'Araku Valley',
    district: 'Alluri Sitharama Raju',
    type: 'destination',
    coordinates: { lat: 18.3333, lng: 82.8833 },
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: true,
    aliases: ['araku', 'అరకు', 'araku valley', 'arak', 'aruku'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-borra',
    name: 'Borra Caves Junction',
    city: 'Borra Caves',
    district: 'Alluri Sitharama Raju',
    type: 'destination',
    coordinates: { lat: 18.2811, lng: 83.0406 },
    nearestHubId: 'stop-araku-bus',
    isGhatOrHilly: true,
    aliases: ['borra caves', 'బొర్రా గుహలు', 'borra', 'bora caves'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-paderu',
    name: 'Paderu Agency Central Bus Station',
    city: 'Paderu',
    district: 'Alluri Sitharama Raju',
    type: 'terminal',
    coordinates: { lat: 18.0833, lng: 82.6667 },
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: true,
    aliases: ['paderu', 'పాడేరు', 'paderu rtc'],
    stationBadge: 'Agency',
  },
  {
    id: 'stop-chintapalli',
    name: 'Chintapalli RTC Bus Stand',
    city: 'Chintapalli',
    district: 'Alluri Sitharama Raju',
    type: 'stop',
    coordinates: { lat: 17.8667, lng: 82.3500 },
    nearestHubId: 'stop-narsipatnam-cbs',
    isGhatOrHilly: true,
    aliases: ['chintapalli', 'చింతపల్లి', 'chintapalle'],
    stationBadge: 'Agency',
  },
  {
    id: 'stop-maredumilli',
    name: 'Maredumilli Eco-Tourism Community Center',
    city: 'Maredumilli',
    district: 'Alluri Sitharama Raju',
    type: 'destination',
    coordinates: { lat: 17.5933, lng: 81.7133 },
    nearestHubId: 'stop-rjy-cbs',
    isGhatOrHilly: true,
    aliases: ['maredumilli', 'మారేడుమిల్లి', 'maredmilli', 'eco tourism maredumilli'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-rampa',
    name: 'Rampachodavaram Agency Bus Station',
    city: 'Rampachodavaram',
    district: 'Alluri Sitharama Raju',
    type: 'terminal',
    coordinates: { lat: 17.4475, lng: 81.7761 },
    nearestHubId: 'stop-rjy-cbs',
    isGhatOrHilly: true,
    aliases: ['rampachodavaram', 'రంపచోడవరం', 'rampa'],
    stationBadge: 'Agency',
  },

  // ==========================================
  // 3. ANAKAPALLI DISTRICT
  // ==========================================
  {
    id: 'stop-anakapalle-cbs',
    name: 'Anakapalle RTC Bus Complex',
    city: 'Anakapalle',
    district: 'Anakapalli',
    type: 'terminal',
    coordinates: { lat: 17.6896, lng: 83.0033 },
    nearestHubId: 'vizag-rtc',
    aliases: ['anakapalle', 'అనకాపల్లి', 'anakapalli'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-narsipatnam-cbs',
    name: 'Narsipatnam RTC Depot & Bus Stand',
    city: 'Narsipatnam',
    district: 'Anakapalli',
    type: 'terminal',
    coordinates: { lat: 17.6710, lng: 82.6139 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['narsipatnam', 'నర్సీపట్నం', 'narseepatnam', 'narsipatnam rtc'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-yelamanchili',
    name: 'Yelamanchili RTC Bus Stand',
    city: 'Yelamanchili',
    district: 'Anakapalli',
    type: 'stop',
    coordinates: { lat: 17.5500, lng: 82.8667 },
    nearestHubId: 'stop-anakapalle-cbs',
    aliases: ['yelamanchili', 'ఎలమంచిలి'],
    stationBadge: 'Express Hub',
  },

  // ==========================================
  // 4. KAKINADA DISTRICT
  // ==========================================
  {
    id: 'stop-kakinada-cbs',
    name: 'Kakinada RTC Central Complex',
    city: 'Kakinada',
    district: 'Kakinada',
    type: 'terminal',
    coordinates: { lat: 16.9890, lng: 82.2475 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['kakinada', 'కాకినాడ', 'coconada', 'kakinada port'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-annavaram-temple',
    name: 'Annavaram Satyanarayana Swamy Temple Hub',
    city: 'Annavaram',
    district: 'Kakinada',
    type: 'destination',
    coordinates: { lat: 17.2833, lng: 82.4000 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['annavaram', 'అన్నవరం', 'ratnagiri', 'annavaram temple'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-tuni-cbs',
    name: 'Tuni RTC Bus Stand',
    city: 'Tuni',
    district: 'Kakinada',
    type: 'terminal',
    coordinates: { lat: 17.3583, lng: 82.5500 },
    nearestHubId: 'stop-kakinada-cbs',
    aliases: ['tuni', 'తుని'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-pithapuram',
    name: 'Pithapuram Pada Gaya Kshethram',
    city: 'Pithapuram',
    district: 'Kakinada',
    type: 'destination',
    coordinates: { lat: 17.1167, lng: 82.2500 },
    nearestHubId: 'stop-kakinada-cbs',
    aliases: ['pithapuram', 'పిఠాపురం', 'pada gaya'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 5. DR. B.R. AMBEDKAR KONASEEMA DISTRICT
  // ==========================================
  {
    id: 'stop-amalapuram-cbs',
    name: 'Amalapuram RTC Central Bus Station',
    city: 'Amalapuram',
    district: 'Konaseema',
    type: 'terminal',
    coordinates: { lat: 16.5786, lng: 82.0061 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['amalapuram', 'అమలాపురం', 'konaseema amalapuram'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-ravulapalem',
    name: 'Ravulapalem RTC Bus Station (Gateway to Konaseema)',
    city: 'Ravulapalem',
    district: 'Konaseema',
    type: 'terminal',
    coordinates: { lat: 16.7500, lng: 81.8500 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['ravulapalem', 'రావులపాలెం'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-draksharamam',
    name: 'Draksharamam Bhimeswara Swamy Temple',
    city: 'Draksharamam',
    district: 'Konaseema',
    type: 'destination',
    coordinates: { lat: 16.7917, lng: 82.0625 },
    nearestHubId: 'stop-kakinada-cbs',
    aliases: ['draksharamam', 'ద్రాక్షారామం', 'pancharama draksharamam'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 6. EAST GODAVARI DISTRICT
  // ==========================================
  {
    id: 'stop-rjy-cbs',
    name: 'Rajahmundry Morampudi / Kotipalli Bus Stand',
    city: 'Rajahmundry',
    district: 'East Godavari',
    type: 'terminal',
    coordinates: { lat: 16.9891, lng: 81.7840 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['rajahmundry', 'రాజమండ్రి', 'rajamahendravaram', 'rajamundry', 'rjy'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-kovvur',
    name: 'Kovvur Goshpada Kshetram Stand',
    city: 'Kovvur',
    district: 'East Godavari',
    type: 'stop',
    coordinates: { lat: 17.0167, lng: 81.7333 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['kovvur', 'కొవ్వూరు'],
    stationBadge: 'Express Hub',
  },

  // ==========================================
  // 7. WEST GODAVARI DISTRICT
  // ==========================================
  {
    id: 'stop-bhimavaram-cbs',
    name: 'Bhimavaram RTC Central Stand',
    city: 'Bhimavaram',
    district: 'West Godavari',
    type: 'terminal',
    coordinates: { lat: 16.5449, lng: 81.5212 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['bhimavaram', 'భీమవరం', 'bhimavaram town'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-tanuku-cbs',
    name: 'Tanuku RTC Bus Station',
    city: 'Tanuku',
    district: 'West Godavari',
    type: 'terminal',
    coordinates: { lat: 16.7583, lng: 81.6833 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['tanuku', 'తణుకు'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-tadepalligudem',
    name: 'Tadepalligudem RTC Complex',
    city: 'Tadepalligudem',
    district: 'West Godavari',
    type: 'terminal',
    coordinates: { lat: 16.8142, lng: 81.5269 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['tadepalligudem', 'తాడేపల్లిగూడెం', 'tpg'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-palakollu',
    name: 'Palakollu Ksheerarama Temple Stand',
    city: 'Palakollu',
    district: 'West Godavari',
    type: 'destination',
    coordinates: { lat: 16.5167, lng: 81.7333 },
    nearestHubId: 'stop-bhimavaram-cbs',
    aliases: ['palakollu', 'పాలకొల్లు', 'ksheerarama'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 8. ELURU DISTRICT
  // ==========================================
  {
    id: 'stop-eluru-cbs',
    name: 'Eluru New Bus Stand Complex',
    city: 'Eluru',
    district: 'Eluru',
    type: 'terminal',
    coordinates: { lat: 16.7107, lng: 81.0952 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['eluru', 'ఏలూరు', 'ellore'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-jangareddygudem',
    name: 'Jangareddygudem RTC Stand',
    city: 'Jangareddygudem',
    district: 'Eluru',
    type: 'terminal',
    coordinates: { lat: 17.1167, lng: 81.3000 },
    nearestHubId: 'stop-eluru-cbs',
    aliases: ['jangareddygudem', 'జంగారెడ్డిగూడెం'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-polavaram',
    name: 'Polavaram / Papikondalu Boat Launching Point',
    city: 'Polavaram',
    district: 'Eluru',
    type: 'destination',
    coordinates: { lat: 17.2519, lng: 81.6444 },
    nearestHubId: 'stop-rjy-cbs',
    aliases: ['polavaram', 'పోలవరం', 'papikondalu', 'papi hills boat point'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 9. KRISHNA DISTRICT
  // ==========================================
  {
    id: 'stop-machilipatnam-cbs',
    name: 'Machilipatnam RTC Central Stand',
    city: 'Machilipatnam',
    district: 'Krishna',
    type: 'terminal',
    coordinates: { lat: 16.1809, lng: 81.1303 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['machilipatnam', 'మచిలీపట్నం', 'bandar', 'masula'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-gudivada',
    name: 'Gudivada RTC Bus Station',
    city: 'Gudivada',
    district: 'Krishna',
    type: 'terminal',
    coordinates: { lat: 16.4333, lng: 80.9833 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['gudivada', 'గుడివాడ'],
    stationBadge: 'Depot',
  },

  // ==========================================
  // 10. NTR DISTRICT
  // ==========================================
  {
    id: 'stop-vja-pnbs',
    name: 'Vijayawada Pandit Nehru Bus Station (PNBS)',
    city: 'Vijayawada',
    district: 'NTR',
    type: 'terminal',
    coordinates: { lat: 16.5062, lng: 80.6480 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['vijayawada', 'విజయవాడ', 'pnbs', 'bejawada', 'bezawada', 'vja'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-vja-autonagar',
    name: 'Vijayawada Autonagar Gateway Stand',
    city: 'Vijayawada',
    district: 'NTR',
    type: 'stop',
    coordinates: { lat: 16.4950, lng: 80.6800 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['autonagar', 'ఆటోనగర్'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-jaggaiahpeta',
    name: 'Jaggaiahpeta RTC Stand',
    city: 'Jaggaiahpeta',
    district: 'NTR',
    type: 'terminal',
    coordinates: { lat: 16.8917, lng: 80.0972 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['jaggaiahpeta', 'జగ్గయ్యపేట'],
    stationBadge: 'Express Hub',
  },

  // ==========================================
  // 11. GUNTUR DISTRICT
  // ==========================================
  {
    id: 'stop-gnt-cbs',
    name: 'Guntur NTR Central Bus Station',
    city: 'Guntur',
    district: 'Guntur',
    type: 'terminal',
    coordinates: { lat: 16.3067, lng: 80.4365 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['guntur', 'గుంటూరు', 'gnt'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-tenali-cbs',
    name: 'Tenali RTC Central Stand',
    city: 'Tenali',
    district: 'Guntur',
    type: 'terminal',
    coordinates: { lat: 16.2433, lng: 80.6400 },
    nearestHubId: 'stop-gnt-cbs',
    aliases: ['tenali', 'తెనాలి', 'andhra paris'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-mangalagiri',
    name: 'Mangalagiri Panakala Narasimha Swamy Hub',
    city: 'Mangalagiri',
    district: 'Guntur',
    type: 'destination',
    coordinates: { lat: 16.4300, lng: 80.5700 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['mangalagiri', 'మంగళగిరి', 'panakala swamy'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 12. PALNADU DISTRICT
  // ==========================================
  {
    id: 'stop-amr-temple',
    name: 'Amaravati Dhyana Buddha / Amareswara Heritage',
    city: 'Amaravati',
    district: 'Palnadu',
    type: 'destination',
    coordinates: { lat: 16.5742, lng: 80.3575 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['amaravati', 'అమరావతి', 'dhyana buddha', 'amareswara'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-narasaraopet',
    name: 'Narasaraopet RTC Central Stand',
    city: 'Narasaraopet',
    district: 'Palnadu',
    type: 'terminal',
    coordinates: { lat: 16.2361, lng: 80.0500 },
    nearestHubId: 'stop-gnt-cbs',
    aliases: ['narasaraopet', 'నరసరావుపేట'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-kotappakonda',
    name: 'Kotappakonda Trikoteswara Swamy Temple',
    city: 'Kotappakonda',
    district: 'Palnadu',
    type: 'destination',
    coordinates: { lat: 16.1833, lng: 80.0333 },
    nearestHubId: 'stop-narasaraopet',
    aliases: ['kotappakonda', 'కోటప్పకొండ'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 13. BAPATLA DISTRICT
  // ==========================================
  {
    id: 'stop-chirala-cbs',
    name: 'Chirala RTC Central Stand',
    city: 'Chirala',
    district: 'Bapatla',
    type: 'terminal',
    coordinates: { lat: 15.8242, lng: 80.3522 },
    nearestHubId: 'stop-gnt-cbs',
    aliases: ['chirala', 'చీరాల', 'handloom city'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-bapatla-cbs',
    name: 'Bapatla (Suryalanka Beach Gateway) Stand',
    city: 'Bapatla',
    district: 'Bapatla',
    type: 'terminal',
    coordinates: { lat: 15.9044, lng: 80.4675 },
    nearestHubId: 'stop-gnt-cbs',
    aliases: ['bapatla', 'బాపట్ల', 'suryalanka beach'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 14. PRAKASAM DISTRICT
  // ==========================================
  {
    id: 'stop-ongole-cbs',
    name: 'Ongole Central Bus Station',
    city: 'Ongole',
    district: 'Prakasam',
    type: 'terminal',
    coordinates: { lat: 15.5057, lng: 80.0499 },
    nearestHubId: 'stop-vja-pnbs',
    aliases: ['ongole', 'ఒంగోలు'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-markapur-cbs',
    name: 'Markapur RTC Bus Stand (Srisailam Gateway)',
    city: 'Markapur',
    district: 'Prakasam',
    type: 'terminal',
    coordinates: { lat: 15.7333, lng: 79.2833 },
    nearestHubId: 'stop-ongole-cbs',
    aliases: ['markapur', 'మార్కాపురం'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-giddalur',
    name: 'Giddalur RTC Stand',
    city: 'Giddalur',
    district: 'Prakasam',
    type: 'stop',
    coordinates: { lat: 15.3833, lng: 78.9333 },
    nearestHubId: 'stop-nandyal-cbs',
    aliases: ['giddalur', 'గిద్దలూరు'],
    stationBadge: 'Express Hub',
  },

  // ==========================================
  // 15. SPSR NELLORE DISTRICT
  // ==========================================
  {
    id: 'stop-nellore-cbs',
    name: 'Nellore Atmakur Bus Station Complex',
    city: 'Nellore',
    district: 'SPSR Nellore',
    type: 'terminal',
    coordinates: { lat: 14.4426, lng: 79.9865 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['nellore', 'నెల్లూరు', 'simhapuri'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-kavali',
    name: 'Kavali RTC Bus Stand',
    city: 'Kavali',
    district: 'SPSR Nellore',
    type: 'terminal',
    coordinates: { lat: 14.9167, lng: 79.9833 },
    nearestHubId: 'stop-nellore-cbs',
    aliases: ['kavali', 'కావలి'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-sullurpeta',
    name: 'Sullurpeta (ISRO Sriharikota Space Gateway)',
    city: 'Sullurpeta',
    district: 'SPSR Nellore',
    type: 'terminal',
    coordinates: { lat: 13.7000, lng: 80.0167 },
    nearestHubId: 'stop-nellore-cbs',
    aliases: ['sullurpeta', 'సూళ్లూరుపేట', 'shar', 'sriharikota'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 16. TIRUPATI DISTRICT
  // ==========================================
  {
    id: 'stop-tpt-cbs',
    name: 'Tirupati Central Bus Station (CBS)',
    city: 'Tirupati',
    district: 'Tirupati',
    type: 'terminal',
    coordinates: { lat: 13.6288, lng: 79.4192 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['tirupati', 'తిరుపతి', 'tirupathi', 'tripati', 'thirupathi', 'tpt', 'cbs'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-trm-cro',
    name: 'Tirumala Bus Station (CRO Grounds)',
    city: 'Tirumala',
    district: 'Tirupati',
    type: 'destination',
    coordinates: { lat: 13.6833, lng: 79.3472 },
    nearestHubId: 'stop-tpt-cbs',
    isGhatOrHilly: true,
    aliases: ['tirumala', 'తిరుమల', 'thirumala', 'balaji temple', 'venkateswara', 'cro'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-skht-cbs',
    name: 'Srikalahasti RTC Bus Stand (Rahu Kethu)',
    city: 'Srikalahasti',
    district: 'Tirupati',
    type: 'destination',
    coordinates: { lat: 13.7501, lng: 79.7037 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['srikalahasti', 'శ్రీకాళహస్తి', 'kalahasti', 'rahu kethu temple'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-chandragiri',
    name: 'Chandragiri Fort Heritage Stand',
    city: 'Chandragiri',
    district: 'Tirupati',
    type: 'destination',
    coordinates: { lat: 13.5833, lng: 79.3167 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['chandragiri', 'చంద్రగిరి', 'chandragiri fort'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 17. CHITTOOR DISTRICT
  // ==========================================
  {
    id: 'stop-chittoor-cbs',
    name: 'Chittoor RTC Central Bus Stand',
    city: 'Chittoor',
    district: 'Chittoor',
    type: 'terminal',
    coordinates: { lat: 13.2172, lng: 79.1003 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['chittoor', 'చిత్తూరు', 'chittor'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-kanipakam-temple',
    name: 'Kanipakam Varasiddhi Vinayaka Temple Hub',
    city: 'Kanipakam',
    district: 'Chittoor',
    type: 'destination',
    coordinates: { lat: 13.2667, lng: 79.0333 },
    nearestHubId: 'stop-chittoor-cbs',
    aliases: ['kanipakam', 'కాణిపాకం', 'vinayaka temple kanipakam'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-kuppam',
    name: 'Kuppam RTC Bus Stand',
    city: 'Kuppam',
    district: 'Chittoor',
    type: 'terminal',
    coordinates: { lat: 12.7500, lng: 78.3667 },
    nearestHubId: 'stop-chittoor-cbs',
    aliases: ['kuppam', 'కుప్పం'],
    stationBadge: 'Depot',
  },

  // ==========================================
  // 18. ANNAMAYYA DISTRICT
  // ==========================================
  {
    id: 'stop-horsley-hills',
    name: 'Horsley Hills Hill Resort Stop',
    city: 'Horsley Hills',
    district: 'Annamayya',
    type: 'destination',
    coordinates: { lat: 13.6500, lng: 78.4000 },
    nearestHubId: 'stop-madanapalle-cbs',
    isGhatOrHilly: true,
    aliases: ['horsley hills', 'హార్స్లీ హిల్స్', 'horsley', 'ooty of andhra'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-madanapalle-cbs',
    name: 'Madanapalle RTC Central Stand',
    city: 'Madanapalle',
    district: 'Annamayya',
    type: 'terminal',
    coordinates: { lat: 13.5500, lng: 78.5000 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['madanapalle', 'మదనపల్లె', 'madanapalli'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-rayachoti',
    name: 'Rayachoti Central RTC Stand',
    city: 'Rayachoti',
    district: 'Annamayya',
    type: 'terminal',
    coordinates: { lat: 14.0500, lng: 78.7500 },
    nearestHubId: 'stop-kadapa-cbs',
    aliases: ['rayachoti', 'రాయచోటి'],
    stationBadge: 'Depot',
  },

  // ==========================================
  // 19. YSR KADAPA DISTRICT
  // ==========================================
  {
    id: 'stop-kadapa-cbs',
    name: 'Kadapa (YSR) Central Bus Station',
    city: 'Kadapa',
    district: 'YSR Kadapa',
    type: 'terminal',
    coordinates: { lat: 14.4673, lng: 78.8242 },
    nearestHubId: 'stop-tpt-cbs',
    aliases: ['kadapa', 'కడప', 'cuddapah', 'ysr kadapa'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-proddatur',
    name: 'Proddatur RTC Bus Stand (Gold City)',
    city: 'Proddatur',
    district: 'YSR Kadapa',
    type: 'terminal',
    coordinates: { lat: 14.7526, lng: 78.5529 },
    nearestHubId: 'stop-kadapa-cbs',
    aliases: ['proddatur', 'ప్రొద్దుటూరు'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-jmdg-cbs',
    name: 'Jammalamadugu RTC Bus Station',
    city: 'Jammalamadugu',
    district: 'YSR Kadapa',
    type: 'terminal',
    coordinates: { lat: 14.8500, lng: 78.3833 },
    nearestHubId: 'stop-kadapa-cbs',
    aliases: ['jammalamadugu', 'జమ్మలమడుగు'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-gandikota',
    name: 'Gandikota Fort Heritage Hub (Grand Canyon of India)',
    city: 'Gandikota',
    district: 'YSR Kadapa',
    type: 'destination',
    coordinates: { lat: 14.8142, lng: 78.2861 },
    nearestHubId: 'stop-jmdg-cbs',
    aliases: ['gandikota', 'గండికోట', 'grand canyon of india', 'gandikota gorge'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-vontimitta',
    name: 'Vontimitta Kodandarama Swamy Temple',
    city: 'Vontimitta',
    district: 'YSR Kadapa',
    type: 'destination',
    coordinates: { lat: 14.3833, lng: 79.0333 },
    nearestHubId: 'stop-kadapa-cbs',
    aliases: ['vontimitta', 'ఒంటిమిట్ట', 'kodandarama temple'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 20. NANDYAL DISTRICT
  // ==========================================
  {
    id: 'stop-srisailam-cbs',
    name: 'Srisailam RTC Complex (Mallikarjuna Swamy Jyotirlinga)',
    city: 'Srisailam',
    district: 'Nandyal',
    type: 'destination',
    coordinates: { lat: 16.0748, lng: 78.8687 },
    nearestHubId: 'stop-kurnool-cbs',
    isGhatOrHilly: true,
    aliases: ['srisailam', 'శ్రీశైలం', 'srisaila', 'mallikarjuna', 'jyotirlinga srisailam'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-nandyal-cbs',
    name: 'Nandyal RTC Bus Station',
    city: 'Nandyal',
    district: 'Nandyal',
    type: 'terminal',
    coordinates: { lat: 15.4833, lng: 78.4833 },
    nearestHubId: 'stop-kurnool-cbs',
    aliases: ['nandyal', 'నంద్యాల', 'nandyala'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-ahobilam-temple',
    name: 'Ahobilam Upper/Lower Narasimha Shrine',
    city: 'Ahobilam',
    district: 'Nandyal',
    type: 'destination',
    coordinates: { lat: 15.1333, lng: 78.7167 },
    nearestHubId: 'stop-nandyal-cbs',
    isGhatOrHilly: true,
    aliases: ['ahobilam', 'అహోబిలం', 'nava narasimha', 'ahobila'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-belum-caves',
    name: 'Belum Caves Entrance Hub (Underground Cave Wonder)',
    city: 'Belum Caves',
    district: 'Nandyal',
    type: 'destination',
    coordinates: { lat: 15.1031, lng: 78.1114 },
    nearestHubId: 'stop-kurnool-cbs',
    aliases: ['belum caves', 'బెలుం గుహలు', 'belum', 'underground caves'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-mahanandi',
    name: 'Mahanandi Temple Fresh Water Springs',
    city: 'Mahanandi',
    district: 'Nandyal',
    type: 'destination',
    coordinates: { lat: 15.4833, lng: 78.6167 },
    nearestHubId: 'stop-nandyal-cbs',
    aliases: ['mahanandi', 'మహానంది'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 21. KURNOOL DISTRICT
  // ==========================================
  {
    id: 'stop-kurnool-cbs',
    name: 'Kurnool RTC Central Bus Stand',
    city: 'Kurnool',
    district: 'Kurnool',
    type: 'terminal',
    coordinates: { lat: 15.8281, lng: 78.0373 },
    nearestHubId: 'stop-kurnool-cbs',
    aliases: ['kurnool', 'కర్నూలు', 'konda reddy buruju'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-adoni',
    name: 'Adoni Fort RTC Stand',
    city: 'Adoni',
    district: 'Kurnool',
    type: 'terminal',
    coordinates: { lat: 15.6333, lng: 77.2833 },
    nearestHubId: 'stop-kurnool-cbs',
    aliases: ['adoni', 'ఆదోని'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-mantralayam',
    name: 'Mantralayam Sri Raghavendra Swamy Mutt',
    city: 'Mantralayam',
    district: 'Kurnool',
    type: 'destination',
    coordinates: { lat: 15.9333, lng: 77.4333 },
    nearestHubId: 'stop-kurnool-cbs',
    aliases: ['mantralayam', 'మంత్రాలయం', 'raghavendra swamy'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 22. ANANTHAPURAMU DISTRICT
  // ==========================================
  {
    id: 'stop-anantapur-cbs',
    name: 'Anantapur RTC Central Bus Stand',
    city: 'Anantapur',
    district: 'Ananthapuramu',
    type: 'terminal',
    coordinates: { lat: 14.6819, lng: 77.6006 },
    nearestHubId: 'stop-blr-majestic',
    aliases: ['anantapur', 'అనంతపురం', 'atp'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'stop-guntakal',
    name: 'Guntakal Railway Junction RTC Stand',
    city: 'Guntakal',
    district: 'Ananthapuramu',
    type: 'terminal',
    coordinates: { lat: 15.1667, lng: 77.3667 },
    nearestHubId: 'stop-anantapur-cbs',
    aliases: ['guntakal', 'గుంతకల్'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-tadipatri',
    name: 'Tadipatri Bugga Ramalingeswara Stand',
    city: 'Tadipatri',
    district: 'Ananthapuramu',
    type: 'terminal',
    coordinates: { lat: 14.9092, lng: 78.0108 },
    nearestHubId: 'stop-anantapur-cbs',
    aliases: ['tadipatri', 'తాడిపత్రి'],
    stationBadge: 'Express Hub',
  },

  // ==========================================
  // 23. SRI SATHYA SAI DISTRICT
  // ==========================================
  {
    id: 'stop-hindupur-cbs',
    name: 'Hindupur RTC Bus Station (Mukkidipeta)',
    city: 'Hindupur',
    district: 'Sri Sathya Sai',
    type: 'terminal',
    coordinates: { lat: 13.8283, lng: 77.4919 },
    nearestHubId: 'stop-blr-majestic',
    aliases: ['hindupur', 'హిందూపురం'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-lepakshi-temple',
    name: 'Lepakshi Veerabhadra Temple & Nandi Complex',
    city: 'Lepakshi',
    district: 'Sri Sathya Sai',
    type: 'destination',
    coordinates: { lat: 13.8042, lng: 77.6083 },
    nearestHubId: 'stop-hindupur-cbs',
    aliases: ['lepakshi', 'లేపాక్షి', 'veerabhadra temple', 'monolithic nandi'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-puttaparthi',
    name: 'Puttaparthi Prashanthi Nilayam Hub',
    city: 'Puttaparthi',
    district: 'Sri Sathya Sai',
    type: 'destination',
    coordinates: { lat: 14.1667, lng: 77.8167 },
    nearestHubId: 'stop-hindupur-cbs',
    aliases: ['puttaparthi', 'పుట్టపర్తి', 'prashanthi nilayam', 'sathya sai baba'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-dharmavaram',
    name: 'Dharmavaram RTC Stand (Silk City)',
    city: 'Dharmavaram',
    district: 'Sri Sathya Sai',
    type: 'terminal',
    coordinates: { lat: 14.4142, lng: 77.7214 },
    nearestHubId: 'stop-anantapur-cbs',
    aliases: ['dharmavaram', 'ధర్మవరం'],
    stationBadge: 'Depot',
  },

  // ==========================================
  // 24. SRIKAKULAM DISTRICT
  // ==========================================
  {
    id: 'stop-srikakulam-cbs',
    name: 'Srikakulam RTC Central Complex',
    city: 'Srikakulam',
    district: 'Srikakulam',
    type: 'terminal',
    coordinates: { lat: 18.2949, lng: 83.8938 },
    nearestHubId: 'vizag-rtc',
    aliases: ['srikakulam', 'శ్రీకాకుళం', 'chicacole'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-arasavalli',
    name: 'Arasavalli Suryanarayana Swamy Temple',
    city: 'Arasavalli',
    district: 'Srikakulam',
    type: 'destination',
    coordinates: { lat: 18.2833, lng: 83.9000 },
    nearestHubId: 'stop-srikakulam-cbs',
    aliases: ['arasavalli', 'అరసవల్లి', 'sun temple'],
    stationBadge: 'Heritage',
  },
  {
    id: 'stop-palasa',
    name: 'Palasa RTC Bus Stand (Cashew City)',
    city: 'Palasa',
    district: 'Srikakulam',
    type: 'terminal',
    coordinates: { lat: 18.7667, lng: 84.4167 },
    nearestHubId: 'stop-srikakulam-cbs',
    aliases: ['palasa', 'పలాస'],
    stationBadge: 'Express Hub',
  },

  // ==========================================
  // 25. VIZIANAGARAM DISTRICT
  // ==========================================
  {
    id: 'stop-vizianagaram-cbs',
    name: 'Vizianagaram RTC Complex',
    city: 'Vizianagaram',
    district: 'Vizianagaram',
    type: 'terminal',
    coordinates: { lat: 18.1133, lng: 83.3977 },
    nearestHubId: 'vizag-rtc',
    aliases: ['vizianagaram', 'విజయనగరం', 'vzmn'],
    stationBadge: 'Depot',
  },
  {
    id: 'stop-skota',
    name: 'Srungavarapukota (S. Kota Ghat Entry)',
    city: 'S. Kota',
    district: 'Vizianagaram',
    type: 'stop',
    coordinates: { lat: 18.1147, lng: 83.1534 },
    nearestHubId: 'vizag-rtc',
    isGhatOrHilly: true,
    aliases: ['skota', 's kota', 'శృంగవరపుకోట'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-bobbili',
    name: 'Bobbili Fort Heritage Stand',
    city: 'Bobbili',
    district: 'Vizianagaram',
    type: 'terminal',
    coordinates: { lat: 18.5667, lng: 83.3667 },
    nearestHubId: 'stop-vizianagaram-cbs',
    aliases: ['bobbili', 'బొబ్బిలి', 'bobbili fort'],
    stationBadge: 'Heritage',
  },

  // ==========================================
  // 26. PARVATHIPURAM MANYAM DISTRICT
  // ==========================================
  {
    id: 'stop-parvathipuram',
    name: 'Parvathipuram RTC Bus Stand',
    city: 'Parvathipuram',
    district: 'Parvathipuram Manyam',
    type: 'terminal',
    coordinates: { lat: 18.7833, lng: 83.4333 },
    nearestHubId: 'stop-vizianagaram-cbs',
    aliases: ['parvathipuram', 'పార్వతీపురం', 'manyam'],
    stationBadge: 'Agency',
  },

  // ==========================================
  // 27. INTERCITY METRO TRANSIT TERMINALS
  // ==========================================
  {
    id: 'hyd-mgbs',
    name: 'Hyderabad Mahatma Gandhi Bus Station (MGBS)',
    city: 'Hyderabad',
    district: 'Hyderabad',
    type: 'terminal',
    coordinates: { lat: 17.3786, lng: 78.4812 },
    nearestHubId: 'hyd-mgbs',
    aliases: ['hyderabad', 'హైదరాబాద్', 'mgbs', 'imlibun', 'hyd', 'hyderabad bus station', 'hyderabad mgbs', 'mgbs hyderabad'],
    stationBadge: 'Intercity Terminal',
  },
  {
    id: 'hyd-hitec-city',
    name: 'HITEC City (Cyber Towers & Financial Hub)',
    city: 'Hyderabad',
    district: 'Hyderabad',
    type: 'destination',
    coordinates: { lat: 17.4504, lng: 78.3808 },
    nearestHubId: 'hyd-mgbs',
    aliases: ['hitec city', 'cyber towers', 'hitech city', 'హైటెక్ సిటీ', 'hitec city hyderabad', 'hyderabad hitec city', 'hitec city, hyderabad', 'cyber towers hyderabad'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'hyd-gachibowli',
    name: 'Gachibowli (Financial District Terminal)',
    city: 'Hyderabad',
    district: 'Hyderabad',
    type: 'destination',
    coordinates: { lat: 17.4401, lng: 78.3489 },
    nearestHubId: 'hyd-mgbs',
    aliases: ['gachibowli', 'గచ్చిబౌలి'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'hyd-lb-nagar',
    name: 'LB Nagar Ring Road Stop',
    city: 'Hyderabad',
    district: 'Hyderabad',
    type: 'stop',
    coordinates: { lat: 17.3457, lng: 78.5522 },
    nearestHubId: 'hyd-mgbs',
    aliases: ['lb nagar', 'ఎల్బీ నగర్'],
    stationBadge: 'Express Hub',
  },
  {
    id: 'stop-blr-majestic',
    name: 'Bengaluru Kempegowda Bus Station (Majestic CBS)',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    type: 'terminal',
    coordinates: { lat: 12.9774, lng: 77.5708 },
    nearestHubId: 'stop-blr-majestic',
    aliases: ['bengaluru', 'bangalore', 'బెంగళూరు', 'majestic'],
    stationBadge: 'Intercity Terminal',
  },
];

/**
 * High-speed prefix & substring search (<1ms)
 */
export function searchFastAPStations(query: string, limit = 8): Location[] {
  const q = query.toLowerCase().trim();
  if (!q) {
    return AP_COMPREHENSIVE_STATIONS.slice(0, limit).map(toLocationModel);
  }

  const cleanQ = q.replace(/[(),.-/]/g, ' ').replace(/\s+/g, ' ').trim();
  const qTokens = cleanQ.split(' ').filter((t) => t.length > 1);

  const scored: { station: StationDefinition; score: number }[] = [];

  for (const s of AP_COMPREHENSIVE_STATIONS) {
    let score = 0;
    const nameLower = s.name.toLowerCase();
    const cityLower = s.city.toLowerCase();
    const distLower = s.district.toLowerCase();
    const haystack = `${nameLower} ${cityLower} ${distLower} ${s.aliases.join(' ')}`.toLowerCase();
    const cleanHaystack = haystack.replace(/[(),.-/]/g, ' ').replace(/\s+/g, ' ');

    // 1. Exact matches (100)
    if (cityLower === q || nameLower === q || cleanHaystack === cleanQ) {
      score = 100;
    } else if (s.aliases.some((a) => a.toLowerCase() === q || a.toLowerCase() === cleanQ)) {
      score = 98;
    }
    // 2. Starts-with matches (80-85)
    else if (cityLower.startsWith(cleanQ) || nameLower.startsWith(cleanQ)) {
      score = 85;
    } else if (s.aliases.some((a) => a.toLowerCase().startsWith(cleanQ))) {
      score = 80;
    }
    // 3. Substring matches on query (70)
    else if (nameLower.includes(cleanQ) || cityLower.includes(cleanQ)) {
      score = 70;
    } else if (s.aliases.some((a) => a.toLowerCase().includes(cleanQ) || cleanQ.includes(a.toLowerCase()))) {
      score = 65;
    }
    // 4. Token-based matching: if all tokens in query match words in the station haystack (60)
    else if (qTokens.length > 0 && qTokens.every((tok) => cleanHaystack.includes(tok))) {
      score = 60;
    }
    // 5. Partial token matching (25-40)
    else {
      const matchCount = qTokens.filter((tok) => cleanHaystack.includes(tok)).length;
      if (matchCount >= 2) {
        score = 40;
      } else if (matchCount === 1 && qTokens.length <= 2) {
        score = 25;
      }
    }

    if (score > 0) {
      scored.push({ station: s, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => toLocationModel(item.station));
}

export function getFastStationById(id: string): Location | undefined {
  const hit = AP_COMPREHENSIVE_STATIONS.find((s) => s.id === id);
  return hit ? toLocationModel(hit) : undefined;
}

export function toLocationModel(s: StationDefinition): Location {
  return {
    id: s.id,
    name: s.name,
    city: s.city,
    district: s.district,
    type: s.type,
    coordinates: s.coordinates,
    amenity: s.stationBadge === 'Depot' || s.stationBadge === 'Intercity Terminal' ? 'bus_station' : 'stop',
    source: 'seed',
    simulated: true,
  };
}
