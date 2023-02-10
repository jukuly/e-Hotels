import { useEffect, useRef, useState } from 'react';
import { isFilled, isEmailValid, isPhoneValid } from '../../helperFunctions/inputCheck';
import { saveProfileHotelChain } from '../../database/profileChange';
import styles from './admin.module.css'
import { getProfileHotelChain } from '../../database/getter';

export default function () {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profile = await getProfileHotelChain();
        nameRef.current?.setAttribute('value', profile.name);
        emailRef.current?.setAttribute('value', profile.email);
        phoneRef.current?.setAttribute('value', profile.phone.toString());
      } catch (err) {
        console.error(err);
      }
    }

    getProfile();
  }, []);

  async function saveProfile() {

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
      if (err.code === 'user-already-exists') {
        setError('This name and/or email and/or phone number is already taken');
      } else {
        console.error(err);
      }
    }
  }
  
  return (
    <>
      <main className={styles.adminHome}>
        <div className={styles.box}>
          <h1 className={styles.boxTitle}>Hotel Chain Info</h1>
          <form className={styles.profile} onSubmit={e => {
            e.preventDefault();
            saveProfile();
          }}>
            <div className={styles.inputGroup}>
              <span>Chain Name: </span>
              <input className={`${styles.input}`} type='text' placeholder='Name' size={1} ref={nameRef} onChange={() => isFilled(nameRef)} maxLength={20} />
            </div>
            <div className={styles.inputGroup}>
              <span>Email: </span>
              <input className={`${styles.input}`} type='text' placeholder='Email' size={1} ref={emailRef} onChange={() => isEmailValid(emailRef)} maxLength={40} />
            </div>
            <div className={styles.inputGroup}>
              <span>Phone Number: </span>
              <input className={`${styles.input}`} type='text' placeholder='Phone' size={1} ref={phoneRef} onChange={() => isPhoneValid(phoneRef)} maxLength={10} />
            </div>
            <div className={styles.belowFields}>
              <span>{ error }</span>
              <button className={styles.saveButton} type='submit'>Save</button>
            </div>
          </form>
        </div>
        <div className={styles.box}>
          
        </div>
      </main>
    </>
  );
}