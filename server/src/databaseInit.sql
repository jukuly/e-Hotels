CREATE DATABASE ehotels;

CREATE TABLE address (
  id UUID NOT NULL PRIMARY KEY,
  street_name VARCHAR(20) NOT NULL,
  street_number INT NOT NULL,
  apt_number INT,
  city VARCHAR(20) NOT NULL,
  province VARCHAR(20) NOT NULL,
  zip VARCHAR(6) NOT NULL
);

CREATE TABLE hotel_chain (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  email VARCHAR(40) NOT NULL,
  phone INT NOT NULL,
);

CREATE TABLE hotel (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  hotel_chain_id UUID NOT NULL,
  rating INT,
  email VARCHAR(40) NOT NULL,
  phone INT NOT NULL,
  FOREIGN KEY (hotel_chain_id) REFERENCES ehotels.hotel_chain
);

CREATE TABLE admin (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  hotel_chain_id UUID NOT NULL PRIMARY KEY,
  password VARCHAR(20) NOT NULL,
  FOREIGN KEY (hotel_chain_id) REFERENCES ehotels.hotel_chain
);

CREATE TABLE employee (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  email VARCHAR(40) NOT NULL UNIQUE,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  hotel_id UUID NOT NULL,
  roles VARCHAR(20)[],
  password VARCHAR(20) NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES ehotels.hotel
);

CREATE TABLE client (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  email VARCHAR(40) NOT NULL UNIQUE,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL,
  password VARCHAR(20) NOT NULL,
);

CREATE TABLE room (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  price NUMERIC(10, 2) NOT NULL,
  commodities VARCHAR(20)[],
  capacity INT NOT NULL,
  sea_vue BOOLEAN,
  mountain_vue BOOLEAN,
  extendable BOOLEAN,
  issues TEXT[],
  hotel_id UUID NOT NULL,
  area INT NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES ehotels.hotel
);

CREATE TABLE reservation (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  room_id UUID NOT NULL,
  client_id UUID NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (client_id) REFERENCES ehotels.client,
  FOREIGN KEY (room_id) REFERENCES ehotels.room
);

CREATE TABLE location (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  room_id UUID NOT NULL,
  client_id UUID NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (client_id) REFERENCES ehotels.client,
  FOREIGN KEY (room_id) REFERENCES ehotels.room
);