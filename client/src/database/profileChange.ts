import { HotelChain, ErrorWithCode, Client, Employee } from '../types/interfaces';

export async function saveProfileHotelChain(hotelChain: HotelChain): Promise<HotelChain> {
  if (!hotelChain.name || !hotelChain.email || !hotelChain.phone) {
    const error: ErrorWithCode = new Error('Name and/or email and/or phone number missing')
    error.code = 'missing-attributes';
    throw error;
  }
  try {
    const response = await fetch('http://localhost:5000/update-hotel-chain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify(hotelChain)
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
    
    return responseData;
  } catch (err) {
    throw err;
  }
}

export async function saveProfileClient(client: Client): Promise<Client> {
  if (!client.first_name || !client.last_name || !client.email || !client.nas) {
    const error: ErrorWithCode = new Error('First name and/or last name and/or email and/or NAS missing')
    error.code = 'missing-attributes';
    throw error;
  }
  try {
    const response = await fetch('http://localhost:5000/update-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify(client)
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
    
    return responseData;
  } catch (err) {
    throw err;
  }
}

export async function saveProfileEmployee(employee: Employee): Promise<Employee> {
  if (!employee.first_name || !employee.last_name || !employee.email || !employee.nas) {
    const error: ErrorWithCode = new Error('First name and/or last name and/or email and/or NAS missing')
    error.code = 'missing-attributes';
    throw error;
  }
  try {
    const response = await fetch('http://localhost:5000/update-employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify(employee)
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
    
    return responseData;
  } catch (err) {
    throw err;
  }
}

export async function deleteCurrentUser(): Promise<Client | Employee | HotelChain> {
  try {
    const response = await fetch('http://localhost:5000/user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
    
    return responseData;
  } catch (err) {
    throw err;
  }
}