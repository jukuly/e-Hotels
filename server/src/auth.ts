import pool from './database';
import { createClient } from './editTable';
import { Client } from './types/interfaces';
import bcrypt from 'bcrypt';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

export async function signIn({ email, password }: { email: string, password: string }) {

  const userData = await pool.query<{ password: string, id: string }>(
    `SELECT password, id FROM client 
    WHERE email = $1
    UNION
    SELECT password, id FROM employee 
    WHERE email = $1
    UNION
    SELECT password, id FROM hotel_chain 
    WHERE email = $1`,
    [email]
  );

  if (userData.rowCount === 0) throw { code: 'invalid-credentials', message: 'Email or Password incorrect' };
  if (await bcrypt.compare(password, userData.rows[0].password)) return createJWT(userData.rows[0].id, '2h');
  
  throw { code: 'invalid-credentials', message: 'Email or Password incorrect' };
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

export function verifyJWT(jwToken: string | undefined): string {
  if (!jwToken) throw { code: 'jwt-undefined', message: 'This JsonWebToken is undefined' };
  try {
    const decoded = jwt.verify(jwToken, process.env.JWT_KEY!);
    return (decoded as JwtPayload)['id'];
  } catch (err: any) {
    if (err instanceof JsonWebTokenError) {
      throw { code: 'invalid-jwt', message: 'This JsonWebToken is invalid or has expired', error: err };
    } else {
      throw err;
    }
  }
}

export async function getUserType(uid: string): Promise<'client' | 'employee' | 'hotel-chain' | undefined> {
  let type: 'client' | 'employee' | 'hotel-chain' | undefined;
  if ((await pool.query<{ count: number }>(
    `SELECT COUNT(*) FROM client 
    WHERE id = $1`,
    [uid]
  )).rows[0].count > 0) type = 'client';
  if ((await pool.query<{ count: number }>(
    `SELECT COUNT(*) FROM employee 
    WHERE id = $1`,
    [uid]
  )).rows[0].count > 0) type = 'employee';
  if ((await pool.query<{ count: number }>(
    `SELECT COUNT(*) FROM hotel-chain 
    WHERE id = $1`,
    [uid]
  )).rows[0].count > 0) type = 'hotel-chain';

  return type;
}

export async function isAuthorized(request: Request, userType: 'client' | 'employee' | 'hotel-chain'): Promise<string | boolean> {
  try { 
    const uid = verifyJWT(request.header('Authorization')?.split(' ')[1]); 
    const type = await getUserType(uid);
    return (type === userType) && uid;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = 10;
  return await bcrypt.hash(password, salt);
}

async function createJWT(id: string, exp: string): Promise<string> {
  return jwt.sign({ id }, process.env.JWT_KEY!, { expiresIn: exp });
}

