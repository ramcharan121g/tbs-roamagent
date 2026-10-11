// Prayanam - Trip Constraints Parser Interface & Zod Schema
import { z } from 'zod';
import { TripConstraints } from '../domain/types';

export const TripConstraintsSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  originLocationId: z.string(),
  destinationLocationId: z.string(),
  departureDate: z.string(),
  earliestDeparture: z.string().nullable(),
  arrivalDeadline: z.string(),
  passengers: z.number().int().min(1).default(1),
  budgetInr: z.number().min(100),
  budgetScope: z.enum(['per_person', 'group_total']).default('per_person'),
  preferredClass: z.enum(['sleeper', 'seater', 'semi-sleeper', 'any']).default('sleeper'),
  hasLuggage: z.boolean().default(false),
  accessibilityNeeds: z.array(z.string()).default([]),
  maxTransfers: z.number().int().min(0).default(1),
  language: z.string().default('en'),
  hardConstraints: z.array(z.string()).default([]),
  softPreferences: z.array(z.string()).default([]),
  clarificationNeeded: z.array(z.string()).default([]),
  viaWaypoints: z.array(z.string()).optional(),
  dataSource: z.enum(['verified_timetable', 'scraped_live', 'hybrid']).optional(),
});

export interface IConstraintParser {
  parseRequest(
    text: string,
    languageHint?: string,
    currentSimulatedDate?: string
  ): Promise<{
    constraints: TripConstraints;
    providerUsed: 'demo' | 'groq';
    clarifications: string[];
    rawParsed?: unknown;
  }>;
}
