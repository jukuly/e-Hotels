export interface Client {
  id?: string,
  email: string, 
  nas: number, 
  firstName: string, 
  lastName: string, 
  registrationDate?: Date,
  address: Address, 
  password: string 
}

export interface Employee {
  id?: string,
  email: string, 
  nas: number, 
  firstName: string, 
  lastName: string, 
  address: Address, 
  hotelId: number, 
  roles: string[], 
  password: string
}

export interface Address {
  id?: string,
  streetName: string, 
  streetNumber: number, 
  aptNumber?: number, 
  city: string, 
  province: string, 
  zip: string
}

export interface Hotel {
  id?: string,
  hotelChainId: string,
  rating: number,
  email: string, 
  phone: number
}

export interface HotelChain {
  id?: string,
  name: string,
  email: string,
  phone: number,
  password: string
}

export interface Room {
  id?: string,
  price: number,
  commodities: string[],
  capacity: number,
  seaVue?: boolean,
  mountainVue?: boolean,
  extendable?: boolean,
  issues: string[],
  hotelId: string,
  area: number
}

export interface Reservation {
  id?: string,
  roomId: string,
  clientId: string,
  startDate: Date,
  endDate: Date,
}

export interface Location {
  id?: string,
  roomId: string,
  clientId: string,
  startDate?: Date,
  endDate: Date,
}