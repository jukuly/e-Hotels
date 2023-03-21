import { ErrorWithCode, Reservation } from "../types/interfaces";

export async function reserveRoom(reservation: Reservation) {
  try {
    const response = await fetch(`http://localhost:5000/reserve-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({
        room_id: reservation.room_id,
        start_date: reservation.start_date,
        end_date: reservation.end_date
      })
    });

    if (!response.ok) {
      const responseData = await response.json();
      const error: ErrorWithCode = new Error(responseData.message)
      error.code = responseData.code;
      throw error;
    } 
  } catch (err) {
    throw err;
  }
}