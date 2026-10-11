// TBS RoamAgent - English Dictionary

export const enTranslations = {
  appTitle: 'TBS RoamAgent',
  appSubtitle: 'Travel planned. Disruptions handled. Decisions stay yours.',
  demoPill: 'DEMO MODE · SIMULATED DATA',
  navTraveller: 'Traveller Workbench',
  navOperator: 'Operator Workbench',
  navSimulator: 'Disruption Simulator',
  navBench: 'RecoveryBench',
  navClearData: 'Clear Demo Data',

  // Traveller Intake
  intakeHeading: 'Plan Your Intercity Journey',
  intakeSubheading: 'Speak or type your goal in English or Telugu. Constraints are strictly validated.',
  samplePromptLabel: 'Quick Scenarios:',
  samplePrompt1: 'Vizag to Hyderabad, reach by 9 AM, prefer sleeper, low budget, with luggage',
  samplePrompt2: 'వైజాగ్ నుండి హైదరాబాద్, ఉదయం 9 గంటలకు చేరాలి, స్లీపర్ బస్సు, బడ్జెట్ తక్కువ',
  samplePrompt3: 'Vizag to Hyderabad HITEC City, senior citizen accessible, budget ₹1400',
  inputPlaceholder: 'Enter your travel requirement (e.g., Vizag to Hyderabad by 9 AM, sleeper)...',
  parseButton: 'Analyze & Extract Constraints',
  parsingState: 'Extracting travel constraints...',
  voiceListening: 'Listening to speech...',
  voiceStart: 'Voice Input',
  voiceStop: 'Stop Recording',
  voiceUnsupported: 'Speech recognition not available on this browser. Use text input.',

  // Constraints Form
  constraintsTitle: 'Trip Constraints & Validation',
  originLabel: 'Origin',
  destinationLabel: 'Destination',
  dateLabel: 'Departure Date',
  deadlineLabel: 'Arrival Deadline',
  budgetLabel: 'Max Budget (INR)',
  passengersLabel: 'Passengers',
  classLabel: 'Seat Preference',
  luggageLabel: 'Has Luggage',
  accessibilityLabel: 'Accessibility Needs',
  replanButton: 'Compute Feasible Itineraries',

  // Itinerary Cards
  itinerariesHeading: 'Verified Multi-Leg Travel Plans',
  noRoutesFound: 'No feasible itineraries found under these strict constraints.',
  noRoutesExplanation: 'Your budget or arrival deadline may be too restrictive. Try relaxing constraints below.',
  fareTotal: 'Total Fare',
  arrivalBuffer: 'Deadline Buffer',
  duration: 'Total Duration',
  transfers: 'Transfers',
  resilienceScore: 'Resilience Index',
  resiliencePassportBtn: 'Resilience Passport',
  evidenceBtn: 'Decision Evidence',
  selectItineraryBtn: 'Select & Review Booking',

  // Resilience Passport
  resilienceTitle: 'Resilience Passport',
  resilienceSubtitle: 'Transparent evaluation of backup options and disruption tolerance.',
  backupsAvailable: 'Feasible Backup Routes',
  vulnerabilitiesTitle: 'Identified Failure Modes',
  heuristicNote: 'Heuristic assessment based on simulated schedules. Not a guarantee.',

  // Decision Evidence
  evidenceTitle: 'Decision Evidence Panel',
  evidenceSubtitle: 'Deterministic checks passed and alternatives rejected.',
  hardChecksPassed: 'Hard Constraints Passed',
  rejectedAlternatives: 'Alternatives Rejected',

  // Booking & Consent
  bookingReviewTitle: 'Review & Explicit Consent Gate',
  bookingWarning: 'This is a simulated booking. No real money will be charged.',
  confirmBookingBtn: 'Confirm Simulated Booking',
  declineBookingBtn: 'Decline / Return to Search',
  bookingConfirmedTitle: 'Simulated Boarding Pass Issued',
  passDisclaimer: 'SIMULATED PASS · NOT VALID FOR TRAVEL',

  // Disruptions & Recovery
  disruptionAlertTitle: 'Disruption Event Detected',
  recoveryActionPending: 'Recovery options calculated from current simulated time and location.',
  operatorApprovalTitle: 'Operator Coordinated Offer',
  operatorHoldNotice: 'Seat held with 5-minute timeout. Review cost and schedule change.',
  approveRecoveryBtn: 'Approve Replacement Journey',
  declineRecoveryBtn: 'Decline Replacement',

  // Operator
  operatorTitle: 'Fleet Capacity & Rescue Coordination',
  operatorSub: 'Manage spare seat inventory and authorize recovery requests.',
  activeHolds: 'Active Seat Holds',
  recoveryRequests: 'Incoming Recovery Requests',
  acceptRequestBtn: 'Accept & Hold Seat',
  declineRequestBtn: 'Decline Request',
  confirmedAssignments: 'Confirmed Assignments',

  // Admin Simulator
  simulatorTitle: 'Scenario & Disruption Controller',
  simulatorSub: 'Deterministic test triggers to advance time and simulate disruption events.',
  currentTime: 'Current Simulated Time',
  btnDelay90: 'Trigger 90-Min Bus Delay',
  btnCancelBus: 'Cancel Current Bus',
  btnMissedBoarding: 'Simulate Missed Boarding',
  btn12PaxRescue: 'Simulate 12 Affected Passengers',
  btnExpireHolds: 'Expire Active Holds Now',
  btnResetDemo: 'Reset Demo to Initial Seed',
};

export type Translations = typeof enTranslations;
