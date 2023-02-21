import { useEffect, useRef, useState } from 'react';
import { Hotel } from '../../../types/interfaces';
import styles from './hotelList.module.css'
import { isEmailValid, isFilled, isNumber, isPhoneValid } from '../../../helperFunctions/inputCheck';
import { getHotelsFromHotelChain } from '../../../database/getter';
import { createNewHotel } from '../../../database/setter';

export default function() {
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const streetNumberRef = useRef<HTMLInputElement>(null);
  const streetNameRef = useRef<HTMLInputElement>(null);
  const aptNumberRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<HTMLInputElement>(null);
  const zipCodeRef = useRef<HTMLInputElement>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [addPressed, setAddPressed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getHotels = async () => {
      try {
        const hotels = await getHotelsFromHotelChain();
        setHotels(hotels);
      } catch (err) {
        console.error(err);
      }
    }

    getHotels();
  }, [])

  async function addHotel() {

    //Every field should be filled (apt can be empty)
    if (!isFilled(emailRef) || !isFilled(phoneRef) || !isFilled(streetNumberRef) || 
      !isFilled(streetNameRef) || !isFilled(cityRef) || 
      !isFilled(provinceRef) || !isFilled(zipCodeRef)) {
      setError('Please fill every field');
      return;
    }

    if (!isEmailValid(emailRef)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPhoneValid(phoneRef)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!isNumber(streetNumberRef)) {
      setError('Please make sure the street number is in a numeric format');
      return;
    }

    if (!isNumber(aptNumberRef) && isFilled(aptNumberRef)) {
      setError('Please make sure the apt number is in a numeric format');
      return;
    }

    const params = {
      email: emailRef.current?.value.trim()!,
      phone: parseInt(phoneRef.current?.value.trim()!),
      address: {
        streetName: streetNameRef.current?.value.trim()!, 
        streetNumber: parseInt(streetNumberRef.current?.value.trim()!), 
        aptNumber: parseInt(aptNumberRef.current?.value.trim()!), 
        city: cityRef.current?.value.trim()!, 
        province: provinceRef.current?.value.trim()!, 
        zip: zipCodeRef.current?.value.replace(/\s/g, '')!
      }
    }

    try {
      await createNewHotel(params);
      setError('');
      setAddPressed(false);
      try {
        const hotels = await getHotelsFromHotelChain();
        setHotels(hotels);
      } catch (err) {
        console.error(err);
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  return (
    <div className={styles.wrapper}>
    <div className={styles.hotels}>
      {
        hotels.map(hotel => 
          <button className={`${styles.box} ${styles.hotelBox}`} key={hotel.id}>
            <div>Email: {hotel.email}</div>
            <div>Phone: {hotel.phone}</div>
            <div>Rating: {hotel.rating}</div>
            <div>Street Number: {hotel.address?.street_number}</div>
            <div>Street Name: {hotel.address?.street_name}</div>
            <div>Apt Number: {hotel.address?.apt_number}</div>
            <div>City: {hotel.address?.city}</div>
            <div>Province: {hotel.address?.province}</div>
            <div>Zip: {hotel.address?.zip}</div>
          </button>
        )
      }
      {
        addPressed ?
          <div className={`${styles.box} ${styles.hotelBox}`}>
            <form className={styles.addHotelForm} onSubmit={e => {
              e.preventDefault();
              addHotel();
            }}>
              <input type='text' placeholder='Email *' size={1} ref={emailRef} onChange={() => isEmailValid(emailRef)} maxLength={40} />
              <input type='text' placeholder='Phone Number *' size={1} ref={phoneRef} onChange={() => isPhoneValid(phoneRef)} maxLength={10} />

              <input className={styles.one} type='text' placeholder='Number *' size={1} ref={streetNumberRef} onChange={() => isNumber(streetNumberRef)} />
              <input className={styles.two} type='text' placeholder='Street *' size={1} ref={streetNameRef} onChange={() => isFilled(streetNameRef)} maxLength={40} />
              <input className={styles.one} type='text' placeholder='Apt' size={1} ref={aptNumberRef} onChange={() => isNumber(aptNumberRef)} />
              <input className={styles.two} type='text' placeholder='City *' size={1} ref={cityRef} onChange={() => isFilled(cityRef)} maxLength={20} />
              <input className={styles.two} type='text' placeholder='Province *' size={1} ref={provinceRef} onChange={() => isFilled(provinceRef)} maxLength={20} />
              <input type='text' placeholder='Zip Code *' size={1} ref={zipCodeRef} onChange={() => isFilled(zipCodeRef)} maxLength={7} />

              <div className={styles.belowFields}>
                <span>{ error }</span>
                <button className={styles.addHotelButton} type='submit'>Add</button>
              </div>
            </form>
            <div className={styles.underlineWrapper}><span className={styles.underline} onClick={() => setAddPressed(false)}>Cancel</span></div>
          </div>
        :
          <button className={`${styles.box} ${styles.hotelBox} ${styles.addHotel}`} onClick={() => setAddPressed(true)}>
            +
          </button>
      }  
    </div> 
    </div>
  );
}