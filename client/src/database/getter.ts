import { HotelChain, ErrorWithCode, Hotel, Client, Room, SearchFilters } from '../types/interfaces';

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

export async function getRooms(filters: SearchFilters): Promise<Room[]> {
  try {
    const response = await fetch(`http://localhost:5000/room-search?filters=${JSON.stringify(filters)}`, {
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