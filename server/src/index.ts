import express from 'express';
import cors from 'cors';
import pool from './database';
import { QueryResult } from 'pg';
import { getUserType, signIn, signUp, verifyJWT } from './auth';

const app = express();

app.use(cors());
app.use(express.json());

//AUTHENTICATION/////////////////////////////////////

app.post('/sign-in', async (req, res) => {
  try {
    const jwToken = await signIn(req.body); 
    res.status(200).json({ jwt: jwToken });   
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(400).json(err);
  }
});

app.post('/sign-up', async (req, res) => {
  try {
    const jwToken = await signUp(req.body); 
    res.status(200).json({ jwt: jwToken });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.post('/jwt', async (req, res) => {
  try {
    const uid = verifyJWT(req.body.jwToken); 
    const type = getUserType(uid);

    res.status(200).json({ uid: uid, type: type });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////





//Create client
app.post('/client', async (req, res) => {
  try {
    const { email, nas, firstName, lastName, address, password } = req.body;

    //Transaction so the address is not inserted if inserting the client fails
    await pool.query('BEGIN');
    const clientPost = await pool.query(
      `INSERT INTO client (email, nas, first_name, last_name, registration_date, password) 
      VALUES ($1, $2, $3, $4, NOW(), $5) 
      RETURNING *`,
      [email, nas, firstName, lastName, password]
    );
    await addAddress(clientPost.rows[0].id, { ...address });
    await pool.query('COMMIT');

    res.status(200).json(clientPost);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
    res.status(400).send(err.message);
  }
});

//Update client
app.put('/client/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nas, firstName, lastName, address, password } = req.body;

    //Transaction so the address is not updated if updating the client fails
    await pool.query('BEGIN');
    if (address) await updateAddress(id, { ...address });
    const clientUpdate = await pool.query(
      `UPDATE client
      SET
        ${nas ? 'nas = $1,' : ''}
        ${firstName ? 'first_name = $2,' : ''}
        ${lastName ? 'last_name = $3,' : ''}
        ${password ? 'password = $4' : ''}
      WHERE id = $5
      RETURNING *`,
      [nas, firstName, lastName, password, id]
    );
    await pool.query('COMMIT');

    res.json(clientUpdate);
  } catch (err: any) {
    console.error(err);
    await pool.query('ROLLBACK');
  }
});

//Update employee
app.put('/employee/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nas, firstName, lastName, address, roles, password } = req.body;

    //Transaction so the address is not updated if updating the employee fails
    await pool.query('BEGIN');
    if (address) await updateAddress(id, { ...address });
    const employeeUpdate = await pool.query(
      `UPDATE employee
      SET
        ${nas ? 'nas = $1,' : ''}
        ${firstName ? 'first_name = $2,' : ''}
        ${lastName ? 'last_name = $3,' : ''}
        ${roles ? 'roles = $4,' : ''}
        ${password ? 'password = $5' : ''}
      WHERE id = $6
      RETURNING *`,
      [nas, firstName, lastName, roles, password, id]
    );
    await pool.query('COMMIT');

    res.json(employeeUpdate);
  } catch (err: any) {
    console.error(err);
    await pool.query('ROLLBACK');
  }
});

//Delete client
app.delete('/client/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    //Transaction so the address is not deleted if deleting the client fails
    await pool.query('BEGIN');
    const clientDelete = await pool.query(
      `DELETE FROM client 
      WHERE id = $1`,
      [id]
    );
    await deleteAddress(id);
    await pool.query('COMMIT');

    res.json(clientDelete);
  } catch (err: any) {
    console.error(err);
    await pool.query('ROLLBACK');
  }
});

//Delete employee
app.delete('/employee/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    //Transaction so the address is not deleted if deleting the employee fails
    await pool.query('BEGIN');
    const employeeDelete = await pool.query(
      `DELETE FROM employee 
      WHERE id = $1`,
      [id]
    );
    await deleteAddress(id);
    await pool.query('COMMIT');

    res.json(employeeDelete);
  } catch (err: any) {
    console.error(err);
    await pool.query('ROLLBACK');
  }
});

//Create reservation
app.post('/reservation', async (req, res) => {
  try {
    const { clientId, roomId, startDate, endDate } = req.body;

    const reservationPost = await pool.query(
      `INSERT INTO reservation (room_id, client_id, start_date, end_date) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [roomId, clientId, startDate.toISOString(), endDate.toISOString()]
    );

    res.json(reservationPost);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Create location
app.post('/location', async (req, res) => {
  try {
    const { clientId, roomId, endDate } = req.body;

    const locationPost = await pool.query(
      `INSERT INTO location (room_id, client_id, end_date) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [roomId, clientId, endDate.toISOString()]
    );

    res.json(locationPost);
  } catch (err: any) {
    console.error(err.message);
  }
});

