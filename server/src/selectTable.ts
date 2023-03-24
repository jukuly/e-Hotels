import { QueryResult } from 'pg';
import pool from './database';
import { Address, Client, Employee, Hotel, HotelChain, Reservation, Room, SearchFilters } from './types/interfaces';

//Select specific hotel chain
export async function getHotelChain(id: string): Promise<QueryResult<HotelChain>> {
  return await pool.query<HotelChain>(
    `SELECT * FROM hotel_chain
    WHERE id = $1`,
    [id]
  );
}

//Select hotels of a specific hotel chain
export async function getHotelsFromHotelChain(id: string): Promise<QueryResult<Hotel>> {
  return await pool.query<Hotel>(
    `SELECT * FROM hotel
    WHERE hotel_chain_id = $1`,
    [id]
  );
}

//Select hotel with its id
export async function getHotelById(id: string): Promise<QueryResult<Hotel>> {
  return await pool.query<Hotel>(
    `SELECT * FROM hotel
    WHERE id = $1`,
    [id]
  );
}

//Select the address of a specific id
export async function getAddress(id: string): Promise<QueryResult<Address>> {
  return await pool.query<Address>(
    `SELECT * FROM address
    WHERE id = $1`,
    [id]
  );
}

//Select a client
export async function getClient(id: String): Promise<QueryResult<Client>> {
  return await pool.query<Client>(
    `SELECT * FROM client
    WHERE id = $1`,
    [id]
  );
}

//Select an employee
export async function getEmployee(id: String): Promise<QueryResult<Employee>> {
  return await pool.query<Employee>(
    `SELECT * FROM employee
    WHERE id = $1`,
    [id]
  );
}

//Select rooms based on a set of criteria
export async function getRooms(filters: SearchFilters): Promise<QueryResult<Room>> {

  let query = `SELECT * FROM room WHERE 1 = 1`;

  const filterValues = [];
  let valuePos = 1;

  if (filters.startDate && filters.endDate) {
    query += ` AND NOT EXISTS (
      SELECT * FROM reservation
      WHERE room_id = room.id
        AND ((start_date <= $${valuePos} AND end_date >= $${valuePos}) OR (end_date >= $${valuePos + 1} AND start_date <= $${valuePos + 1}))
    )
    AND NOT EXISTS (
      SELECT * FROM location
      WHERE room_id = room.id
        AND ((start_date <= $${valuePos} AND end_date >= $${valuePos}) OR (end_date >= $${valuePos + 1} AND start_date <= $${valuePos + 1}))
    )`;
    filterValues.push(filters.startDate);
    filterValues.push(filters.endDate);
    valuePos += 2;
  }

  if (filters.capacity) {
    query += ` AND capacity > $${valuePos}`;
    filterValues.push(filters.capacity);
    valuePos++;
  }

  if (filters.area) {
    query += ` AND area > $${valuePos}`;
    filterValues.push(filters.area);
    valuePos++;
  }

  if (filters.chainName) {
    query += ` AND hotel_id IN (
      SELECT hotel.id FROM hotel LEFT OUTER JOIN hotel_chain ON hotel.hotel_chain_id = hotel_chain.id 
      WHERE name = $${valuePos}
    )`;
    filterValues.push(filters.chainName);
    valuePos++;
  }

  if (filters.city) {
    query += ` AND hotel_id IN (
      SELECT hotel.id FROM hotel LEFT OUTER JOIN address ON address.id = hotel.id 
      WHERE city = $${valuePos}
    )`;
    filterValues.push(filters.city);
    valuePos++;
  }

  if (filters.hotelRating) {
    query += ` AND (
      SELECT rating FROM hotel 
      WHERE id = room.hotel_id
    ) > $${valuePos}`;
    filterValues.push(filters.hotelRating);
    valuePos++;
  }

  if (filters.numberOfRoomInHotel) {
    query += ` AND (
      SELECT COUNT(*) FROM room 
      WHERE hotel_id = room.hotel_id
    ) > $${valuePos} `;
    filterValues.push(filters.numberOfRoomInHotel);
    valuePos++;
  }

  if (filters.priceMin) {
    query += ` AND price >= $${valuePos}`;
    filterValues.push(filters.priceMin);
    valuePos++;
  }

  if (filters.priceMax) {
    query += ` AND price <= $${valuePos}`;
    filterValues.push(filters.priceMax);
    valuePos++;
  }

  if (filters.specificHotelId) {
    query += ` AND hotel_id = $${valuePos}`;
    filterValues.push(filters.specificHotelId);
    valuePos++;
  }

  return await pool.query<Room>(
    query,
    filterValues
  );
}

//Select reservations of a specific hotel
export async function getReservationsFromHotel(hotel_id: string): Promise<QueryResult<Reservation>> {
  return await pool.query<Reservation>(
    `SELECT * FROM reservation
    WHERE room_id IN (
      SELECT id FROM room
      WHERE hotel_id = $1
    )
    AND id NOT IN (SELECT id FROM location)`,
    [hotel_id]
  );
}

//Select the email from a client
export async function getClientEmail(client_id: string): Promise<QueryResult<Client>> {
  return await pool.query<Client>(
    `SELECT email FROM client
    WHERE id = $1`,
    [client_id]
  );
}