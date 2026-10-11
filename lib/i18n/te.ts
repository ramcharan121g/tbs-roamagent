// TBS RoamAgent - Telugu Translations (తెలుగు అనువాదాలు)
import { Translations } from './en';

export const teTranslations: Translations = {
  appTitle: 'TBS రోమ్‌ఏజెంట్ (RoamAgent)',
  appSubtitle: 'ప్రయాణ ప్రణాళిక. ఆటంకాల పరిష్కారం. నిర్ణయాధికారం మీదే.',
  demoPill: 'డెమో మోడ్ · సిమ్యులేటెడ్ డేటా',
  navTraveller: 'ప్రయాణికుల వర్క్‌బెంచ్',
  navOperator: 'ఆపరేటర్ వర్క్‌బెంచ్',
  navSimulator: 'డిస్రప్షన్ సిమ్యులేటర్',
  navBench: 'రికవరీ బెంచ్',
  navClearData: 'డేటా క్లియర్ చేయండి',

  // Traveller Intake
  intakeHeading: 'మీ అంతర్-నగర ప్రయాణాన్ని ప్లాన్ చేసుకోండి',
  intakeSubheading: 'ఇంగ్లీష్ లేదా తెలుగులో మాట్లాడండి లేదా టైప్ చేయండి. షరతులు కచ్చితంగా ధృవీకరించబడతాయి.',
  samplePromptLabel: 'త్వరిత ఉదాహరణలు:',
  samplePrompt1: 'వైజాగ్ నుండి హైదరాబాద్, ఉదయం 9 గంటలకు చేరాలి, స్లీపర్, తక్కువ బడ్జెట్, లగేజీ ఉంది',
  samplePrompt2: 'వైజాగ్ నుండి హైదరాబాద్, ఉదయం 9 గంటలకు చేరాలి, స్లీపర్ బస్సు, బడ్జెట్ తక్కువ',
  samplePrompt3: 'వైజాగ్ నుండి హైదరాబాద్ హైటెక్ సిటీ, సీనియర్ సిటిజన్ సదుపాయం, బడ్జెట్ ₹1400',
  inputPlaceholder: 'మీ ప్రయాణ అవసరాన్ని నమోదు చేయండి (ఉదా: వైజాగ్ నుండి హైదరాబాద్ ఉదయం 9 గంటలకు చేరాలి)...',
  parseButton: 'వివరాలను విశ్లేషించండి',
  parsingState: 'ప్రయాణ వివరాలను సేకరిస్తున్నాము...',
  voiceListening: 'వినబడుతోంది... మాట్లాడండి',
  voiceStart: 'వాయిస్ ద్వారా చెప్పండి',
  voiceStop: 'రికార్డింగ్ ఆపండి',
  voiceUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు. టైప్ చేయండి.',

  // Constraints Form
  constraintsTitle: 'ప్రయాణ నియమాలు మరియు ధృవీకరణ',
  originLabel: 'బయలుదేరే స్థలం',
  destinationLabel: 'చేరవలసిన గమ్యస్థానం',
  dateLabel: 'ప్రయాణ తేదీ',
  deadlineLabel: 'చేరవలసిన సమయం (డెడ్‌లైన్)',
  budgetLabel: 'గరిష్ట బడ్జెట్ (రూపాయలు)',
  passengersLabel: 'ప్రయాణికుల సంఖ్య',
  classLabel: 'సీటు ప్రాధాన్యత',
  luggageLabel: 'లగేజ్ ఉందా?',
  accessibilityLabel: 'ప్రత్యేక అవసరాలు',
  replanButton: 'ప్రయాణ మార్గాలను లెక్కించండి',

  // Itinerary Cards
  itinerariesHeading: 'ధృవీకరించబడిన ప్రయాణ మార్గాలు',
  noRoutesFound: 'ఈ షరతుల ప్రకారం ఎటువంటి మార్గాలు అందుబాటులో లేవు.',
  noRoutesExplanation: 'మీ బడ్జెట్ లేదా చేరవలసిన సమయం చాలా కఠినంగా ఉండవచ్చు. కాస్త మార్పులు చేయండి.',
  fareTotal: 'మొత్తం ఛార్జీ',
  arrivalBuffer: 'సమయ రక్షణ నిల్వ (బఫర్)',
  duration: 'మొత్తం ప్రయాణ సమయం',
  transfers: 'మారవలసిన బస్సులు/రైడ్లు',
  resilienceScore: 'స్థితిస్థాపకత సూచిక (Resilience)',
  resiliencePassportBtn: 'రెసిలెన్స్ పాస్‌పోర్ట్',
  evidenceBtn: 'నిర్ణయ ఆధారాలు (Evidence)',
  selectItineraryBtn: 'ఎంచుకోండి & సమీక్షించండి',

  // Resilience Passport
  resilienceTitle: 'రెసిలెన్స్ పాస్‌పోర్ట్',
  resilienceSubtitle: 'ఆటంకాలు ఎదురైతే ప్రత్యామ్నాయ మార్గాల పారదర్శక పరిశీలన.',
  backupsAvailable: 'అందుబాటులో ఉన్న బ్యాకప్ మార్గాలు',
  vulnerabilitiesTitle: 'గుర్తించిన లోపాలు / బలహీనతలు',
  heuristicNote: 'సిమ్యులేటెడ్ షెడ్యూల్ ఆధారంగా అంచనా. హామీ కాదు.',

  // Decision Evidence
  evidenceTitle: 'నిర్ణయ ధృవీకరణ ప్యానెల్',
  evidenceSubtitle: 'పాసైన కఠిన నియమాలు మరియు తిరస్కరించిన కారణాలు.',
  hardChecksPassed: 'సఫలమైన కఠిన నియమాలు',
  rejectedAlternatives: 'తిరస్కరించిన ప్రత్యామ్నాయాలు',

  // Booking & Consent
  bookingReviewTitle: 'సమీక్ష & స్పష్టమైన అనుమతి',
  bookingWarning: 'ఇది సిమ్యులేటెడ్ బుకింగ్. అసలు డబ్బులు కట్ అవ్వవు.',
  confirmBookingBtn: 'సిమ్యులేటెడ్ బుకింగ్ నిర్ధారించండి',
  declineBookingBtn: 'వద్దు / వెనక్కి వెళ్ళండి',
  bookingConfirmedTitle: 'సిమ్యులేటెడ్ బోర్డింగ్ పాస్ జారీ చేయబడింది',
  passDisclaimer: 'సిమ్యులేటెడ్ పాస్ · నిజమైన ప్రయాణానికి చెల్లదు',

  // Disruptions & Recovery
  disruptionAlertTitle: 'ప్రయాణంలో అంతరాయం గుర్తించబడింది',
  recoveryActionPending: 'ప్రస్తుత సమయం మరియు స్థానం నుండి ప్రత్యామ్నాయాలు లెక్కించబడ్డాయి.',
  operatorApprovalTitle: 'ఆపరేటర్ ఆమోదించిన ప్రతిపాదన',
  operatorHoldNotice: '5 నిమిషాల వ్యవధితో సీటు హోల్డ్ చేయబడింది. ఛార్జీ మార్పును సమీక్షించండి.',
  approveRecoveryBtn: 'కొత్త ప్రయాణాన్ని ఆమోదించండి',
  declineRecoveryBtn: 'ప్రతిపాదనను తిరస్కరించండి',

  // Operator
  operatorTitle: 'ఫ్లీట్ కెపాసిటీ & రెస్క్యూ నిర్వహణ',
  operatorSub: 'మిగిలిన సీట్లను నిర్వహించండి మరియు రెస్క్యూ అభ్యర్థనలను ఆమోదించండి.',
  activeHolds: 'యాక్టివ్ సీట్ హోల్డ్స్',
  recoveryRequests: 'వచ్చిన రెస్క్యూ అభ్యర్థనలు',
  acceptRequestBtn: 'ఆమోదించండి & సీటు హోల్డ్ చేయండి',
  declineRequestBtn: 'తిరస్కరించండి',
  confirmedAssignments: 'నిర్ధారించబడిన ప్రయాణాలు',

  // Admin Simulator
  simulatorTitle: 'పరిస్థితుల సిమ్యులేటర్ కంట్రోలర్',
  simulatorSub: 'సమయాన్ని ముందుకు జరపడానికి మరియు ఆటంకాలను పరీక్షించడానికి బటన్లు.',
  currentTime: 'ప్రస్తుత సిమ్యులేటెడ్ సమయం',
  btnDelay90: '90 నిమిషాల బస్సు ఆలస్యం',
  btnCancelBus: 'ప్రస్తుత బస్సు రద్దు చేయండి',
  btnMissedBoarding: 'బోర్డింగ్ మిస్ అయినట్లు నమోదు చేయండి',
  btn12PaxRescue: '12 మంది ప్రయాణికుల మాస్ రెస్క్యూ',
  btnExpireHolds: 'సీట్ హోల్డ్స్ గడువు ముగించండి',
  btnResetDemo: 'మొదటి స్థితికి రీసెట్ చేయండి',
};
