import { Employee, ErrorWithCode, Hotel, Room } from "../types/interfaces";

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

export async function createNewRoom(newRoom: Room): Promise<Room> {
  try {
    const response = await fetch('http://localhost:5000/room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({ 
        price: newRoom.price,
        commodities: newRoom.commodities,
        capacity: newRoom.capacity,
        sea_vue: newRoom.sea_vue,
        mountain_vue: newRoom.mountain_vue,
        extendable: newRoom.extendable,
        issues: newRoom.issues,
        hotel_id: newRoom.hotel_id,
        area: newRoom.area
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

export async function updateRoom(room: Room): Promise<Room> {
  try {
    const response = await fetch(`http://localhost:5000/update-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({ 
        id: room.id,
        price: room.price,
        commodities: room.commodities,
        capacity: room.capacity,
        sea_vue: room.sea_vue,
        mountain_vue: room.mountain_vue,
        extendable: room.extendable,
        issues: room.issues,
        hotel_id: room.hotel_id,
        area: room.area
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

export async function deleteRoom(roomId: string): Promise<Room> {
  try {
    const response = await fetch(`http://localhost:5000/room/${roomId}`, {
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

export async function createNewEmployee(newEmployee: Employee): Promise<Employee> {
  try {
    const response = await fetch('http://localhost:5000/employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: JSON.stringify({ 
        email: newEmployee.email,
        nas: newEmployee.nas, 
        first_name: newEmployee.first_name, 
        last_name: newEmployee.last_name, 
        address: newEmployee.address, 
        password: newEmployee.password,
        hotel_id: newEmployee.hotel_id 
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

export async function deleteEmployee(employeeId: string): Promise<Employee> {
  try {
    const response = await fetch(`http://localhost:5000/employee/${employeeId}`, {
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
