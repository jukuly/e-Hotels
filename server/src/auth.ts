import pool from './database';
import { createClient } from './editTable';
import { Client } from './types/interfaces';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function signIn({ email, password }: { email: string, password: string }) {

  const userData = await pool.query<{ password: string, id: string }>(
    `SELECT password, id FROM client 
    WHERE email = $1
    UNION
    SELECT password, id FROM employee 
    WHERE email = $1
    UNION
    SELECT password, hotel_chain_id FROM admin 
    WHERE hotel_chain_id = (SELECT id FROM hotel_chain WHERE email = $1)`,
    [email]
  );

  if (userData.rowCount === 0) throw { code: 'invalid-credentials', message: 'Email or Passwod incorrect' };
  if (await bcrypt.compare(password, userData.rows[0].password)) return createJWT(userData.rows[0].id, '2h');
  
  throw { code: 'invalid-credentials', message: 'Email or Passwod incorrect' };
}

export async function signUp(params: Client): Promise<any> {

  try {
    const clientCreated = await createClient({
      email: params.email.toLowerCase(),
      nas: params.nas,
      firstName: params.firstName, 
      lastName: params.lastName, 
      address: params.address, 
      password: await hashPassword(params.password)
    });
    return createJWT(clientCreated.rows[0].id!, '2h');
  } catch (err: any) {
    if (err.code === '23505') {
      throw { code: 'user-already-exists', message: 'This NAS and/or email is already taken', error: err };
    }
    throw { code: 'unknown', message: 'Unexpected error', error: err };
  }
}

export function verifyJWT(jwToken: string): Promise<string> {
  try {
    const decoded = jwt.verify(jwToken, process.env.JWT_KEY!);
    return (decoded as jwt.JwtPayload)['id'];
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      throw { code: 'invalid-jwt', message: 'This JsonWebToken is invalid or has expired', error: err };
    } else {
      throw err;
    }
  }
}

async function createJWT(id: string, exp: string) {
  return jwt.sign({ id }, process.env.JWT_KEY!, { expiresIn: exp });
}

async function hashPassword(password: string): Promise<string> {
  const salt = 10;
  return await bcrypt.hash(password, salt);
}