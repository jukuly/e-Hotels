import express from 'express';
import cors from 'cors';
import pool from './database';
import { QueryResult } from 'pg';

const app = express();

app.use(cors());
app.use(express.json());

//Create client
app.post('/client', async (req, res) => {
  try {
    const { email, nas, firstName, lastName, address, password } = req.body;

    //Transaction so the address is not inserted if inserting the client fails
    await pool.query('BEGIN');
    const addressPost = await addAddress({ ...address });
    const clientPost = await pool.query(
      `INSERT INTO client (email, nas, first_name, last_name, address, registration_date, password) 
      VALUES ($1, $2, $3, $4, $5, NOW(), $6) 
      RETURNING *`,
      [email, nas, firstName, lastName, addressPost.rows[0].id, password]
    );
    await pool.query('COMMIT');

    res.json(clientPost);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
  }
});

//Create employee
app.post('/employee', async (req, res) => {
  try {
    const { email, nas, firstName, lastName, address, hotelId, roles, password } = req.body;

    //Transaction so the address is not inserted if inserting the employee fails
    await pool.query('BEGIN');
    const addressPost = await addAddress({ ...address });
    const employeePost = await pool.query(
      `INSERT INTO employee (email, nas, first_name, last_name, address, hotel_id, roles, registration_date, password) 
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7) 
      RETURNING *`,
      [email, nas, firstName, lastName, addressPost.rows[0].id, hotelId, roles, password]
    );
    await pool.query('COMMIT');

    res.json(employeePost);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
  }
});

//Update client
app.put('/client/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { nas, firstName, lastName, address, password } = req.body;
    if (address) {
      const addressId: QueryResult<{id: number}> = await pool.query(
        `SELECT address 
        FROM client 
        WHERE email = $1`,
        [email]
      );
      await updateAddress({ ...address, id: addressId });
    }
    const clientUpdate = await pool.query(
      `UPDATE client
      SET ${nas ? 'nas = $1' : ''} ${firstName ? 'first_name = $2' : ''} ${lastName ? 'last_name = $3' : ''} ${password ? 'password = $4' : ''}
      WHERE email = $5
      RETURNING *`,
      [nas, firstName, lastName, password, email]
    );

    res.json(clientUpdate);
  } catch (err: any) {
    console.error(err);
  }
});

//Update employee
app.put('/employee/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { nas, firstName, lastName, address, roles, password } = req.body;
    if (address) {
      const addressId: QueryResult<{id: number}> = await pool.query(
        `SELECT address 
        FROM employee 
        WHERE email = $1`,
        [email]
      );
      await updateAddress({ ...address, id: addressId });
    }
    const employeeUpdate = await pool.query(
      `UPDATE employee
      SET ${nas ? 'nas = $1' : ''} ${firstName ? 'first_name = $2' : ''} ${lastName ? 'last_name = $3' : ''} ${roles ? 'roles = $4' : ''} ${password ? 'password = $5' : ''}
      WHERE email = $6
      RETURNING *`,
      [nas, firstName, lastName, roles, password, email]
    );

    res.json(employeeUpdate);
  } catch (err: any) {
    console.error(err);
  }
});

//Delete client
app.delete('/client/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const clientDelete = await pool.query(
      `DELETE FROM client 
      WHERE email = $1
      RETURNING address`,
      [email]
    );
    await deleteAddress(clientDelete.rows[0].address);

    res.json(clientDelete);
  } catch (err: any) {
    console.error(err);
  }
});

//Delete employee
app.delete('/employee/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const employeeDelete = await pool.query(
      `DELETE FROM employee 
      WHERE email = $1
      RETURNING address`,
      [email]
    );
    await deleteAddress(employeeDelete.rows[0].address);

    res.json(employeeDelete);
  } catch (err: any) {
    console.error(err);
  }
});

