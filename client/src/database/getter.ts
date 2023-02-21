import { HotelChain, ErrorWithCode } from '../types/interfaces';

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