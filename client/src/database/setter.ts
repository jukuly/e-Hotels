import { ErrorWithCode, Hotel } from "../types/interfaces";

export async function createNewHotel(newHotel: Hotel): Promise<Hotel> {
  try {
    const response = await fetch('http://localhost:5000/hotel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({ 
        email: newHotel.email, 
        phone: newHotel.phone, 
        address: newHotel.address
      })
    })

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

export async function updateHotel(hotel: Hotel): Promise<Hotel> {
  try {
    const response = await fetch(`http://localhost:5000/update-hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({ 
        id: hotel.id,
        email: hotel.email, 
        phone: hotel.phone, 
        address: hotel.address
      })
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

export async function deleteHotel(hotelId: string): Promise<Hotel> {
  try {
    const response = await fetch(`http://localhost:5000/hotel/${hotelId}`, {
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