CREATE DATABASE ehotels;

CREATE TABLE adress (
  id int NOT NULL,
  street_name VARCHAR(20) NOT NULL,
  street_number INT NOT NULL,
  apt_number INT,
  city VARCHAR(20) NOT NULL,
  province VARCHAR(20) NOT NULL,
  zip VARCHAR(6) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE hotel_chain (
  name VARCHAR(20) NOT NULL,
  adress INT NOT NULL,
  email VARCHAR(40) NOT NULL,
  phone INT NOT NULL,
  PRIMARY KEY (name),
  FOREIGN KEY (adress) REFERENCES adress
);

CREATE TABLE hotel (
  id INT NOT NULL,
  hotel_chain_name VARCHAR(20) NOT NULL,
  rating INT,
  adress INT NOT NULL,
  email VARCHAR(40) NOT NULL,
  phone INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (hotel_chain_name) REFERENCES hotel_chain,
  FOREIGN KEY (adress) REFERENCES adress
);

CREATE TABLE employee (
  email VARCHAR(40) NOT NULL,
  nas INT NOT NULL,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  adress INT NOT NULL,
  hotel_id INT NOT NULL,
  roles VARCHAR(20)[],
  password VARCHAR(20) NOT NULL,
  PRIMARY KEY (email),
  UNIQUE (nas),
  FOREIGN KEY (adress) REFERENCES adress,
  FOREIGN KEY (hotel_id) REFERENCES hotel
);

CREATE TABLE client (
  email VARCHAR(40) NOT NULL,
  nas INT NOT NULL,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  adress INT NOT NULL,
  registration_date TIMESTAMP NOT NULL,
  password VARCHAR(20) NOT NULL,
  PRIMARY KEY (email),
  UNIQUE (nas),
  FOREIGN KEY (adress) REFERENCES adress
);

CREATE TABLE room (
  id INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  commodities VARCHAR(20)[],
  capacity INT NOT NULL,
  sea_vue BOOLEAN,
  mountain_vue BOOLEAN,
  extendable BOOLEAN,
  issues TEXT[],
  hotel_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (hotel_id) REFERENCES hotel
);

CREATE TABLE reservation (
  id INT NOT NULL,
  room_id INT,
  client_email VARCHAR(40),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (room_id) REFERENCES room,
  FOREIGN KEY (client_email) REFERENCES client
);

CREATE TABLE location (
  id INT NOT NULL,
  room_id INT,
  client_email VARCHAR(40),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (room_id) REFERENCES room,
  FOREIGN KEY (client_email) REFERENCES client
);