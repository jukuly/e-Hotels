import { QueryResult } from 'pg';
import pool from './database';
import { HotelChain } from './types/interfaces';

//Select specific hotel chain
export async function getHotelChain(id: string): Promise<QueryResult<HotelChain>> {
  return await pool.query<HotelChain>(
    `SELECT * FROM hotel_chain
    WHERE id = $1`,
    [id]
  );
}