//Delete reservation
app.delete('/reservation/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    //If the reservation hasn't already started
    if (new Date((await pool.query(
      `SELECT start_date
      FROM reservation
      WHERE id = $1`,
      [id]
    )).rows[0].start_date) > new Date()) {
      res.status(420).json({ error: 'Reservation start date passed' });
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
    const id = parseInt(req.params.id);
    const { price, commodities, capacity, seaVue, mountainVue, extendable, issues, area } = req.body;

    const roomUpdate = await pool.query(
      `UPDATE employee
      SET
        ${price ? 'price = $1,' : ''}
        ${commodities ? 'commodities = $2,' : ''}
        ${capacity ? 'capacity = $3,' : ''}
        ${seaVue ? 'sea_vue = $4,' : ''}
        ${mountainVue ? 'mountain_vue = $5,' : ''}
        ${extendable ? 'extendable = $6,' : ''}
        ${issues ? 'issues = $7,' : ''}
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
    const id = parseInt(req.params.id);
    
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
app.post('/hotel', async (req, res) => {
  try {
    const { hotelChainId, rating, address, email, phone } = req.body;

    //Transaction so the address is not inserted if inserting the hotel fails
    await pool.query('BEGIN');
    const hotelPost = await pool.query(
      `INSERT INTO hotel (hotel_chain_id, rating, email, phone) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [hotelChainId, rating, email, phone]
    );
    await addAddress(hotelPost.rows[0].id, { ...address });
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
    const id = parseInt(req.params.id);
    const { rating, address, email, phone } = req.body;

    //Transaction so the address is not inserted if updating the hotel fails
    await pool.query('BEGIN');
    if (address) {
      await updateAddress(id, { ...address });
    }
    const hotelUpdate = await pool.query(
      `UPDATE hotel
      SET
        ${rating ? 'rating = $1,' : ''}
        ${email ? 'email = $2,' : ''}
        ${phone ? 'phone = $3' : ''} 
      WHERE id = $4
      RETURNING *`,
      [rating, email, phone, id]
    );
    await pool.query('COMMIT');

    res.json(hotelUpdate);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
  }
});

//Remove hotel
app.delete('/hotel/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    //Transaction so the address is not inserted if deleting the hotel fails
    await pool.query('BEGIN');
    const hotelDelete = await pool.query(
      `DELETE FROM hotel 
      WHERE id = $1`,
      [id]
    );
    await deleteAddress(id);
    await pool.query('COMMIT');

    res.json(hotelDelete);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
  }
});

//Get room search results with filters
app.get('/room', async (req, res) => {
  try {
    const { startDate, endDate, capacity, area, chainName, hotelRating, numberOfRoomInHotel, price } = req.body;

    const result = await pool.query(
      `SELECT * FROM room
      ${(startDate && endDate) ? 
        `WHERE id IN (
          SELECT id FROM room
          WHERE 0 = (
            SELECT COUNT(*) FROM reservation
            WHERE room_id = room.id
            WHERE start_date < $1 AND end_date > $1
          )
          WHERE 0 = (
            SELECT COUNT(*) FROM reservation
            WHERE room_id = room.id
            WHERE end_date > $2 AND start_date < $2
          )
          INTERSECT
          SELECT id FROM room
          WHERE 0 = (
            SELECT COUNT(*) FROM location
            WHERE room_id = room.id
            WHERE start_date < $1 AND end_date > $1
          )
          WHERE 0 = (
            SELECT COUNT(*) FROM location
            WHERE room_id = room.id
            WHERE end_date > $2 AND start_date < $2
          )
        )` : ''
      }
      ${capacity ? 'WHERE capacity > $3' : ''}
      ${area ? 'WHERE area > $4' : ''}
      ${chainName ? 'WHERE (SELECT name FROM hotel_chain WHERE id = (SELECT hotel_chain_id FROM hotel WHERE id = room.hotel_id)) = $5' : ''}
      ${hotelRating ? 'WHERE (SELECT rating FROM hotel WHERE id = room.hotel_id) > $6' : ''}
      ${numberOfRoomInHotel ? 'WHERE (SELECT COUNT(*) FROM room WHERE hotel_id = room.hotel_id) > $7' : ''}
      ${price ? 'WHERE price < $8' : ''}`,
      [startDate, endDate, capacity, area, chainName, hotelRating, numberOfRoomInHotel, price]
    );

    res.json(result);
  } catch (err: any) {
    console.error(err.message);
  }
});

app.listen(5000, () => console.log('Listening on port 5000'));

async function addAddress(
  id: number,
  address : 
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
    `INSERT INTO address (id, street_name, street_number, apt_number, city, province, zip) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, ...Object.values(address)]
  );
}

async function updateAddress(
  id: number,
  address : 
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
    SET street_name = $2, street_number = $3, apt_number = $4, city = $5, province = $6, zip = $7
    WHERE id = $1`,
    [id, ...Object.values(address)]
  );
}

async function deleteAddress(id: number): Promise<QueryResult<any>> {
  return await pool.query(
    `DELETE FROM address
    WHERE id = $1`,
    [id]
  );
}

