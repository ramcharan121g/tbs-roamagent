-- TBS RoamAgent - Supabase Initial Schema & Transactional Seat Allocation
-- Migration: 001_initial_schema.sql

-- 1. Locations
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT CHECK (type IN ('terminal', 'stop', 'destination')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  simulated BOOLEAN DEFAULT TRUE
);

-- 2. Operators & Services
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_services (
  id TEXT PRIMARY KEY,
  operator_id TEXT REFERENCES operators(id),
  operator_name TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('bus', 'cab', 'auto', 'metro')),
  origin_id TEXT REFERENCES locations(id),
  destination_id TEXT REFERENCES locations(id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  fare_inr NUMERIC NOT NULL,
  seat_class TEXT NOT NULL,
  total_capacity INT NOT NULL,
  confirmed_seats INT NOT NULL DEFAULT 0,
  held_seats INT NOT NULL DEFAULT 0,
  has_luggage_space BOOLEAN DEFAULT TRUE,
  is_accessible BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'departed', 'completed')),
  delay_minutes INT DEFAULT 0,
  simulated BOOLEAN DEFAULT TRUE
);

-- 3. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  itinerary_json JSONB NOT NULL,
  passenger_count INT NOT NULL DEFAULT 1,
  total_fare_inr NUMERIC NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'disrupted', 'recovered', 'cancelled')),
  passenger_name TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  boarding_pass_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  simulated BOOLEAN DEFAULT TRUE
);

-- 4. Atomic Seat Holds
CREATE TABLE IF NOT EXISTS seat_holds (
  id TEXT PRIMARY KEY,
  service_id TEXT REFERENCES scheduled_services(id),
  passenger_count INT NOT NULL,
  recovery_case_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'released', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ttl_seconds INT NOT NULL DEFAULT 300
);

-- 5. Atomic RPC: Create Seat Hold with Lock
CREATE OR REPLACE FUNCTION create_atomic_seat_hold(
  p_service_id TEXT,
  p_passenger_count INT,
  p_recovery_case_id TEXT,
  p_ttl_seconds INT
) RETURNS JSONB AS $$
DECLARE
  v_service scheduled_services%ROWTYPE;
  v_available INT;
  v_hold_id TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Lock service row for update to prevent concurrent race condition
  SELECT * INTO v_service FROM scheduled_services WHERE id = p_service_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SERVICE_NOT_FOUND');
  END IF;

  v_available := v_service.total_capacity - v_service.confirmed_seats - v_service.held_seats;

  IF v_available < p_passenger_count THEN
    RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_CAPACITY');
  END IF;

  -- Update held seats
  UPDATE scheduled_services
  SET held_seats = held_seats + p_passenger_count
  WHERE id = p_service_id;

  v_hold_id := 'hold-' || floor(random() * 1000000)::text;
  v_expires_at := NOW() + (p_ttl_seconds || ' seconds')::interval;

  INSERT INTO seat_holds (id, service_id, passenger_count, recovery_case_id, status, expires_at, ttl_seconds)
  VALUES (v_hold_id, p_service_id, p_passenger_count, p_recovery_case_id, 'active', v_expires_at, p_ttl_seconds);

  RETURN jsonb_build_object(
    'success', true,
    'hold_id', v_hold_id,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql;
