import { QueryResult } from 'pg';
import pool from './database';
import { Address, Client, Employee, Hotel, HotelChain } from './types/interfaces';

//Create client
export async function createClient(client: Client): Promise<QueryResult<Client>> {

  await pool.query('BEGIN');
  const clientCreated = await pool.query(
    `INSERT INTO client (email, nas, first_name, last_name, password) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [client.email, client.nas, client.first_name, client.last_name, client.password]
  );
  await addAddress({ id: clientCreated.rows[0].id, ...client.address });
  await pool.query('COMMIT');

  return clientCreated;
}

//Create employee
export async function createEmployee(employee: Employee): Promise<QueryResult<Employee>> {

  await pool.query('BEGIN');
  const employeeCreated = await pool.query(
    `INSERT INTO employee (email, nas, first_name, last_name, hotel_id, roles, password) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`,
    [employee.email, employee.nas, employee.first_name, employee.last_name, employee.hotel_id, employee.roles, employee.password]
  );
  await addAddress({ id: employeeCreated.rows[0].id, ...employee.address });
  await pool.query('COMMIT');

  return employeeCreated;
}

//Create address
async function addAddress(address: Address): Promise<QueryResult<Address>> {
  return await pool.query(
    `INSERT INTO address (id, street_name, street_number, apt_number, city, province, zip) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [...Object.values(address)]
  );
}

//Update address
async function updateAddress(address: Address): Promise<QueryResult<Address>> {
  return await pool.query(
    `UPDATE address
    SET street_name = $2, street_number = $3, apt_number = $4, city = $5, province = $6, zip = $7
    WHERE id = $1`,
    [...Object.values(address)]
  );
}

//Delete address
async function deleteAddress(id: string): Promise<QueryResult<Address>> {
  return await pool.query(
    `DELETE FROM address
    WHERE id = $1
    RETURNING *`,
    [id]
  );
}

//Update hotel chain
export async function updateHotelChain(hotelChain: HotelChain): Promise<QueryResult<HotelChain>> {
  try {
    await pool.query('BEGIN');
    const hotelChainUpdated = await pool.query<HotelChain>(
      `UPDATE hotel_chain
      SET
        ${hotelChain.name ? 'name = $2,' : ''}
        ${hotelChain.email ? 'email = $3,' : ''}
        ${hotelChain.phone ? 'phone = $4' : ''}
      WHERE id = $1
      RETURNING *`,
      [hotelChain.id, hotelChain.name, hotelChain.email, hotelChain.phone]
    );
    await updateAddress({ id: hotelChain.id, ...hotelChain.address });
    await pool.query('COMMIT');

    return hotelChainUpdated;
  } catch (err: any) {
    await pool.query('ROLLBACK');
    if (err.code === '23505') {
      throw { code: 'hotel-chain-already-exists', message: 'This name and/or email and/or phone number is already taken', error: err };
    }
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Create hotel
export async function createHotel(hotel: Hotel): Promise<QueryResult<Hotel>> {
  try {
    await pool.query('BEGIN');
    const hotelCreated = await pool.query(
      `INSERT INTO hotel (hotel_chain_id, email, phone) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [hotel.hotel_chain_id, hotel.email, hotel.phone]
    );
    await addAddress({ id: hotelCreated.rows[0].id, ...hotel.address });
    await pool.query('COMMIT');
  
    return hotelCreated;
  } catch (err: any) {
    await pool.query('ROLLBACK');
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Update client
export async function updateClient(client: Client): Promise<QueryResult<Client>> {
  try {
    await pool.query('BEGIN');
    const clientUpdated = await pool.query<Client>(
      `UPDATE client
      SET
        ${client.first_name ? 'first_name = $2,' : ''}
        ${client.last_name ? 'last_name = $3,' : ''}
        ${client.email ? 'email = $4,' : ''}
        ${client.nas ? 'nas = $5' : ''}
      WHERE id = $1
      RETURNING *`,
      [client.id, client.first_name, client.last_name, client.email, client.nas]
    );
    await updateAddress({ id: client.id, ...client.address });
    await pool.query('COMMIT'); 

    return clientUpdated;
  } catch (err: any) {
    await pool.query('ROLLBACK');
    if (err.code === '23505') {
      throw { code: 'user-already-exists', message: 'This NAS and/or email is already taken', error: err };
    }
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Delete user
export async function deleteUser(uid: string, type: 'client' | 'employee' | 'hotel-chain' | undefined): Promise<QueryResult<Client | Employee | HotelChain>> {
  if (!type) throw { code: 'unknown', message: 'Unexpected error' };
  try {
    await pool.query('BEGIN');
    const userDeleted = await pool.query<Client | Employee | HotelChain>(
      `DELETE FROM ${type}
      WHERE id = $1
      RETURNING *`,
      [uid]
    );
    await deleteAddress(uid);
    await pool.query('COMMIT');
    return userDeleted
  } catch (err: any) {
    await pool.query('ROLLBACK');
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Delete hotel
export async function deleteHotel(hotelId: string): Promise<QueryResult<Hotel>> {
  try {
    await pool.query('BEGIN');
    const hotelDeleted = await pool.query<Hotel>(
      `DELETE FROM hotel
      WHERE id = $1
      RETURNING *`,
      [hotelId]
    );
    await deleteAddress(hotelId);
    await pool.query('COMMIT');
    
    return hotelDeleted
  } catch (err: any) {
    await pool.query('ROLLBACK');
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Update hotel
export async function updateHotel(hotel: Hotel): Promise<QueryResult<Hotel>> {
  try {
    await pool.query('BEGIN');
    const hotelUpdated = await pool.query<Hotel>(
      `UPDATE hotel
      SET
        ${hotel.email ? 'email = $2,' : ''}
        ${hotel.phone ? 'phone = $3' : ''}
      WHERE id = $1
      RETURNING *`,
      [hotel.id, hotel.email, hotel.phone]
    );
    await updateAddress({ id: hotel.id, ...hotel.address });
    await pool.query('COMMIT');

    return hotelUpdated;
  } catch (err: any) {
    await pool.query('ROLLBACK');
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}