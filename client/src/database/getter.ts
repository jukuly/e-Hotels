import { HotelChain, ErrorWithCode, Hotel, Client, Room, SearchFilters, Employee, Reservation } from '../types/interfaces';

export async function getProfileHotelChain(): Promise<HotelChain> {
  try {
    const response = await fetch('http://localhost:5000/hotel_chain', {
      method: 'GET',
      headers: {
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

export async function getHotelsFromHotelChain(): Promise<Hotel[]> {
  try {
    const response = await fetch('http://localhost:5000/hotel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
    
    return responseData.hotels;
  } catch (err) {
    throw err;
  }
}

export async function getHotelById(id: string): Promise<Hotel> {
  try {
    const response = await fetch(`http://localhost:5000/hotel/${id}`, {
      method: 'GET',
      headers: {
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

export async function getProfileClient(): Promise<Client> {
  try {
    const response = await fetch('http://localhost:5000/client', {
      method: 'GET',
      headers: {
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

export async function getProfileEmployee(): Promise<Employee> {
  try {
    const response = await fetch('http://localhost:5000/employee', {
      method: 'GET',
      headers: {
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

export async function getRooms(filters: SearchFilters): Promise<Room[]> {
  try {
    const response = await fetch(`http://localhost:5000/room?filters=${JSON.stringify(filters)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    const responseData = (await response.json()).rooms;

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

export async function getClientEmail(clientId: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:5000/client-email/${clientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    const responseData = (await response.json()).email;

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

export async function getReservations(hotelId: string): Promise<Reservation[]> {
  try {
    const response = await fetch(`http://localhost:5000/hotel-reservations/${hotelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    const responseData = (await response.json()).reservations;

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

export async function getEmployees(hotelId: string): Promise<Employee[]> {
  try {
    const response = await fetch(`http://localhost:5000/hotel-employees/${hotelId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    const responseData = (await response.json()).employees;

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