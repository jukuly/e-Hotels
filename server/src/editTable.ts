import { QueryResult } from 'pg';
import { hashPassword } from './auth';
import pool from './database';
import { Address, Client, Employee, Hotel, HotelChain, Location, Reservation, Room } from './types/interfaces';

//Create address
async function addAddress(address: Address): Promise<QueryResult<Address>> {
  return await pool.query(
    `INSERT INTO address (id, street_name, street_number, apt_number, city, province, zip) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [address.id, address.street_name, address.street_number, address.apt_number, address.city, address.province, address.zip]
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

//Create client
export async function createClient(client: Client): Promise<QueryResult<Client>> {

  await pool.query('BEGIN');
  const clientCreated = await pool.query(
    `INSERT INTO client (email, nas, first_name, last_name, password) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [client.email, client.nas, client.first_name, client.last_name, await hashPassword(client.password!)]
  );
  await addAddress({ id: clientCreated.rows[0].id, ...client.address });
  await pool.query('COMMIT');

  return clientCreated;
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

//Create employee
export async function createEmployee(employee: Employee): Promise<QueryResult<Employee>> {

  await pool.query('BEGIN');
  const employeeCreated = await pool.query(
    `INSERT INTO employee (email, nas, first_name, last_name, hotel_id, roles, password) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`,
    [employee.email, employee.nas, employee.first_name, employee.last_name, employee.hotel_id, employee.roles, await hashPassword(employee.password!)]
  );
  const addressNoId = employee.address;
  addressNoId!.id = employeeCreated.rows[0].id;
  await addAddress(addressNoId!);
  await pool.query('COMMIT');

  return employeeCreated;
}

//Update employee
export async function updateEmployee(employee: Employee): Promise<QueryResult<Employee>> {
  try {
    await pool.query('BEGIN');
    const employeeUpdated = await pool.query<Employee>(
      `UPDATE employee
      SET
        ${employee.first_name ? 'first_name = $2,' : ''}
        ${employee.last_name ? 'last_name = $3,' : ''}
        ${employee.email ? 'email = $4,' : ''}
        ${employee.nas ? 'nas = $5,' : ''}
        ${employee.roles ? 'roles = $6' : ''}
      WHERE id = $1
      RETURNING *`,
      [employee.id, employee.first_name, employee.last_name, employee.email, employee.nas, employee.roles]
    );
    if (employee.address) await updateAddress({ id: employee.id, ...employee.address });
    await pool.query('COMMIT'); 

    return employeeUpdated;
  } catch (err: any) {
    await pool.query('ROLLBACK');
    if (err.code === '23505') {
      throw { code: 'user-already-exists', message: 'This NAS and/or email is already taken', error: err };
    }
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
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

//Delete user
export async function deleteUser(uid: string, type: 'client' | 'employee' | 'hotel-chain' | undefined): Promise<QueryResult<Client | Employee | HotelChain>> {
  if (!type) throw { code: 'unknown', message: 'Unexpected error' };
  try {
    const userDeleted = await pool.query<Client | Employee | HotelChain>(
      `DELETE FROM ${type}
      WHERE id = $1
      RETURNING *`,
      [uid]
    );
    return userDeleted
  } catch (err: any) {
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Create hotel
export async function createHotel(hotel: Hotel): Promise<QueryResult<Hotel>> {
  try {
    await pool.query('BEGIN');
    const hotelCreated = await pool.query<Hotel>(
      `INSERT INTO hotel (hotel_chain_id, email, phone) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [hotel.hotel_chain_id, hotel.email, hotel.phone]
    );
    const hotelCreatedAddress = await addAddress({ id: hotelCreated.rows[0].id, ...hotel.address });

    //Add a temporary manager for the hotel
    await createEmployee({
      email: hotel.email,
      nas: 0,
      first_name: 'Temporary',
      last_name: 'Manager',
      hotel_id: hotelCreated.rows[0].id,
      roles: ['manager'],
      password: await hashPassword('manager'),
      address: hotelCreatedAddress.rows[0]
    });
    await pool.query('COMMIT');
  
    return hotelCreated;
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

//Delete hotel
export async function deleteHotel(hotelId: string): Promise<QueryResult<Hotel>> {
  try {
    const hotelDeleted = await pool.query<Hotel>(
      `DELETE FROM hotel
      WHERE id = $1
      RETURNING *`,
      [hotelId]
    );
    
    return hotelDeleted
  } catch (err: any) {
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Create room
export async function createRoom(room: Room): Promise<QueryResult<Room>> {
  try {
    const roomCreated = await pool.query<Room>(
      `INSERT INTO room (price, commodities, capacity, sea_vue, mountain_vue, extendable, issues, hotel_id, area) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [room.price, room.commodities, room.capacity, !!room.sea_vue, !!room.mountain_vue, !!room.extendable, room.issues, room.hotel_id, room.area]
    );
  
    return roomCreated;
  } catch (err: any) {
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Update room
export async function updateRoom(room: Room): Promise<QueryResult<Room>> {
  try {
    const roomUpdated = await pool.query<Room>(
      `UPDATE room
      SET
        ${room.price ? 'price = $2,' : ''}
        ${room.commodities ? 'commodities = $3,' : ''}
        ${room.capacity ? 'capacity = $4,' : ''}
        sea_vue = $5,
        mountain_vue = $6,
        extendable = $7,
        ${room.issues ? 'issues = $8,' : ''}
        ${room.area ? 'area = $9' : ''}
      WHERE id = $1
      RETURNING *`,
      [room.id, room.price, room.commodities, room.capacity, !!room.sea_vue, !!room.mountain_vue, !!room.extendable, room.issues, room.area]
    );

    return roomUpdated;
  } catch (err: any) {
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Delete room
export async function deleteRoom(roomId: string): Promise<QueryResult<Room>> {
  try {
    const roomDeleted = await pool.query<Room>(
      `DELETE FROM room
      WHERE id = $1
      RETURNING *`,
      [roomId]
    );
    
    return roomDeleted
  } catch (err: any) {
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Create reservation
export async function createReservation(reservation: Reservation): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO reservation (room_id, client_id, start_date, end_date) 
      VALUES ($1, $2, $3, $4)`,
      [reservation.room_id, reservation.client_id, reservation.start_date, reservation.end_date]
    );
  } catch (err: any) {
    if (err.code === '42069') {
      throw { code: 'invalid-time-interval', message: 'This time interval is already occupied.', error: err };
    }
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

//Create location
export async function createLocation(location: Location): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO location (${location.id ? 'id, ' : ''}room_id, client_id, employee_id, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5${location.id ? ', $6' : ''})`,
      location.id ? [location.id, location.room_id, location.client_id, location.employee_id, location.start_date, location.end_date]
        : [location.room_id, location.client_id, location.employee_id, location.start_date, location.end_date]
    );
  } catch (err: any) {
    if (err.code === '42069') {
      throw { code: 'invalid-time-interval', message: 'This time interval is already occupied.', error: err };
    }
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}