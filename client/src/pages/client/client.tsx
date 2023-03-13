import { RefObject, useEffect, useState } from 'react';
import Profile from '../../components/profile/profile';
import { signOut } from '../../database/auth';
import { getProfileClient } from '../../database/getter';
import { saveProfileClient } from '../../database/profileChange';
import { isEmailValid, isFilled, isNASValid } from '../../helperFunctions/inputCheck';
import styles from './client.module.css'
import SearchRoom from './searchRoom/searchRoom';

export default function () {
  const [initialValue, setInitialValue] = useState<string[]>([]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profile = await getProfileClient();
        setInitialValue([profile.first_name!, profile.last_name!, profile.email!, profile.nas!.toString()]);
      } catch (err) {
        console.error(err);
      }
    }
    
    getProfile();
  }, []);

  async function saveProfile(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) {

    const [firstNameRef, lastNameRef, emailRef, nasRef] = refs;

    //Every field should be filled
    if (!isFilled(firstNameRef) || !isFilled(lastNameRef) || !isFilled(emailRef) || !isFilled(nasRef)) {
      setError('Please fill every field');
      return;
    }

    if (!isEmailValid(emailRef)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isNASValid(nasRef)) {
      setError('Please make sure the NAS is a number of length 9');
      return;
    }

    const params = {
      first_name: firstNameRef.current?.value.trim()!, 
      last_name: lastNameRef.current?.value.trim()!,
      email: emailRef.current?.value.trim()!,
      nas: parseInt(nasRef.current?.value.trim()!)
    }

    try {
      await saveProfileClient(params);
      setError('');
    } catch (err: any) {
      if (err.code === 'user-already-exists') {
        setError('This name and/or email and/or NAS is already taken');
      } else {
        console.error(err);
      }
    }
  }
  
  return (
    <>
      <main className={styles.clientHome}>
        <div className={styles.box}>
          <Profile title='Profile' onSave={saveProfile} inputs={[
            {
              name: 'First Name',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[0]
            },
            {
              name: 'Last Name',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[1]
            },
            {
              name: 'Email',
              type: 'text',
              onChange: (ref) => isEmailValid(ref),
              maxLength: 40,
              initialValue: initialValue[2]
            },
            {
              name: 'NAS',
              type: 'text',
              onChange: (ref) => isNASValid(ref),
              maxLength: 9,
              initialValue: initialValue[3]
            }
          ]} />
        </div>
        <div className={styles.box}>
          <h1 className={styles.boxTitle}>Find a room</h1>
          <SearchRoom />
        </div>
      </main>
    </>
  );
}