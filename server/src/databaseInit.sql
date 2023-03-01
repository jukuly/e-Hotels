CREATE DATABASE ehotels;

CREATE TABLE address (
  id UUID NOT NULL PRIMARY KEY,
  street_name VARCHAR(40) NOT NULL,
  street_number INT NOT NULL,
  apt_number INT,
  city VARCHAR(20) NOT NULL,
  province VARCHAR(20) NOT NULL,
  zip VARCHAR(6) NOT NULL
);

CREATE TABLE hotel_chain (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(40) NOT NULL UNIQUE,
  phone BIGINT NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$')
);

CREATE TABLE hotel (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  hotel_chain_id UUID NOT NULL,
  rating INT,
  email VARCHAR(40) NOT NULL,
  phone BIGINT NOT NULL,
  FOREIGN KEY (hotel_chain_id) REFERENCES hotel_chain ON UPDATE CASCADE,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$')
);

CREATE TABLE employee (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  email VARCHAR(40) NOT NULL UNIQUE,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  hotel_id UUID NOT NULL,
  roles VARCHAR(20)[],
  password VARCHAR NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES hotel ON UPDATE CASCADE,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$')
);

CREATE TABLE client (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  email VARCHAR(40) NOT NULL UNIQUE,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  password VARCHAR NOT NULL,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$')
);

CREATE TABLE room (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  price NUMERIC(10, 2) NOT NULL,
  commodities VARCHAR(20)[],
  capacity INT NOT NULL,
  sea_vue BOOLEAN DEFAULT FALSE,
  mountain_vue BOOLEAN DEFAULT FALSE,
  extendable BOOLEAN DEFAULT FALSE,
  issues TEXT[],
  hotel_id UUID NOT NULL,
  area INT NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES hotel ON UPDATE CASCADE
);

CREATE TABLE reservation (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  room_id UUID NOT NULL,
  client_id UUID NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client ON UPDATE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room ON UPDATE CASCADE,
  CHECK (end_date >= start_date)
);

CREATE TABLE location (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  room_id UUID NOT NULL,
  client_id UUID NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client ON UPDATE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room ON UPDATE CASCADE,
  CHECK (end_date >= start_date)
);