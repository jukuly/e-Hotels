import { QueryResult } from 'pg';
import pool from './database';
import { Address, Hotel, HotelChain } from './types/interfaces';

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

//Select the address of a specific id
export async function getAddress(id: string): Promise<QueryResult<Address>> {
  return await pool.query<Address>(
    `SELECT * FROM address
    WHERE id = $1`,
    [id]
  );
}