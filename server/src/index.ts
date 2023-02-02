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
    const newAddress = await addAddress({ ...address });
    const newClient = await pool.query(
      `INSERT INTO client (email, nas, first_name, last_name, address, registration_date, password) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6) 
      RETURNING *`,
      [email, nas, firstName, lastName, newAddress.rows[0].id, password]
    );
    await pool.query('COMMIT');

    res.json(newClient);
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
    const newAddress = await addAddress({ ...address });
    const newEmployee = await pool.query(
      `INSERT INTO employee (email, nas, first_name, last_name, address, hotel_id, roles, registration_date, password) 
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7) 
      RETURNING *`,
      [email, nas, firstName, lastName, newAddress.rows[0].id, hotelId, roles, password]
    );
    await pool.query('COMMIT');

    res.json(newEmployee);
  } catch (err: any) {
    console.error(err.message);
    await pool.query('ROLLBACK');
  }
});

//Update client
app.post('/client/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { nas, firstName, lastName, address, password } = req.body;
    if (address) {
      if (address) {
        const addressId: QueryResult<{id: number}> = await pool.query(
          `SELECT address 
          FROM client 
          WHERE email = $1`,
          [email]
        );
        await updateAddress({ ...address, id: addressId });
      }
    }
    const newClient = await pool.query(
      `UPDATE client
      SET ${nas ? 'nas = $1' : ''} ${firstName ? 'first_name = $2' : ''} ${lastName ? 'last_name = $3' : ''} ${password ? 'password = $4' : ''}
      WHERE email = $5`,
      [nas, firstName, lastName, password, email]
    );

    res.json(newClient);
  } catch (err: any) {
    console.error(err);
  }
});

//Update employee
app.post('/employee/:email', async (req, res) => {
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
    const newEmployee = await pool.query(
      `UPDATE employee
      SET ${nas ? 'nas = $1' : ''} ${firstName ? 'first_name = $2' : ''} ${lastName ? 'last_name = $3' : ''} ${roles ? 'roles = $4' : ''} ${password ? 'password = $5' : ''}
      WHERE email = $6`,
      [nas, firstName, lastName, roles, password, email]
    );

    res.json(newEmployee);
  } catch (err: any) {
    console.error(err);
  }
});

//Delete client
app.delete('/client/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      `DELETE FROM client 
      WHERE email = $1`,
      [email]
    );

    res.json(result);
  } catch (err: any) {
    console.error(err);
  }
});

//Delete employee
app.delete('/employee/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      `DELETE FROM employee 
      WHERE email = $1`,
      [email]
    );

    res.json(result);
  } catch (err: any) {
    console.error(err);
  }
});

app.listen(5000, () => console.log('Listening on port 5000'));

async function addAddress(
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
    `INSERT INTO address (street_name, street_number, apt_number, city, province, zip) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING (id)`,
    Object.values(address)
  );
}

async function updateAddress(
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
    SET street_name = $1, street_number = $2, apt_number = $3, city = $4, province = $5, zip = $6
    WHERE id = $7`,
    Object.values(address)
  );
}
