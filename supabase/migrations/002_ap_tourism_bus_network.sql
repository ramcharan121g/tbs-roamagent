-- Prayanam - Migration 002: Andhra Pradesh 6 Tourist Destinations Bus Network
-- 5 Linked Tables: bus_services, bus_stops, service_stop_times, bus_fares, connections

-- Table 1: bus_services
CREATE TABLE IF NOT EXISTS bus_services (
  service_id TEXT PRIMARY KEY,
  service_number TEXT NOT NULL,
  operator TEXT NOT NULL,
  bus_type TEXT NOT NULL CHECK (bus_type IN ('Pallevelugu', 'Express', 'Super Luxury', 'Garuda Plus', 'Amaravati', 'Sleeper', 'Local Feeder')),
  origin_id TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  total_duration_minutes INT NOT NULL,
  distance_km NUMERIC NOT NULL,
  total_stops_count INT NOT NULL DEFAULT 0,
  operating_days TEXT[] DEFAULT ARRAY['Daily'],
  ticket_price_inr NUMERIC NOT NULL,
  live_location_lat DOUBLE PRECISION,
  live_location_lng DOUBLE PRECISION,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  simulated BOOLEAN DEFAULT TRUE
);

-- Table 2: bus_stops
CREATE TABLE IF NOT EXISTS bus_stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  station_type TEXT NOT NULL CHECK (station_type IN ('bus_station', 'intermediate_stop', 'tourist_hub', 'transfer_junction'))
);

-- Table 3: service_stop_times (Ordered intermediate stops & timings)
CREATE TABLE IF NOT EXISTS service_stop_times (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT REFERENCES bus_services(service_id) ON DELETE CASCADE,
  stop_sequence INT NOT NULL,
  stop_id TEXT REFERENCES bus_stops(stop_id),
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  distance_from_origin_km NUMERIC NOT NULL,
  pickup_allowed BOOLEAN DEFAULT TRUE,
  dropoff_allowed BOOLEAN DEFAULT TRUE,
  UNIQUE(service_id, stop_sequence)
);

CREATE INDEX IF NOT EXISTS idx_service_stop_times_lookup ON service_stop_times(service_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_service_stop_times_stop ON service_stop_times(stop_id);

-- Table 4: bus_fares
CREATE TABLE IF NOT EXISTS bus_fares (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT REFERENCES bus_services(service_id) ON DELETE CASCADE,
  boarding_stop_id TEXT REFERENCES bus_stops(stop_id),
  destination_stop_id TEXT REFERENCES bus_stops(stop_id),
  fare_inr NUMERIC NOT NULL,
  passenger_category TEXT DEFAULT 'general' CHECK (passenger_category IN ('general', 'senior', 'child')),
  verified_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(service_id, boarding_stop_id, destination_stop_id, passenger_category)
);

-- Table 5: connections (Precomputed & dynamic multi-leg transfer journeys)
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  first_service_id TEXT REFERENCES bus_services(service_id),
  transfer_station_id TEXT REFERENCES bus_stops(stop_id),
  second_service_id TEXT REFERENCES bus_services(service_id),
  transfer_waiting_minutes INT NOT NULL,
  total_duration_minutes INT NOT NULL,
  total_distance_km NUMERIC NOT NULL,
  target_destination_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated timestamp
CREATE INDEX IF NOT EXISTS idx_bus_services_origin_dest ON bus_services(origin_id, destination_id);
CREATE INDEX IF NOT EXISTS idx_connections_transfer ON connections(transfer_station_id);
