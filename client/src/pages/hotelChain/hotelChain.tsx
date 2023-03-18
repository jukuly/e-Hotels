import { RefObject, useEffect, useState } from 'react';
import { isFilled, isEmailValid, isPhoneValid } from '../../helperFunctions/inputCheck';
import { deleteCurrentUser, saveProfileHotelChain } from '../../database/profileChange';
import styles from './hotelChain.module.css';
import { getProfileHotelChain } from '../../database/getter';
import Profile from '../../components/profile/profile';
import HotelList from './hotelList/hotelList';
import { signOut } from '../../database/auth';

export default function () {
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
    
    getProfile();
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

  async function deleteUser() {
    deleteCurrentUser();
    signOut();
  }
  
  return (
    <>
      <main className={styles.hotelChainHome}>
        <div className={styles.box}>
          <Profile title='Hotel Chain Info' onSave={saveProfile} onDelete={deleteUser} inputs={[
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
          <HotelList />  
        </div>
      </main>
    </>
  );
}