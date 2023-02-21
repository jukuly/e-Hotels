import { ErrorWithCode, Hotel } from "../types/interfaces";

export async function createNewHotel(newHotel: Hotel): Promise<void> {
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