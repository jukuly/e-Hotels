import { RefObject, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpEmailPassword } from '../../auth/auth';
import styles from './signUp.module.css'

function isNumber(inputRef: RefObject<HTMLInputElement>): boolean {
  const value = inputRef.current?.value.trim();
  if (isNaN(parseInt(value!)) || !isFinite(parseInt(value!)) || 
    parseInt(value!) !== parseFloat(value!)) {
    inputRef.current?.classList.add(styles.error);
    return false;
  } else {
    inputRef.current?.classList.remove(styles.error);
    return true;
  }
}

function isFilled(inputRef: RefObject<HTMLInputElement>): boolean {
  const value = inputRef.current?.value.trim();
  if (!inputRef.current || !value) {
    inputRef.current?.classList.add(styles.error);
    return false;
  } else {
    inputRef.current?.classList.remove(styles.error);
    return true;
  }
}

function isEmailValid(emailRef: RefObject<HTMLInputElement>): boolean {
  const value = emailRef.current?.value.trim();
  if (!value!.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    emailRef.current?.classList.add(styles.error);
    return false;
  } else {
    emailRef.current?.classList.remove(styles.error);
    return true;
  }
}

function isPasswordValid(passwordRef: RefObject<HTMLInputElement>): boolean {

  //length: 8-16, normal & capital letter, number and symbol: [!, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, ^, _, `, {, |, }, ~] 
  if (!passwordRef.current?.value.match(/^(?=.*[0-9])(?=.*[!"#$%&'()*+\,\-\./:;<=>?@^_`{|}~])[a-zA-Z0-9!"#$%&'()*+\,\-\./:;<=>?@^_`{|}~]{8,16}$/)) {
    passwordRef.current?.classList.add(styles.error);
    return false;
  } else {
    passwordRef.current?.classList.remove(styles.error);
    return true;
  }
}

function isPasswordConfirmValid(passwordRef: RefObject<HTMLInputElement>, passwordConfirmRef: RefObject<HTMLInputElement>): boolean {
  if (passwordConfirmRef.current?.value !== passwordRef.current!.value) {
    passwordConfirmRef.current?.classList.add(styles.error);
    return false;
  } else {
    passwordConfirmRef.current?.classList.remove(styles.error);
    return true;
  }
}

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

  const navigate = useNavigate();

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
      firstName: firstNameRef.current?.value.trim()!, 
      lastName: lastNameRef.current?.value.trim()!, 
      address: {
        streetName: streetNameRef.current?.value.trim()!, 
        streetNumber: parseInt(streetNumberRef.current?.value.trim()!), 
        aptNumber: parseInt(aptNumberRef.current?.value.trim()!), 
        city: cityRef.current?.value.trim()!, 
        province: provinceRef.current?.value.trim()!, 
        zip: zipCodeRef.current?.value.replace(/\s/g, '')!
      }, 
      password: passwordRef.current?.value! 
    }

    try {
      await signUpEmailPassword(params);
      setError('');
      navigate('/client');
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
          <input className={`${styles.two} ${styles.input}`} type='text' placeholder='First Name *' size={1} ref={firstNameRef} onChange={() => isFilled(firstNameRef)} />
          <input className={`${styles.two} ${styles.input}`} type='text' placeholder='Last Name *' size={1} ref={lastNameRef} onChange={() => isFilled(lastNameRef)} />
          <input className={styles.input} type='text' placeholder='Email *' size={1} ref={emailRef} onChange={() => isEmailValid(emailRef)} />
          <input className={styles.input} type='text' placeholder='NAS *' size={1} ref={nasRef} onChange={() => isNumber(nasRef)} />

          <input className={`${styles.one} ${styles.input}`} type='text' placeholder='Number *' size={1} ref={streetNumberRef} onChange={() => isNumber(streetNumberRef)} />
          <input className={`${styles.two} ${styles.input}`} type='text' placeholder='Street *' size={1} ref={streetNameRef} onChange={() => isFilled(streetNameRef)} />
          <input className={`${styles.one} ${styles.input}`} type='text' placeholder='Apt' size={1} ref={aptNumberRef} onChange={() => isNumber(aptNumberRef)} />
          <input className={`${styles.two} ${styles.input}`} type='text' placeholder='City *' size={1} ref={cityRef} onChange={() => isFilled(cityRef)} />
          <input className={`${styles.two} ${styles.input}`} type='text' placeholder='Province *' size={1} ref={provinceRef} onChange={() => isFilled(provinceRef)} />
          <input className={styles.input} type='text' placeholder='Zip Code *' size={1} ref={zipCodeRef} onChange={() => isFilled(zipCodeRef)} />

          <input className={styles.input} type='password' placeholder='Password *' size={1} ref={passwordRef} onChange={() => isPasswordValid(passwordRef)} />
          <input className={styles.input} type='password' placeholder='Confirm Password *' size={1} ref={passwordConfirRef} onChange={() => isPasswordConfirmValid(passwordRef, passwordConfirRef)} />
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