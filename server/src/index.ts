import express from 'express';
import cors from 'cors';
import pool from './database';
import { getUserType, hashPassword, isAuthorized, signIn, signUp, verifyJWT } from './auth';
import { createHotel, createLocation, createReservation, createRoom, deleteHotel, deleteRoom, deleteUser, updateClient, updateEmployee, updateHotel, updateHotelChain, updateRoom } from './editTable';
import { getAddress, getClient, getClientEmail, getEmployee, getHotelById, getHotelChain, getHotelsFromHotelChain, getReservationsFromHotel, getRooms, isAvailable } from './selectTable';
import { Hotel, HotelChain, Client, Employee } from './types/interfaces';

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

app.post('/room', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const room = await createRoom({ ...req.body });

    res.status(200).json(room.rows[0]);   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.post('/reserve-room', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['client']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };

    if (!(await isAvailable(req.body.start_date, req.body.end_date, req.body.room_id))) {
      res.status(400).json({ message: 'This time interval is already occupied.', code: 'invalid-time-interval' });
      return;
    }

    await createReservation({ client_id: uid as string, ...req.body });

    res.status(200).json({ success: true });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.post('/location', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };

    const params = req.body;

    if (req.body.client_email) {
      const clientId = await pool.query(`SELECT id FROM client WHERE email = $1`, [req.body.client_email]);
      if (clientId.rowCount === 0) {
        res.status(400).json({ message: 'This email is not associated with any client.', code: 'invalid-credentials' });
        return;
      }
      params.client_id = (await pool.query(`SELECT id FROM client WHERE email = $1`, [req.body.client_email])).rows[0].id;
    }

    if (!(await isAvailable(req.body.start_date, req.body.end_date, req.body.room_id))) {
      res.status(400).json({ message: 'This time interval is already occupied.', code: 'invalid-time-interval' });
      return;
    }
    
    await createLocation({ employee_id: uid as string, ...params });

    res.status(200).json({ success: true });   
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

app.post('/update-employee', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const employee = await updateEmployee({ id: uid, ...req.body });

    res.status(200).json(employee.rows[0]);
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

app.post('/update-room', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const room = await updateRoom(req.body);

    res.status(200).json(room.rows[0]);
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

app.delete('/room/:roomId', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const room = await deleteRoom(req.params.roomId);
    
    res.status(200).json(room.rows[0]);
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

app.get('/hotel/:hotelId', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const hotel = await getHotelById(req.params.hotelId);

    const hotelResponse = { ...hotel.rows[0], address: (await getAddress(hotel.rows[0].id!)).rows[0] } as Hotel;
    
    res.status(200).json(hotelResponse);   
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

app.get('/employee', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const employee = await getEmployee(uid as string);

    const employeeResponse = await Promise.all(
      employee.rows.map(async (e) => {
        return { ...e, address: (await getAddress(e.id!)).rows[0] }
      })
    ) as Client[];

    res.status(200).json(employeeResponse[0]);   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.get('/room', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['client', 'employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };

    const filters = JSON.parse(req.query.filters as string);

    const rooms = await getRooms(
      { 
        ...filters, 
        specificHotelId: await getUserType(uid as string) === 'employee' ? 
          (await pool.query<Employee>('SELECT hotel_id FROM employee WHERE id = $1', [uid])).rows[0].hotel_id : null
      }
    );

    res.status(200).json({ rooms: rooms.rows });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.get('/hotel-reservations/:hotelId', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const reservations = await getReservationsFromHotel(req.params.hotelId);
    
    res.status(200).json({ reservations: reservations.rows });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

app.get('/client-email/:clientId', async (req, res) => {
  try {
    const uid = await isAuthorized(req, ['employee']);
    if (!uid) throw { code: 'unauthorized', message: 'You do not have the necessary permissions to perform this action' };
    const email = await getClientEmail(req.params.clientId);
    
    res.status(200).json({ email: email.rows[0].email });   
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

/////////////////////////////////////////////////////


app.listen(5000, () => console.log('Listening on port 5000'));

//Add a hotel chain (cannot be done with the ui)
/*(async () => 
  pool.query(
    `INSERT INTO hotel_chain (name, email, phone, password) VALUES ($1, $2, $3, $4)`,
    ['HChain', 'hchain@ehotel.com', '1234567890', await hashPassword('12345')]
  )
)();*/
