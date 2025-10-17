// Travel module types
// Note: Travel functionality uses existing TravelTrip model
// This module focuses on linking travels to connections

export interface CreateTravelEntryInput {
  title: string;
  description?: string;
  countries: string[];
  cities: string[];
  startDate: Date | string;
  endDate?: Date | string;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  connectionsMet?: string[]; // User IDs of connections met during this travel
}

export interface UpdateTravelEntryInput {
  tripId: string;
  title?: string;
  description?: string;
  countries?: string[];
  cities?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
  coverImage?: string;
  images?: string[];
  tags?: string[];
}

export interface LinkConnectionToTravelInput {
  tripId: string;
  connectionId: string;
  notes?: string;
}

// TODO: Implement full travel service using existing TravelTrip model
// Features to implement:
// - Create travel entry
// - Update travel entry
// - Delete travel entry
// - Link connections to travels (via TravelCompanion)
// - Get user's travel history
// - Get travels where user met a specific connection
// - Calculate travel stats
