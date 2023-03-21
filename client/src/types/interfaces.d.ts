export interface ErrorWithCode extends Error {
  code?: string;
}

export interface SearchFilters {
  startDate?: string, 
  endDate?: string, 
  capacity?: number, 
  area?: number, 
  chainName?: string, 
  city?: string,
  hotelRating?: number, 
  numberOfRoomInHotel?: number, 
  priceMin?: number, 
  priceMax?: number,
  specificHotelId?: string
}

export interface Client {
  id?: string,
  email?: string, 
  nas?: number, 
  first_name?: string, 
  last_name?: string, 
  registration_date?: string,
  address?: Address, 
  password?: string 
}

export interface Employee {
  id?: string,
  email?: string, 
  nas?: number, 
  first_name?: string, 
  last_name?: string, 
  address?: Address, 
  hotel_id?: string, 
  roles?: string[], 
  password?: string
}

export interface Address {
  id?: string,
  street_name?: string, 
  street_number?: number, 
  apt_number?: number, 
  city?: string, 
  province?: string, 
  zip?: string
}

export interface Hotel {
  id?: string,
  hotel_chain_id?: string,
  rating?: number,
  email?: string, 
  phone?: number,
  address?: Address
}

export interface HotelChain {
  id?: string,
  name?: string,
  email?: string,
  phone?: number,
  password?: string,
  address?: Address
}

export interface Room {
  id?: string,
  price?: number,
  commodities?: string[],
  capacity?: number,
  sea_vue?: boolean,
  mountain_vue?: boolean,
  extendable?: boolean,
  issues?: string[],
  hotel_id?: string,
  area?: number
}

export interface Reservation {
  id?: string,
  room_id?: string,
  client_id?: string,
  start_date?: string,
  end_date?: string,
}

export interface Location {
  id?: string,
  room_id?: string,
  client_id?: string,
  employee_id?: string,
  start_date?: string,
  end_date?: string,
}

export interface User {
  uid: string
  type?: 'client' | 'employee' | 'hotel-chain'
}