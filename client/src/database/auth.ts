import { useEffect, useState } from 'react';
import { Client, ErrorWithCode, User } from '../types/interfaces';

export async function signInEmailPassword(email: string | undefined, password: string | undefined): Promise<{ jwt: string }> {
  if (!email || !password) {
    const error: ErrorWithCode = new Error('Email and/or password missing')
    error.code = 'missing-credentials';
    throw error;
  }
  try {
    const response = await fetch('http://localhost:5000/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: email, 
        password: password  
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
    
    localStorage.setItem('jwt', responseData.jwt)
    return responseData;
  } catch (err) {
    throw err;
  }
}

export async function signUpEmailPassword(newClient: Client): Promise<{ jwt: string }> {
  try {
    const response = await fetch('http://localhost:5000/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: newClient.email, 
        nas: newClient.nas, 
        first_name: newClient.first_name, 
        last_name: newClient.last_name, 
        address: newClient.address, 
        password: newClient.password 
      })
    })

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    }

    localStorage.setItem('jwt', responseData.jwt)
    return responseData;
  } catch (err) {
    throw err;
  }
}

export function signOut(): void {
  localStorage.removeItem('jwt');
  window.location.reload();
}

export function useAuthState(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const verifyJWT = async () => {
      setUser(await getUser());
    };
    verifyJWT();
  }, []);

  return user;
}

export async function getUser(): Promise<User | null> {
  const jwt = localStorage.getItem('jwt');

  if (!jwt) return null;
  
  try {
    const response = await fetch('http://localhost:5000/jwt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        jwToken: jwt 
      })
    })

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    }

    return { uid: responseData.uid, type: responseData.type };
  } catch (err: any) {
    console.error(err)
    return null;
  }
}
