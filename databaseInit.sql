CREATE DATABASE ehotels;

/* Navigate to ehotels database: \c ehotels */ 

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
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$'),
  CHECK (phone >= 0 AND phone <= 9999999999)
);

CREATE TABLE hotel (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  hotel_chain_id UUID NOT NULL,
  rating INT,
  email VARCHAR(40) NOT NULL,
  phone BIGINT NOT NULL,
  FOREIGN KEY (hotel_chain_id) REFERENCES hotel_chain ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$'),
  CHECK (rating >= 0 AND rating <= 5),
  CHECK (phone >= 0 AND phone <= 9999999999)
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
  FOREIGN KEY (hotel_id) REFERENCES hotel ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$'),
  CHECK (nas >= 0 AND nas <= 999999999)
);

CREATE TABLE client (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  email VARCHAR(40) NOT NULL UNIQUE,
  nas INT NOT NULL UNIQUE,
  first_name VARCHAR(20) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  password VARCHAR NOT NULL,
  CHECK (email ~ '^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*([.][a-zA-Z]{2,3})+$'),
  CHECK (nas >= 0 AND nas <= 999999999)
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
  FOREIGN KEY (hotel_id) REFERENCES hotel ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK (price >= 0),
  CHECK (capacity >= 0),
  CHECK (area >= 0)
);

CREATE TABLE reservation (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  room_id UUID,
  client_id UUID,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES room ON UPDATE CASCADE ON DELETE SET NULL,
  CHECK (end_date >= start_date)
);

CREATE TABLE location (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  room_id UUID,
  client_id UUID,
  employee_id UUID,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES employee ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES room ON UPDATE CASCADE ON DELETE SET NULL,
  CHECK (end_date >= start_date)
);

/* CHECK DUPLICATE EMAIL ON USER CREATION ************************/

CREATE FUNCTION check_duplicate_email_function() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM client WHERE email = NEW.email
    UNION SELECT 1 FROM employee WHERE email = NEW.email
    UNION SELECT 1 FROM hotel_chain WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'Email already used' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_duplicate_email_client BEFORE INSERT ON client
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_email_function();

CREATE TRIGGER check_duplicate_email_employee BEFORE INSERT ON employee
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_email_function();

CREATE TRIGGER check_duplicate_email_hotel_chain BEFORE INSERT ON hotel_chain
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_email_function();

/*****************************************************************/

/* DELETE ADDRESS ON DELETE HOTEL_CHAIN, HOTEL, EMPLOYEE, CLIENT */

CREATE FUNCTION delete_address_function() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM address WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_address_hotel_chain AFTER DELETE ON hotel_chain 
FOR EACH ROW
EXECUTE FUNCTION delete_address_function();

CREATE TRIGGER delete_address_hotel AFTER DELETE ON hotel 
FOR EACH ROW
EXECUTE FUNCTION delete_address_function();

CREATE TRIGGER delete_address_client AFTER DELETE ON client 
FOR EACH ROW
EXECUTE FUNCTION delete_address_function();

CREATE TRIGGER delete_address_employee AFTER DELETE ON employee 
FOR EACH ROW
EXECUTE FUNCTION delete_address_function();

/*****************************************************************/

/* CHECK FOR ROOM DISPONIBILITY **********************************/

CREATE FUNCTION check_room_disponibility_function() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservation 
    WHERE ((start_date <= NEW.start_date AND end_date >= NEW.start_date) OR (end_date >= NEW.end_date AND start_date <= NEW.end_date)) AND room_id = NEW.room_id AND id != NEW.id
    UNION 
    SELECT 1 FROM location 
    WHERE ((start_date <= NEW.start_date AND end_date >= NEW.start_date) OR (end_date >= NEW.end_date AND start_date <= NEW.end_date)) AND room_id = NEW.room_id AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Invalid time interval' USING ERRCODE = '42069';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 

CREATE TRIGGER check_availability_reservation BEFORE INSERT ON reservation
FOR EACH ROW
EXECUTE FUNCTION check_room_disponibility_function();

CREATE TRIGGER check_availability_location BEFORE INSERT ON location
FOR EACH ROW
EXECUTE FUNCTION check_room_disponibility_function();

/*****************************************************************/

/* Views *********************************************************/

CREATE VIEW numberOfRoomsPerCity (city, numberOfRooms) AS 
SELECT city, COUNT(rooms.id) AS numberOfRooms FROM address JOIN rooms ON address.id = rooms.hotel_id
GROUP BY city;