//Create reservation
app.post('/reservation', async (req, res) => {
  try {
    const { email, roomId, startDate, endDate } = req.body;

    const reservationPost = await pool.query(
      `INSERT INTO reservation (room_id, client_email, start_date, end_date) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [roomId, email, startDate.toISOString(), endDate.toISOString()]
    );

    res.json(reservationPost);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Create location
app.post('/location', async (req, res) => {
  try {
    const { email, roomId, endDate } = req.body;

    const locationPost = await pool.query(
      `INSERT INTO location (room_id, client_email, start_date, end_date) 
      VALUES ($1, $2, NOW(), $3) 
      RETURNING *`,
      [roomId, email, endDate.toISOString()]
    );

    res.json(locationPost);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Delete reservation
app.delete('/reservation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    //If the reservation hasn't already started
    if (new Date((await pool.query(
      `SELECT start_date
      FROM reservation
      WHERE id = $1`,
      [id]
    )).rows[0].start_date) > new Date()) {
      return;
    }
    
    const reservationDelete = await pool.query(
      `DELETE FROM reservation 
      WHERE id = $1`,
      [id]
    );

    res.json(reservationDelete);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Add room
app.post('/room', async (req, res) => {
  try {
    const { price, commodities, capacity, seaVue, mountainVue, extendable, issues, area } = req.body;

    const roomPost = await pool.query(
      `INSERT INTO reservation (price, commodities, capacity, sea_vue, mountain_vue, extendable, issues, area) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [price, commodities, capacity, seaVue, mountainVue, extendable, issues, area]
    );

    res.json(roomPost);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Update room
app.put('/room/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, commodities, capacity, seaVue, mountainVue, extendable, issues, area } = req.body;

    const roomUpdate = await pool.query(
      `UPDATE employee
      SET ${price ? 'price = $1' : ''} 
        ${commodities ? 'commodities = $2' : ''} 
        ${capacity ? 'capacity = $3' : ''} 
        ${seaVue ? 'sea_vue = $4' : ''} 
        ${mountainVue ? 'mountain_vue = $5' : ''} 
        ${extendable ? 'extendable = $6' : ''} 
        ${issues ? 'issues = $7' : ''} 
        ${area ? 'area = $8' : ''} 
      WHERE id = $9
      RETURNING *`,
      [price, commodities, capacity, seaVue, mountainVue, extendable, issues, area, id]
    );

    res.json(roomUpdate);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Remove room
app.delete('/room/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const roomDelete = await pool.query(
      `DELETE FROM room 
      WHERE id = $1`,
      [id]
    );

    res.json(roomDelete);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Add hotel
app.post('/hotel/:chain_name', async (req, res) => {
  try {
    const { chain_name } = req.params;
    const { rating, address, email, phone } = req.body;

    //Transaction so the address is not inserted if inserting the client fails
    await pool.query('BEGIN');
    const addressPost = await addAddress({ ...address });
    const hotelPost = await pool.query(
      `INSERT INTO hotel (hotel_chain_name, rating, address, email, phone) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [chain_name, rating, addressPost.rows[0].id, email, phone]
    );
    await pool.query('COMMIT');

    res.json(hotelPost);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
  }
});

//Update hotel
app.put('/hotel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, address, email, phone } = req.body;

    if (address) {
      const addressId: QueryResult<{id: number}> = await pool.query(
        `SELECT address 
        FROM hotel 
        WHERE id = $1`,
        [id]
      );
      await updateAddress({ ...address, id: addressId });
    }
    const hotelUpdate = await pool.query(
      `UPDATE hotel
      SET ${rating ? 'rating = $1' : ''} ${email ? 'email = $2' : ''} ${phone ? 'phone = $3' : ''} 
      WHERE id = $4
      RETURNING *`,
      [rating, email, phone, id]
    );

    res.json(hotelUpdate);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Remove hotel
app.delete('/hotel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const hotelDelete = await pool.query(
      `DELETE FROM hotel 
      WHERE id = $1
      RETURNING address`,
      [id]
    );
    await deleteAddress(hotelDelete.rows[0].address);

    res.json(hotelDelete);
  } catch (err: any) {
    console.error(err.message);
  }
});

app.listen(5000, () => console.log('Listening on port 5000'));

async function addAddress(address : 
  {
    streetName: string, 
    streetNumber: string, 
    aptNumber: number, 
    city: string, 
    province: string, 
    zip: string
  }
): Promise<QueryResult<{id: number}>> {
  return await pool.query(
    `INSERT INTO address (street_name, street_number, apt_number, city, province, zip) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING (id)`,
    Object.values(address)
  );
}

async function updateAddress(address : 
  {
    streetName: string, 
    streetNumber: string, 
    aptNumber: number, 
    city: string, 
    province: string, 
    zip: string,
    id: number
  }
): Promise<QueryResult<any>> {
  return await pool.query(
    `UPDATE address
    SET street_name = $1, street_number = $2, apt_number = $3, city = $4, province = $5, zip = $6
    WHERE id = $7`,
    Object.values(address)
  );
}

async function deleteAddress(id: number): Promise<QueryResult<any>> {
  return await pool.query(
    `DELETE FROM address
    WHERE id = $1`,
    [id]
  );
}
