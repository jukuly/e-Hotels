CREATE DATABASE ehotels;

CREATE TABLE address (
  id SERIAL PRIMARY KEY,
  street_name VARCHAR(20) NOT NULL,
  street_number INT NOT NULL,
  apt_number INT,
  city VARCHAR(20) NOT NULL,
  province VARCHAR(20) NOT NULL,
  zip VARCHAR(6) NOT NULL
);

CREATE TABLE hotel_chain (
  name VARCHAR(20) NOT NULL PRIMARY KEY,
  address INT NOT NULL,
  email VARCHAR(40) NOT NULL,
  phone INT NOT NULL,
  FOREIGN KEY (address) REFERENCES ehotels.address
);

CREATE TABLE hotel (
  id SERIAL PRIMARY KEY,
  hotel_chain_name VARCHAR(20) NOT NULL,
  rating INT,
  address INT NOT NULL,
  email VARCHAR(40) NOT NULL,
  phone INT NOT NULL,
  FOREIGN KEY (address) REFERENCES ehotels.address,
  FOREIGN KEY (hotel_chain_name) REFERENCES ehotels.hotel_chain
);

CREATE TABLE employee (
  email VARCHAR(40) NOT NULL PRIMARY KEY,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  address INT NOT NULL,
  hotel_id INT NOT NULL,
  roles VARCHAR(20)[],
  password VARCHAR(20) NOT NULL,
  FOREIGN KEY (address) REFERENCES ehotels.address,
  FOREIGN KEY (hotel_id) REFERENCES ehotels.hotel
);

CREATE TABLE client (
  email VARCHAR(40) NOT NULL PRIMARY KEY,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  address INT NOT NULL,
  registration_date TIMESTAMP NOT NULL,
  password VARCHAR(20) NOT NULL,
  FOREIGN KEY (address) REFERENCES ehotels.address
);

CREATE TABLE room (
  id SERIAL PRIMARY KEY,
  price NUMERIC(10, 2) NOT NULL,
  commodities VARCHAR(20)[],
  capacity INT NOT NULL,
  sea_vue BOOLEAN,
  mountain_vue BOOLEAN,
  extendable BOOLEAN,
  issues TEXT[],
  hotel_id INT NOT NULL,
  area INT NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES ehotels.hotel
);

CREATE TABLE reservation (
  id SERIAL PRIMARY KEY,
  room_id INT,
  client_email VARCHAR(40),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  FOREIGN KEY (client_email) REFERENCES ehotels.client,
  FOREIGN KEY (room_id) REFERENCES ehotels.room
);

CREATE TABLE location (
  id SERIAL PRIMARY KEY,
  room_id INT,
  client_email VARCHAR(40),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  FOREIGN KEY (client_email) REFERENCES ehotels.client,
  FOREIGN KEY (room_id) REFERENCES ehotels.room
);