CREATE VIEW hotelCapacity (hotel_id, capacity) AS 
SELECT hotel_id, SUM(capacity) AS capacity FROM rooms
GROUP BY hotel_id;

/*****************************************************************/

/* Index *********************************************************/

CREATE INDEX room_price_idx ON room (price);
CREATE INDEX room_hotel_id_idx ON room (hotel_id);
CREATE INDEX reservation_start_date_end_date ON reservation (start_date, end_date);
CREATE INDEX location_start_date_end_date ON location (start_date, end_date);

/*****************************************************************/

/* Insert data */
/* The passwords inserted corresponds to "12345" */

/* Hotel chains */

INSERT INTO hotel_chain (id, name, email, phone, password)
VALUES 
  ('aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 'HotelChain1', 'hchain1@ehotel.com', 8190000000, '$2b$10$p54dVw3p0JetE85Fcx3b115ee5-8930-4cd9-9677-221ff1787ecae.a4/jvPKXF84O0ucAduXCPHEvxzb/Vq'),
  ('f9fc221a-38ac-4214-aa78-7d3aba4f4096', 'HotelChain2', 'hchain2@ehotel.com', 8190000001, '$2b$10$p54dVw3p0JetE85Fcx3b115ee5-8930-4cd9-9677-221ff1787ecae.a4/jvPKXF84O0ucAduXCPHEvxzb/Vq'),
  ('86db9d04-8121-4549-a942-cfdaa7f5b0e2', 'HotelChain3', 'hchain3@ehotel.com', 8190000002, '$2b$10$p54dVw3p0JetE85Fcx3b115ee5-8930-4cd9-9677-221ff1787ecae.a4/jvPKXF84O0ucAduXCPHEvxzb/Vq'),
  ('f23287b3-d8be-4f25-a47d-b040140d5b45', 'HotelChain4', 'hchain4@ehotel.com', 8190000003, '$2b$10$p54dVw3p0JetE85Fcx3b115ee5-8930-4cd9-9677-221ff1787ecae.a4/jvPKXF84O0ucAduXCPHEvxzb/Vq'),
  ('9b064dff-b024-4be4-9764-694879202c7a', 'HotelChain5', 'hchain5@ehotel.com', 8190000004, '$2b$10$p54dVw3p0JetE85Fcx3b115ee5-8930-4cd9-9677-221ff1787ecae.a4/jvPKXF84O0ucAduXCPHEvxzb/Vq');
INSERT INTO address (id, street_name, street_number, city, province, zip)
VALUES 
  ('aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 'des Chaines', 1, 'Gatineau', 'Québec', 'A0A0A0'),
  ('f9fc221a-38ac-4214-aa78-7d3aba4f4096', 'des Chaines', 2, 'Sherbrooke', 'Québec', 'A0A0A0'),
  ('86db9d04-8121-4549-a942-cfdaa7f5b0e2', 'des Chaines', 3, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('f23287b3-d8be-4f25-a47d-b040140d5b45', 'des Chaines', 4, 'Montréal', 'Québec', 'A0A0A0'),
  ('9b064dff-b024-4be4-9764-694879202c7a', 'des Chaines', 5, 'Waterloo', 'Wallonie', 'A0A0A0');

/* Hotels */

INSERT INTO hotel (id, hotel_chain_id, rating, email, phone)
VALUES 
  ('2eb38158-85a2-4394-97c6-7eca8dbe4511', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 0, 'hotel1@hchain1.com', 8190000000),
  ('29535be6-d8c2-489e-9737-52dcc4a8bca4', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 1, 'hotel2@hchain1.com', 8190000010),
  ('8e66657b-a6c3-4c09-b405-3ffb6948f147', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 2, 'hotel3@hchain1.com', 8190000020),
  ('081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 3, 'hotel4@hchain1.com', 8190000030),
  ('f4f3b3b9-6673-4037-8629-242eb877880c', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 4, 'hotel5@hchain1.com', 8190000040),
  ('a03bfb08-a585-4865-b04b-307642711f1b', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 5, 'hotel6@hchain1.com', 8190000050),
  ('a097ed19-94a4-4b1e-b227-bda11ad53451', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 0, 'hotel7@hchain1.com', 8190000060),
  ('01265846-6d04-41a0-91c1-11fd0e996bbf', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 1, 'hotel8@hchain1.com', 8190000070),
  ('23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 2, 'hotel1@hchain2.com', 8190000001),
  ('45113392-59f1-44e8-8cd6-87a32966a8ff', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 3, 'hotel2@hchain2.com', 8190000011),
  ('d5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 4, 'hotel3@hchain2.com', 8190000021),
  ('89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 5, 'hotel4@hchain2.com', 8190000031),
  ('fcc71ce6-11f7-4340-991e-7a39611d9121', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 0, 'hotel5@hchain2.com', 8190000041),
  ('a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 1, 'hotel6@hchain2.com', 8190000051),
  ('a629a496-a5c4-4577-88cf-df64181236a7', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 2, 'hotel7@hchain2.com', 8190000061),
  ('32160cb1-e31e-4b93-89aa-9069766619b4', 'f9fc221a-38ac-4214-aa78-7d3aba4f4096', 3, 'hotel8@hchain2.com', 8190000071),
  ('2ed0560a-30a6-420f-889a-9a1bf29e6345', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 4, 'hotel1@hchain3.com', 8190000002),
  ('66826249-0409-4052-accb-4161d2d381da', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 5, 'hotel2@hchain3.com', 8190000012),
  ('6fdbf3df-8873-4518-883e-14982ee76f5d', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 0, 'hotel3@hchain3.com', 8190000022),
  ('6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 1, 'hotel4@hchain3.com', 8190000032),
  ('2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 2, 'hotel5@hchain3.com', 8190000042),
  ('c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 3, 'hotel6@hchain3.com', 8190000052),
  ('a3b6aba1-80e9-436c-b580-df442db7e8c6', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 4, 'hotel7@hchain3.com', 8190000062),
  ('c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', '86db9d04-8121-4549-a942-cfdaa7f5b0e2', 5, 'hotel8@hchain3.com', 8190000072),
  ('8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 0, 'hotel1@hchain4.com', 8190000003),
  ('39ba7a44-1908-4d5f-8f64-47c219b4a156', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 1, 'hotel2@hchain4.com', 8190000013),
  ('f3618cc1-7542-4145-9ba7-85323487de3f', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 2, 'hotel3@hchain4.com', 8190000023),
  ('d67c3e05-ef30-40fb-a092-ae77e735c62c', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 3, 'hotel4@hchain4.com', 8190000033),
  ('3b115ee5-8930-4cd9-9677-221ff1787eca', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 4, 'hotel5@hchain4.com', 8190000043),
  ('984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 5, 'hotel6@hchain4.com', 8190000053),
  ('f2560436-f6ee-404a-bd4c-e77cec3f9962', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 0, 'hotel7@hchain4.com', 8190000063),
  ('ae7150ba-43d2-440c-8f82-c52cb6790220', 'f23287b3-d8be-4f25-a47d-b040140d5b45', 1, 'hotel8@hchain4.com', 8190000073),
  ('31bb1960-ca4a-4f88-ac65-d77b09d35ffc', '9b064dff-b024-4be4-9764-694879202c7a', 2, 'hotel1@hchain5.com', 8190000004),
  ('5f18d955-b2f7-48ea-8145-4f1409d036a6', '9b064dff-b024-4be4-9764-694879202c7a', 3, 'hotel2@hchain5.com', 8190000014),
  ('03751817-8975-4353-aa72-9766ffc25d26', '9b064dff-b024-4be4-9764-694879202c7a', 4, 'hotel3@hchain5.com', 8190000024),
  ('1a1aeac6-50a8-4478-8d64-da8966fdd528', '9b064dff-b024-4be4-9764-694879202c7a', 5, 'hotel4@hchain5.com', 8190000034),
  ('67c80747-a03b-4d46-9ad0-381973864cc1', '9b064dff-b024-4be4-9764-694879202c7a', 0, 'hotel5@hchain5.com', 8190000044),
  ('8be56834-5bfa-4bde-be97-96d6b0ef99b2', '9b064dff-b024-4be4-9764-694879202c7a', 1, 'hotel6@hchain5.com', 8190000054),
  ('29e26dd9-6790-4fa5-91b4-a837cbc4d612', '9b064dff-b024-4be4-9764-694879202c7a', 2, 'hotel7@hchain5.com', 8190000064),
  ('c902574d-b0a2-4679-a48b-6c57d2e39b22', 'aabe7e66-c0a7-4141-b9e2-01a0db917f3b', 3, 'hotel8@hchain5.com', 8190000074);
  
INSERT INTO address (id, street_name, street_number, city, province, zip)
VALUES 
  ('2eb38158-85a2-4394-97c6-7eca8dbe4511', 'des Hotels', 11, 'Gatineau', 'Québec', 'A0A0A0'),
  ('29535be6-d8c2-489e-9737-52dcc4a8bca4', 'des Hotels', 12, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('8e66657b-a6c3-4c09-b405-3ffb6948f147', 'des Hotels', 13, 'Gatineau', 'Québec', 'A0A0A0'),
  ('081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 'des Hotels', 14, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('f4f3b3b9-6673-4037-8629-242eb877880c', 'des Hotels', 15, 'Gatineau', 'Québec', 'A0A0A0'),
  ('a03bfb08-a585-4865-b04b-307642711f1b', 'des Hotels', 16, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('a097ed19-94a4-4b1e-b227-bda11ad53451', 'des Hotels', 17, 'Gatineau', 'Québec', 'A0A0A0'),
  ('01265846-6d04-41a0-91c1-11fd0e996bbf', 'des Hotels', 18, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 'des Hotels', 21, 'Gatineau', 'Québec', 'A0A0A0'),
  ('45113392-59f1-44e8-8cd6-87a32966a8ff', 'des Hotels', 22, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('d5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 'des Hotels', 23, 'Gatineau', 'Québec', 'A0A0A0'),
  ('89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 'des Hotels', 24, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('fcc71ce6-11f7-4340-991e-7a39611d9121', 'des Hotels', 25, 'Gatineau', 'Québec', 'A0A0A0'),
  ('a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 'des Hotels', 26, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('a629a496-a5c4-4577-88cf-df64181236a7', 'des Hotels', 27, 'Gatineau', 'Québec', 'A0A0A0'),
  ('32160cb1-e31e-4b93-89aa-9069766619b4', 'des Hotels', 28, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('2ed0560a-30a6-420f-889a-9a1bf29e6345', 'des Hotels', 31, 'Gatineau', 'Québec', 'A0A0A0'),
  ('66826249-0409-4052-accb-4161d2d381da', 'des Hotels', 32, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('6fdbf3df-8873-4518-883e-14982ee76f5d', 'des Hotels', 33, 'Gatineau', 'Québec', 'A0A0A0'),
  ('6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', 'des Hotels', 34, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', 'des Hotels', 35, 'Gatineau', 'Québec', 'A0A0A0'),
  ('c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', 'des Hotels', 36, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('a3b6aba1-80e9-436c-b580-df442db7e8c6', 'des Hotels', 37, 'Gatineau', 'Québec', 'A0A0A0'),
  ('c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', 'des Hotels', 38, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 'des Hotels', 41, 'Gatineau', 'Québec', 'A0A0A0'),
  ('39ba7a44-1908-4d5f-8f64-47c219b4a156', 'des Hotels', 42, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('f3618cc1-7542-4145-9ba7-85323487de3f', 'des Hotels', 43, 'Gatineau', 'Québec', 'A0A0A0'),
  ('d67c3e05-ef30-40fb-a092-ae77e735c62c', 'des Hotels', 44, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('3b115ee5-8930-4cd9-9677-221ff1787eca', 'des Hotels', 45, 'Gatineau', 'Québec', 'A0A0A0'),
  ('984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 'des Hotels', 46, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('f2560436-f6ee-404a-bd4c-e77cec3f9962', 'des Hotels', 47, 'Gatineau', 'Québec', 'A0A0A0'),
  ('ae7150ba-43d2-440c-8f82-c52cb6790220', 'des Hotels', 48, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('31bb1960-ca4a-4f88-ac65-d77b09d35ffc', 'des Hotels', 51, 'Gatineau', 'Québec', 'A0A0A0'),
  ('5f18d955-b2f7-48ea-8145-4f1409d036a6', 'des Hotels', 52, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('03751817-8975-4353-aa72-9766ffc25d26', 'des Hotels', 53, 'Gatineau', 'Québec', 'A0A0A0'),
  ('1a1aeac6-50a8-4478-8d64-da8966fdd528', 'des Hotels', 54, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('67c80747-a03b-4d46-9ad0-381973864cc1', 'des Hotels', 55, 'Gatineau', 'Québec', 'A0A0A0'),
  ('8be56834-5bfa-4bde-be97-96d6b0ef99b2', 'des Hotels', 56, 'Ottawa', 'Ontario', 'A0A0A0'),
  ('29e26dd9-6790-4fa5-91b4-a837cbc4d612', 'des Hotels', 57, 'Gatineau', 'Québec', 'A0A0A0'),
  ('c902574d-b0a2-4679-a48b-6c57d2e39b22', 'des Hotels', 58, 'Ottawa', 'Ontario', 'A0A0A0');

/* Rooms */

INSERT INTO room (price, capacity, hotel_id, area)
VALUES 
  (1, 1, '2eb38158-85a2-4394-97c6-7eca8dbe4511', 1),
  (2, 2, '2eb38158-85a2-4394-97c6-7eca8dbe4511', 2),
  (3, 3, '2eb38158-85a2-4394-97c6-7eca8dbe4511', 3),
  (4, 4, '2eb38158-85a2-4394-97c6-7eca8dbe4511', 4),
  (5, 5, '2eb38158-85a2-4394-97c6-7eca8dbe4511', 5),
  (1, 1, '29535be6-d8c2-489e-9737-52dcc4a8bca4', 1),
  (2, 2, '29535be6-d8c2-489e-9737-52dcc4a8bca4', 2),
  (3, 3, '29535be6-d8c2-489e-9737-52dcc4a8bca4', 3),
  (4, 4, '29535be6-d8c2-489e-9737-52dcc4a8bca4', 4),
  (5, 5, '29535be6-d8c2-489e-9737-52dcc4a8bca4', 5),
  (1, 1, '8e66657b-a6c3-4c09-b405-3ffb6948f147', 1),
  (2, 2, '8e66657b-a6c3-4c09-b405-3ffb6948f147', 2),
  (3, 3, '8e66657b-a6c3-4c09-b405-3ffb6948f147', 3),
  (4, 4, '8e66657b-a6c3-4c09-b405-3ffb6948f147', 4),
  (5, 5, '8e66657b-a6c3-4c09-b405-3ffb6948f147', 5),
  (1, 1, '081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 1),
  (2, 2, '081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 2),
  (3, 3, '081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 3),
  (4, 4, '081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 4),
  (5, 5, '081f47b7-a3ea-4bcf-9c1c-80914c7316fc', 5),
  (1, 1, 'f4f3b3b9-6673-4037-8629-242eb877880c', 1),
  (2, 2, 'f4f3b3b9-6673-4037-8629-242eb877880c', 2),
  (3, 3, 'f4f3b3b9-6673-4037-8629-242eb877880c', 3),
  (4, 4, 'f4f3b3b9-6673-4037-8629-242eb877880c', 4),
  (5, 5, 'f4f3b3b9-6673-4037-8629-242eb877880c', 5),
  (1, 1, 'a03bfb08-a585-4865-b04b-307642711f1b', 1),
  (2, 2, 'a03bfb08-a585-4865-b04b-307642711f1b', 2),
  (3, 3, 'a03bfb08-a585-4865-b04b-307642711f1b', 3),
  (4, 4, 'a03bfb08-a585-4865-b04b-307642711f1b', 4),
  (5, 5, 'a03bfb08-a585-4865-b04b-307642711f1b', 5),
  (1, 1, 'a097ed19-94a4-4b1e-b227-bda11ad53451', 1),
  (2, 2, 'a097ed19-94a4-4b1e-b227-bda11ad53451', 2),
  (3, 3, 'a097ed19-94a4-4b1e-b227-bda11ad53451', 3),
  (4, 4, 'a097ed19-94a4-4b1e-b227-bda11ad53451', 4),
  (5, 5, 'a097ed19-94a4-4b1e-b227-bda11ad53451', 5),
  (1, 1, '01265846-6d04-41a0-91c1-11fd0e996bbf', 1),
  (2, 2, '01265846-6d04-41a0-91c1-11fd0e996bbf', 2),
  (3, 3, '01265846-6d04-41a0-91c1-11fd0e996bbf', 3),
  (4, 4, '01265846-6d04-41a0-91c1-11fd0e996bbf', 4),
  (5, 5, '01265846-6d04-41a0-91c1-11fd0e996bbf', 5),
  (1, 1, '23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 1),
  (2, 2, '23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 2),
  (3, 3, '23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 3),
  (4, 4, '23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 4),
  (5, 5, '23d9f94e-7f46-4c8f-b18b-47eb16d0d94e', 5),
  (1, 1, '45113392-59f1-44e8-8cd6-87a32966a8ff', 1),
  (2, 2, '45113392-59f1-44e8-8cd6-87a32966a8ff', 2),
  (3, 3, '45113392-59f1-44e8-8cd6-87a32966a8ff', 3),
  (4, 4, '45113392-59f1-44e8-8cd6-87a32966a8ff', 4),
  (5, 5, '45113392-59f1-44e8-8cd6-87a32966a8ff', 5),
  (1, 1, 'd5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 1),
  (2, 2, 'd5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 2),
  (3, 3, 'd5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 3),
  (4, 4, 'd5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 4),
  (5, 5, 'd5dbe2cd-f412-4bcd-b617-d8bf8c517e0c', 5),
  (1, 1, '89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 1),
  (2, 2, '89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 2),
  (3, 3, '89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 3),
  (4, 4, '89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 4),
  (5, 5, '89cf0ed9-4e6a-47de-a4da-c2d8bea22c71', 5),
  (1, 1, 'fcc71ce6-11f7-4340-991e-7a39611d9121', 1),
  (2, 2, 'fcc71ce6-11f7-4340-991e-7a39611d9121', 2),
  (3, 3, 'fcc71ce6-11f7-4340-991e-7a39611d9121', 3),
  (4, 4, 'fcc71ce6-11f7-4340-991e-7a39611d9121', 4),
  (5, 5, 'fcc71ce6-11f7-4340-991e-7a39611d9121', 5),
  (1, 1, 'a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 1),
  (2, 2, 'a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 2),
  (3, 3, 'a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 3),
  (4, 4, 'a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 4),
  (5, 5, 'a7f6989a-ce42-4aa2-8f2f-420c77d4c970', 5),
  (1, 1, 'a629a496-a5c4-4577-88cf-df64181236a7', 1),
  (2, 2, 'a629a496-a5c4-4577-88cf-df64181236a7', 2),
  (3, 3, 'a629a496-a5c4-4577-88cf-df64181236a7', 3),
  (4, 4, 'a629a496-a5c4-4577-88cf-df64181236a7', 4),
  (5, 5, 'a629a496-a5c4-4577-88cf-df64181236a7', 5),
  (1, 1, '32160cb1-e31e-4b93-89aa-9069766619b4', 1),
  (2, 2, '32160cb1-e31e-4b93-89aa-9069766619b4', 2),
  (3, 3, '32160cb1-e31e-4b93-89aa-9069766619b4', 3),
  (4, 4, '32160cb1-e31e-4b93-89aa-9069766619b4', 4),
  (5, 5, '32160cb1-e31e-4b93-89aa-9069766619b4', 5),
  (1, 1, '2ed0560a-30a6-420f-889a-9a1bf29e6345', 1),
  (2, 2, '2ed0560a-30a6-420f-889a-9a1bf29e6345', 2),
  (3, 3, '2ed0560a-30a6-420f-889a-9a1bf29e6345', 3),
  (4, 4, '2ed0560a-30a6-420f-889a-9a1bf29e6345', 4),
  (5, 5, '2ed0560a-30a6-420f-889a-9a1bf29e6345', 5),
  (1, 1, '66826249-0409-4052-accb-4161d2d381da', 1),
  (2, 2, '66826249-0409-4052-accb-4161d2d381da', 2),
  (3, 3, '66826249-0409-4052-accb-4161d2d381da', 3),
  (4, 4, '66826249-0409-4052-accb-4161d2d381da', 4),
  (5, 5, '66826249-0409-4052-accb-4161d2d381da', 5),
  (1, 1, '6fdbf3df-8873-4518-883e-14982ee76f5d', 1),
  (2, 2, '6fdbf3df-8873-4518-883e-14982ee76f5d', 2),
  (3, 3, '6fdbf3df-8873-4518-883e-14982ee76f5d', 3),
  (4, 4, '6fdbf3df-8873-4518-883e-14982ee76f5d', 4),
  (5, 5, '6fdbf3df-8873-4518-883e-14982ee76f5d', 5),
  (1, 1, '6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', 1),
  (2, 2, '6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', 2),
  (3, 3, '6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', 3),
  (4, 4, '6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', 4),
  (5, 5, '6cf90a45-9ebc-4ff4-a073-d76a5e9edad4', 5),
  (1, 1, '2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', 1),
  (2, 2, '2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', 2),
  (3, 3, '2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', 3),
  (4, 4, '2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', 4),
  (5, 5, '2c0ea137-6f05-4f1a-8fda-fa07c5e392ef', 5),
  (1, 1, 'c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', 1),
  (2, 2, 'c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', 2),
  (3, 3, 'c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', 3),
  (4, 4, 'c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', 4),
  (5, 5, 'c2ff7f9c-370f-49a0-90e8-f11d8ada5d5f', 5),
  (1, 1, 'a3b6aba1-80e9-436c-b580-df442db7e8c6', 1),
  (2, 2, 'a3b6aba1-80e9-436c-b580-df442db7e8c6', 2),
  (3, 3, 'a3b6aba1-80e9-436c-b580-df442db7e8c6', 3),
  (4, 4, 'a3b6aba1-80e9-436c-b580-df442db7e8c6', 4),
  (5, 5, 'a3b6aba1-80e9-436c-b580-df442db7e8c6', 5),
  (1, 1, 'c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', 1),
  (2, 2, 'c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', 2),
  (3, 3, 'c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', 3),
  (4, 4, 'c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', 4),
  (5, 5, 'c63cf066-b65a-4c58-a7e1-13dbd2e72fc3', 5),
  (1, 1, '8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 1),
  (2, 2, '8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 2),
  (3, 3, '8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 3),
  (4, 4, '8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 4),
  (5, 5, '8680c75f-a2e4-42b6-9a54-6b7a2db9f118', 5),
  (1, 1, '39ba7a44-1908-4d5f-8f64-47c219b4a156', 1),
  (2, 2, '39ba7a44-1908-4d5f-8f64-47c219b4a156', 2),
  (3, 3, '39ba7a44-1908-4d5f-8f64-47c219b4a156', 3),
  (4, 4, '39ba7a44-1908-4d5f-8f64-47c219b4a156', 4),
  (5, 5, '39ba7a44-1908-4d5f-8f64-47c219b4a156', 5),
  (1, 1, 'f3618cc1-7542-4145-9ba7-85323487de3f', 1),
  (2, 2, 'f3618cc1-7542-4145-9ba7-85323487de3f', 2),
  (3, 3, 'f3618cc1-7542-4145-9ba7-85323487de3f', 3),
  (4, 4, 'f3618cc1-7542-4145-9ba7-85323487de3f', 4),
  (5, 5, 'f3618cc1-7542-4145-9ba7-85323487de3f', 5),
  (1, 1, 'd67c3e05-ef30-40fb-a092-ae77e735c62c', 1),
  (2, 2, 'd67c3e05-ef30-40fb-a092-ae77e735c62c', 2),
  (3, 3, 'd67c3e05-ef30-40fb-a092-ae77e735c62c', 3),
  (4, 4, 'd67c3e05-ef30-40fb-a092-ae77e735c62c', 4),
  (5, 5, 'd67c3e05-ef30-40fb-a092-ae77e735c62c', 5),
  (1, 1, '3b115ee5-8930-4cd9-9677-221ff1787eca', 1),
  (2, 2, '3b115ee5-8930-4cd9-9677-221ff1787eca', 2),
  (3, 3, '3b115ee5-8930-4cd9-9677-221ff1787eca', 3),
  (4, 4, '3b115ee5-8930-4cd9-9677-221ff1787eca', 4),
  (5, 5, '3b115ee5-8930-4cd9-9677-221ff1787eca', 5),
  (1, 1, '984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 1),
  (2, 2, '984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 2),
  (3, 3, '984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 3),
  (4, 4, '984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 4),
  (5, 5, '984a9481-ac2c-482e-8d7f-3691cfcd7dd9', 5),
  (1, 1, 'f2560436-f6ee-404a-bd4c-e77cec3f9962', 1),
  (2, 2, 'f2560436-f6ee-404a-bd4c-e77cec3f9962', 2),
  (3, 3, 'f2560436-f6ee-404a-bd4c-e77cec3f9962', 3),
  (4, 4, 'f2560436-f6ee-404a-bd4c-e77cec3f9962', 4),
  (5, 5, 'f2560436-f6ee-404a-bd4c-e77cec3f9962', 5),
  (1, 1, 'ae7150ba-43d2-440c-8f82-c52cb6790220', 1),
  (2, 2, 'ae7150ba-43d2-440c-8f82-c52cb6790220', 2),
  (3, 3, 'ae7150ba-43d2-440c-8f82-c52cb6790220', 3),
  (4, 4, 'ae7150ba-43d2-440c-8f82-c52cb6790220', 4),
  (5, 5, 'ae7150ba-43d2-440c-8f82-c52cb6790220', 5),
  (1, 1, '31bb1960-ca4a-4f88-ac65-d77b09d35ffc', 1),
  (2, 2, '31bb1960-ca4a-4f88-ac65-d77b09d35ffc', 2),
  (3, 3, '31bb1960-ca4a-4f88-ac65-d77b09d35ffc', 3),
  (4, 4, '31bb1960-ca4a-4f88-ac65-d77b09d35ffc', 4),
  (5, 5, '31bb1960-ca4a-4f88-ac65-d77b09d35ffc', 5),
  (1, 1, '5f18d955-b2f7-48ea-8145-4f1409d036a6', 1),
  (2, 2, '5f18d955-b2f7-48ea-8145-4f1409d036a6', 2),
  (3, 3, '5f18d955-b2f7-48ea-8145-4f1409d036a6', 3),
  (4, 4, '5f18d955-b2f7-48ea-8145-4f1409d036a6', 4),
  (5, 5, '5f18d955-b2f7-48ea-8145-4f1409d036a6', 5),
  (1, 1, '03751817-8975-4353-aa72-9766ffc25d26', 1),
  (2, 2, '03751817-8975-4353-aa72-9766ffc25d26', 2),
  (3, 3, '03751817-8975-4353-aa72-9766ffc25d26', 3),
  (4, 4, '03751817-8975-4353-aa72-9766ffc25d26', 4),
  (5, 5, '03751817-8975-4353-aa72-9766ffc25d26', 5),
  (1, 1, '1a1aeac6-50a8-4478-8d64-da8966fdd528', 1),
  (2, 2, '1a1aeac6-50a8-4478-8d64-da8966fdd528', 2),
  (3, 3, '1a1aeac6-50a8-4478-8d64-da8966fdd528', 3),
  (4, 4, '1a1aeac6-50a8-4478-8d64-da8966fdd528', 4),
  (5, 5, '1a1aeac6-50a8-4478-8d64-da8966fdd528', 5),
  (1, 1, '67c80747-a03b-4d46-9ad0-381973864cc1', 1),
  (2, 2, '67c80747-a03b-4d46-9ad0-381973864cc1', 2),
  (3, 3, '67c80747-a03b-4d46-9ad0-381973864cc1', 3),
  (4, 4, '67c80747-a03b-4d46-9ad0-381973864cc1', 4),
  (5, 5, '67c80747-a03b-4d46-9ad0-381973864cc1', 5),
  (1, 1, '8be56834-5bfa-4bde-be97-96d6b0ef99b2', 1),
  (2, 2, '8be56834-5bfa-4bde-be97-96d6b0ef99b2', 2),
  (3, 3, '8be56834-5bfa-4bde-be97-96d6b0ef99b2', 3),
  (4, 4, '8be56834-5bfa-4bde-be97-96d6b0ef99b2', 4),
  (5, 5, '8be56834-5bfa-4bde-be97-96d6b0ef99b2', 5),
  (1, 1, '29e26dd9-6790-4fa5-91b4-a837cbc4d612', 1),
  (2, 2, '29e26dd9-6790-4fa5-91b4-a837cbc4d612', 2),
  (3, 3, '29e26dd9-6790-4fa5-91b4-a837cbc4d612', 3),
  (4, 4, '29e26dd9-6790-4fa5-91b4-a837cbc4d612', 4),
  (5, 5, '29e26dd9-6790-4fa5-91b4-a837cbc4d612', 5),
  (1, 1, 'c902574d-b0a2-4679-a48b-6c57d2e39b22', 1),
  (2, 2, 'c902574d-b0a2-4679-a48b-6c57d2e39b22', 2),
  (3, 3, 'c902574d-b0a2-4679-a48b-6c57d2e39b22', 3),
  (4, 4, 'c902574d-b0a2-4679-a48b-6c57d2e39b22', 4),
  (5, 5, 'c902574d-b0a2-4679-a48b-6c57d2e39b22', 5);