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