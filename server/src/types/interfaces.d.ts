export interface Client {
  id?: string,
  email: string, 
  nas: number, 
  firstName: string, 
  lastName: string, 
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

export interface Admin {
  
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
  
}

export interface HoteChain {
  
}

export interface Room {
  
}

export interface Reservation {
  
}

export interface Location {
  
}