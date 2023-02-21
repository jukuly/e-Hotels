import { RefObject, useEffect, useState } from 'react';
import { isFilled, isEmailValid, isPhoneValid } from '../../helperFunctions/inputCheck';
import { saveProfileHotelChain } from '../../database/profileChange';
import styles from './hotelChain.module.css';
import { getHotelsFromHotelChain, getProfileHotelChain } from '../../database/getter';
import { Hotel } from '../../types/interfaces';
import Profile from '../../components/profile/profile';

export default function () {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [addPressed, setAddPressed] = useState<boolean>(false);

  const [initialValue, setInitialValue] = useState<string[]>([]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profile = await getProfileHotelChain();
        setInitialValue([profile.name!, profile.email!, profile.phone!.toString()]);
      } catch (err) {
        console.error(err);
      }
    }
    const getHotels = async () => {
      try {
        const hotels = await getHotelsFromHotelChain();
        setHotels(hotels);
      } catch (err) {
        console.error(err);
      }
    }

    getProfile();
    getHotels();
  }, []);

  async function saveProfile(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) {

    const [nameRef, emailRef, phoneRef] = refs;

    //Every field should be filled
    if (!isFilled(nameRef) || !isFilled(emailRef) || !isFilled(phoneRef)) {
    setError('Please fill every field');
    return;
    }

    if (!isEmailValid(emailRef)) {
    setError('Please enter a valid email address');
    return;
    }

    if (!isPhoneValid(phoneRef)) {
    setError('Please make sure the phone number is in a numeric format');
    return;
    }

    const params = {
      name: nameRef.current?.value.trim()!, 
      email: emailRef.current?.value.trim()!,
      phone: parseInt(phoneRef.current?.value.trim()!)
    }

    try {
      await saveProfileHotelChain(params);
      setError('');
    } catch (err: any) {
      if (err.code === 'hotel-chain-already-exists') {
        setError('This name and/or email and/or phone number is already taken');
      } else {
        console.error(err);
      }
    }
  }
  
  return (
    <>
      <main className={styles.hotelChainHome}>
        <div className={styles.box}>
          <Profile title='Hotel Chain Info' onSave={saveProfile} inputs={[
            {
              name: 'Chain Name',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[0]
            },
            {
              name: 'Email',
              type: 'text',
              onChange: (ref) => isEmailValid(ref),
              maxLength: 40,
              initialValue: initialValue[1]
            },
            {
              name: 'Phone Number',
              type: 'text',
              onChange: (ref) => isPhoneValid(ref),
              maxLength: 10,
              initialValue: initialValue[2]
            }
          ]} />
        </div>
        <div className={styles.box}>
          <h1 className={styles.boxTitle}>Hotels</h1>
          <div className={styles.hotels}>
            {
              hotels.map(hotel => 
                <button className={`${styles.box} ${styles.hotelBox}`}>
                  <span>{hotel.id}</span>
                  <span>{hotel.email}</span>
                  <span>{hotel.hotelChainId}</span>
                  <span>{hotel.phone}</span>
                  <span>{hotel.rating}</span>
                  <span>{hotel.address?.streetNumber}</span>
                  <span>{hotel.address?.aptNumber}</span>
                  <span>{hotel.address?.city}</span>
                  <span>{hotel.address?.province}</span>
                  <span>{hotel.address?.streetName}</span>
                  <span>{hotel.address?.zip}</span>
                </button>
              )
            }
            {
              addPressed ?
                <div className={`${styles.box} ${styles.hotelBox}`}>
                  
                </div>
              :
                <button className={`${styles.box} ${styles.hotelBox} ${styles.addHotel}`} onClick={() => setAddPressed(true)}>
                  +
                </button>
            }  
          </div>   
        </div>
      </main>
    </>
  );
}