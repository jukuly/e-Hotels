import express from 'express';
import cors from 'cors';
import pool from './database';
import { getUserType, isAuthorized, signIn, signUp, verifyJWT } from './auth';
import { createHotel, deleteHotel, deleteUser, updateClient, updateHotel, updateHotelChain } from './editTable';
import { getAddress, getClient, getHotelChain, getHotelsFromHotelChain, getRooms } from './selectTable';
import { Hotel, HotelChain, Client } from './types/interfaces';

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
    const type = await getUserType(uid);

    res.status(200).json({ uid: uid, type: type });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////

//CREATE/////////////////////////////////////////////

app.post('/hotel', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['hotel-chain']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotel = await createHotel({ hotel_chain_id: uid, ...req.body });

    res.status(200).json(hotel.rows[0]);   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////

//UPDATE/////////////////////////////////////////////

app.post('/update-hotel-chain', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['hotel-chain']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotelChain = await updateHotelChain({ id: uid, ...req.body });

    res.status(200).json(hotelChain.rows[0]);   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.post('/update-client', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['client']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const client = await updateClient({ id: uid, ...req.body });

    res.status(200).json(client.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post('/update-hotel', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['hotel-chain', 'employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotel = await updateHotel(req.body);

    res.status(200).json(hotel.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////

//DELETE/////////////////////////////////////////////

app.delete('/user', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['client', 'employee', 'hotel-chain']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const user = await deleteUser(uid as string, await getUserType(uid as string));
    
    res.status(200).json(user.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.delete('/hotel/:hotelId', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['hotel-chain', 'employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotel = await deleteHotel(req.params.hotelId);
    
    res.status(200).json(hotel.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////

//GET////////////////////////////////////////////////

app.get('/hotel_chain', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['hotel-chain']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotelChain = await getHotelChain(uid as string);

    const hotelChainResponse = await Promise.all(
      hotelChain.rows.map(async (hotelChain) => {
        return { ...hotelChain, address: (await getAddress(hotelChain.id!)).rows[0] }
      })
    ) as HotelChain[];

    res.status(200).json(hotelChainResponse[0]);   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.get('/hotel', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['hotel-chain']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotels = await getHotelsFromHotelChain(uid as string);

    const hotelsResponse = await Promise.all(
      hotels.rows.map(async (hotel) => {
        return { ...hotel, address: (await getAddress(hotel.id!)).rows[0] }
      })
    ) as Hotel[];
    
    res.status(200).json({ hotels: hotelsResponse });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.get('/client', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['client']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const client = await getClient(uid as string);

    const clientResponse = await Promise.all(
      client.rows.map(async (c) => {
        return { ...c, address: (await getAddress(c.id!)).rows[0] }
      })
    ) as Client[];

    res.status(200).json(clientResponse[0]);   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

//Get room search results with filters
app.get('/room-search', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['client', 'employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };

    const filters = JSON.parse(req.query.filters as string);

    const rooms = await getRooms(
      { 
        ...filters, 
        specificHotelId: await getUserType(uid as string) === 'employee' ? 
          (await pool.query('SELECT hotel_id FROM employee WHERE id = $1', [uid])).rows[0] : uid
      }
    );

    res.status(200).json({ rooms: rooms.rows });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////




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

app.listen(5000, () => console.log('Listening on port 5000'));

/*(async () => 
  pool.query(
    `INSERT INTO hotel_chain (name, email, phone, password) VALUES ($1, $2, $3, $4)`,
    ['HChain', 'hchain@ehotel.com', '1234567890', await hashPassword('12345')]
  )
)();*/
