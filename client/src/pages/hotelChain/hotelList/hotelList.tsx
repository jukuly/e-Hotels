import { RefObject, useEffect, useRef, useState } from 'react';
import { Hotel } from '../../../types/interfaces';
import styles from './hotelList.module.css'
import { isEmailValid, isFilled, isNumber, isPhoneValid } from '../../../helperFunctions/inputCheck';
import { getHotelsFromHotelChain } from '../../../database/getter';
import { createNewHotel } from '../../../database/setter';
import PopUp from '../../../components/popUp/popUp';
import Profile from '../../../components/profile/profile';
import { modifyHotel, removeHotel } from '../../../helperFunctions/hotelFunctions';

export default function() {
  const addEmailRef = useRef<HTMLInputElement>(null);
  const addPhoneRef = useRef<HTMLInputElement>(null);
  const addStreetNumberRef = useRef<HTMLInputElement>(null);
  const addStreetNameRef = useRef<HTMLInputElement>(null);
  const addAptNumberRef = useRef<HTMLInputElement>(null);
  const addCityRef = useRef<HTMLInputElement>(null);
  const addProvinceRef = useRef<HTMLInputElement>(null);
  const addZipCodeRef = useRef<HTMLInputElement>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [addPressed, setAddPressed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [popUpOpen, setOpenPopUpOpen] = useState<boolean>(false);
  const [popUp, setPopUp] = useState<Hotel | undefined>(undefined);

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
    if (!isFilled(addEmailRef) || !isFilled(addPhoneRef) || !isFilled(addStreetNumberRef) || 
      !isFilled(addStreetNameRef) || !isFilled(addCityRef) || 
      !isFilled(addProvinceRef) || !isFilled(addZipCodeRef)) {
      setError('Please fill every field');
      return;
    }

    if (!isEmailValid(addEmailRef)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPhoneValid(addPhoneRef)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!isNumber(addStreetNumberRef)) {
      setError('Please make sure the street number is in a numeric format');
      return;
    }

    if (!isNumber(addAptNumberRef) && isFilled(addAptNumberRef)) {
      setError('Please make sure the apt number is in a numeric format');
      return;
    }

    const params = {
      email: addEmailRef.current?.value.trim()!,
      phone: parseInt(addPhoneRef.current?.value.trim()!),
      address: {
        streetName: addStreetNameRef.current?.value.trim()!, 
        streetNumber: parseInt(addStreetNumberRef.current?.value.trim()!), 
        aptNumber: parseInt(addAptNumberRef.current?.value.trim()!), 
        city: addCityRef.current?.value.trim()!, 
        province: addProvinceRef.current?.value.trim()!, 
        zip: addZipCodeRef.current?.value.replace(/\s/g, '')!
      }
    }

    try {
      await createNewHotel(params);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
    }
  }

  function openPopUp(hotel: Hotel) {
    setOpenPopUpOpen(popUpOpen => !popUpOpen);
    setPopUp(hotel)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.hotels}>
        <PopUp openTrigger={popUpOpen}>
          <Profile title='Hotel Info' editable={true} 
            onSave={(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) => modifyHotel(refs, setError, popUp?.id!)} 
            onDelete={() => removeHotel(popUp?.id!)} 
            inputs={[
              {
                name: 'Email',
                type: 'text',
                onChange: (ref) => isEmailValid(ref),
                maxLength: 40,
                initialValue: popUp?.email
              },
              {
                name: 'Phone',
                type: 'text',
                onChange: (ref) => isPhoneValid(ref),
                maxLength: 10,
                initialValue: popUp?.phone?.toString()
              },
              {
                name: 'Street Number',
                type: 'text',
                onChange: (ref) => isNumber(ref),
                maxLength: 10,
                initialValue: popUp?.address?.street_number?.toString()
              },
              {
                name: 'Street Name',
                type: 'text',
                onChange: (ref) => isFilled(ref),
                maxLength: 40,
                initialValue: popUp?.address?.street_name
              },
              {
                name: 'Apt Number',
                type: 'text',
                onChange: (ref) => isNumber(ref),
                maxLength: 10,
                initialValue: popUp?.address?.apt_number?.toString()
              },
              {
                name: 'City',
                type: 'text',
                onChange: (ref) => isFilled(ref),
                maxLength: 20,
                initialValue: popUp?.address?.city
              },
              {
                name: 'Province',
                type: 'text',
                onChange: (ref) => isFilled(ref),
                maxLength: 20,
                initialValue: popUp?.address?.province
              },
              {
                name: 'Zip',
                type: 'text',
                onChange: (ref) => isFilled(ref),
                maxLength: 7,
                initialValue: popUp?.address?.zip
              }
            ]}
           />
        </PopUp>
        {
          hotels.map(hotel => 
            <button className={`${styles.box} ${styles.hotelBox}`} key={hotel.id} onClick={() => openPopUp(hotel)}>
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
                <input type='text' placeholder='Email *' size={1} ref={addEmailRef} onChange={() => isEmailValid(addEmailRef)} maxLength={40} />
                <input type='text' placeholder='Phone Number *' size={1} ref={addPhoneRef} onChange={() => isPhoneValid(addPhoneRef)} maxLength={10} inputMode='numeric' />

                <input className={styles.one} type='text' placeholder='Number *' size={1} ref={addStreetNumberRef} onChange={() => isNumber(addStreetNumberRef)} inputMode='numeric' />
                <input className={styles.two} type='text' placeholder='Street *' size={1} ref={addStreetNameRef} onChange={() => isFilled(addStreetNameRef)} maxLength={40} />
                <input className={styles.one} type='text' placeholder='Apt' size={1} ref={addAptNumberRef} onChange={() => isNumber(addAptNumberRef)} inputMode='numeric' />
                <input className={styles.two} type='text' placeholder='City *' size={1} ref={addCityRef} onChange={() => isFilled(addCityRef)} maxLength={20} />
                <input className={styles.two} type='text' placeholder='Province *' size={1} ref={addProvinceRef} onChange={() => isFilled(addProvinceRef)} maxLength={20} />
                <input type='text' placeholder='Zip Code *' size={1} ref={addZipCodeRef} onChange={() => isFilled(addZipCodeRef)} maxLength={7} />

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