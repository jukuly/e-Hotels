import { RefObject, useEffect, useState } from 'react';
import { isFilled, isEmailValid, isPhoneValid, isNumber } from '../../helperFunctions/inputCheck';
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
        setInitialValue([
          profile.name!, 
          profile.email!, 
          profile.phone!.toString(), 
          profile.address?.street_number?.toString()!, 
          profile.address?.street_name!, 
          profile.address?.apt_number?.toString()!,
          profile.address?.city!,
          profile.address?.province!,
          profile.address?.zip!
        ]);
      } catch (err) {
        console.error(err);
      }
    }
    
    getProfile();
  }, []);

  async function saveProfile(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>): Promise<boolean> {

    const [nameRef, emailRef, phoneRef, streetNumberRef, streetNameRef, aptNumberRef, cityRef, provinceRef, zipCodeRef] = refs;

    //Every field should be filled
    if (!isFilled(nameRef) || !isFilled(emailRef) || !isFilled(phoneRef) ||
      !isFilled(streetNumberRef) || !isFilled(streetNameRef) || !isFilled(cityRef) || 
      !isFilled(provinceRef) || !isFilled(zipCodeRef)) {
      setError('Please fill every field');
      return true;
    }

    if (!isEmailValid(emailRef)) {
      setError('Please enter a valid email address');
      return true;
    }

    if (!isPhoneValid(phoneRef)) {
      setError('Please make sure the phone number is in a numeric format');
      return true;
    }

    if (!isNumber(streetNumberRef)) {
      setError('Please make sure the street number is in a numeric format');
      return true;
    }

    if (!isNumber(aptNumberRef) && isFilled(aptNumberRef)) {
      setError('Please make sure the apt number is in a numeric format');
      return true;
    }

    const params = {
      name: nameRef.current?.value.trim()!, 
      email: emailRef.current?.value.trim()!,
      phone: parseInt(phoneRef.current?.value.trim()!),
      address: {
        street_name: streetNameRef.current?.value.trim()!, 
        street_number: parseInt(streetNumberRef.current?.value.trim()!), 
        apt_number: parseInt(aptNumberRef.current?.value.trim()!), 
        city: cityRef.current?.value.trim()!, 
        province: provinceRef.current?.value.trim()!, 
        zip: zipCodeRef.current?.value.replace(/\s/g, '')!
      }
    }

    try {
      await saveProfileHotelChain(params);
      return true;
    } catch (err: any) {
      if (err.code === 'hotel-chain-already-exists') {
        setError('This name and/or email and/or phone number is already taken');
      } else {
        console.error(err);
      }
      return false;
    }
  }

  async function deleteUser() {
    try {
      await deleteCurrentUser();
      await signOut();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  
  return (
    <>
      <button className='signOutButton' onClick={() => signOut()}>Sign Out</button>
      <main className={styles.hotelChainHome}>
        <div className={styles.box}>
          <Profile title='Hotel Chain Info' editable={true} onSave={saveProfile} onDelete={deleteUser} inputs={[
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
            },
            {
              name: 'Street Number',
              type: 'text',
              onChange: (ref) => isNumber(ref),
              maxLength: 10,
              initialValue: initialValue[3]
            },
            {
              name: 'Street Name',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 40,
              initialValue: initialValue[4]
            },
            {
              name: 'Apt Number',
              type: 'text',
              onChange: (ref) => isNumber(ref),
              maxLength: 10,
              initialValue: initialValue[5]
            },
            {
              name: 'City',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[6]
            },
            {
              name: 'Province',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[7]
            },
            {
              name: 'Zip',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 7,
              initialValue: initialValue[8]
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