import { useRef, useState } from 'react';
import { signUpEmailPassword } from '../../database/auth';
import { isFilled, isEmailValid, isPasswordValid, isPasswordConfirmValid, isNumber, isNASValid } from '../../helperFunctions/inputCheck';
import styles from './signUp.module.css'

export default function () {
  const [error, setError] = useState<string>('');

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const nasRef = useRef<HTMLInputElement>(null);
  const streetNumberRef = useRef<HTMLInputElement>(null);
  const streetNameRef = useRef<HTMLInputElement>(null);
  const aptNumberRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<HTMLInputElement>(null);
  const zipCodeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirRef = useRef<HTMLInputElement>(null);

  async function signUp() {

    //Every field should be filled (apt can be empty)
    if (!isFilled(firstNameRef) || !isFilled(lastNameRef) || !isFilled(emailRef) || !isFilled(nasRef) || 
      !isFilled(streetNumberRef) || !isFilled(streetNameRef) || !isFilled(cityRef) || !isFilled(provinceRef) || 
      !isFilled(zipCodeRef) || !isFilled(passwordRef) || !isFilled(passwordConfirRef)) {
      setError('Please fill every field');
      return;
    }

    if (!isEmailValid(emailRef)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isNumber(streetNumberRef)) {
      setError('Please make sure the street number is in a numeric format');
      return;
    }

    if (!isNASValid(nasRef)) {
      setError('Please make sure the NAS is a number of length 9');
    }

    if (!isNumber(aptNumberRef) && isFilled(aptNumberRef)) {
      setError('Please make sure the apt number is in a numeric format');
      return;
    }

    if (!isPasswordValid(passwordRef)) {
      setError('Please choose a more secure password');
      return;
    }

    if (!isPasswordConfirmValid(passwordRef, passwordConfirRef)) {
      setError('Please make sure both passwords match');
      return;
    }

    const params = {
      email: emailRef.current?.value.trim()!,
      nas: parseInt(nasRef.current?.value.trim()!), 
      first_name: firstNameRef.current?.value.trim()!, 
      last_name: lastNameRef.current?.value.trim()!, 
      address: {
        street_name: streetNameRef.current?.value.trim()!, 
        street_number: parseInt(streetNumberRef.current?.value.trim()!), 
        apt_number: parseInt(aptNumberRef.current?.value.trim()!), 
        city: cityRef.current?.value.trim()!, 
        province: provinceRef.current?.value.trim()!, 
        zip: zipCodeRef.current?.value.replace(/\s/g, '')!
      }, 
      password: passwordRef.current?.value! 
    }

    try {
      await signUpEmailPassword(params);
      setError('');
      window.location.reload();
    } catch (err: any) {
      if (err.code === 'user-already-exists') {
        setError('This email and/or NAS is already taken');
      } else {
        console.error(err);
      }
    }
  }

  return (
    <>
      <main className={styles.box}>
        <h1 className={styles.boxTitle}>Sign Up</h1>
        <form className={styles.signUp} onSubmit={e => {
          e.preventDefault();
          signUp();
        }}>
          <input className={styles.two} type='text' placeholder='First Name *' size={1} ref={firstNameRef} onChange={() => isFilled(firstNameRef)} maxLength={20} />
          <input className={styles.two} type='text' placeholder='Last Name *' size={1} ref={lastNameRef} onChange={() => isFilled(lastNameRef)} maxLength={20} />
          <input type='text' placeholder='Email *' size={1} ref={emailRef} onChange={() => isEmailValid(emailRef)} maxLength={40} />
          <input type='text' placeholder='NAS *' size={1} ref={nasRef} onChange={() => isNumber(nasRef)} maxLength={9} />

          <input className={styles.one} type='text' placeholder='Number *' size={1} ref={streetNumberRef} onChange={() => isNumber(streetNumberRef)} />
          <input className={styles.two} type='text' placeholder='Street *' size={1} ref={streetNameRef} onChange={() => isFilled(streetNameRef)} maxLength={40} />
          <input className={styles.one} type='text' placeholder='Apt' size={1} ref={aptNumberRef} onChange={() => isNumber(aptNumberRef)} />
          <input className={styles.two} type='text' placeholder='City *' size={1} ref={cityRef} onChange={() => isFilled(cityRef)} maxLength={20} />
          <input className={styles.two} type='text' placeholder='Province *' size={1} ref={provinceRef} onChange={() => isFilled(provinceRef)} maxLength={20} />
          <input type='text' placeholder='Zip Code *' size={1} ref={zipCodeRef} onChange={() => isFilled(zipCodeRef)} maxLength={7} />

          <input type='password' placeholder='Password *' size={1} ref={passwordRef} onChange={() => isPasswordValid(passwordRef)} maxLength={16} />
          <input type='password' placeholder='Confirm Password *' size={1} ref={passwordConfirRef} onChange={() => isPasswordConfirmValid(passwordRef, passwordConfirRef)} maxLength={16} />
          <div className={styles.belowFields}>
            <span>{ error }</span>
            <button className={styles.signUpButton} type='submit'>Sign Up</button>
          </div>
        </form>
        <div className={styles.aWrapper}><a href='/'>Already got an account?</a></div>
      </main>
    </>
  );
}