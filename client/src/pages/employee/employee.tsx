import { RefObject, useEffect, useState } from 'react';
import Profile from '../../components/profile/profile';
import { signOut } from '../../database/auth';
import { getProfileEmployee } from '../../database/getter';
import { deleteCurrentUser, saveProfileEmployee } from '../../database/profileChange';
import { isEmailValid, isFilled, isNASValid, isNumber } from '../../helperFunctions/inputCheck';
import listToStringProfile from '../../helperFunctions/listToStringProfile';
import styles from './employee.module.css'
import RoomList from './roomList/roomList';

export default function () {
  const [initialValue, setInitialValue] = useState<string[]>([]);
  const [hotelId, setHotelId] = useState<string | undefined>(undefined);
  const [isManager, setIsManager] = useState<boolean>(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profile = await getProfileEmployee();

        setInitialValue([
          profile.first_name!, 
          profile.last_name!, 
          profile.email!, 
          profile.nas!.toString(),
          listToStringProfile(profile.roles!),
          profile.address?.street_number?.toString()!, 
          profile.address?.street_name!, 
          profile.address?.apt_number?.toString()!,
          profile.address?.city!,
          profile.address?.province!,
          profile.address?.zip!
        ]);

        setHotelId(profile.hotel_id);
        setIsManager(profile.roles?.includes('manager')!)
      } catch (err) {
        console.error(err);
      }
    }
    
    getProfile();
  }, []);

  async function saveProfile(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>): Promise<boolean> {

    const [firstNameRef, lastNameRef, emailRef, nasRef, rolesRef, streetNumberRef, streetNameRef, aptNumberRef, cityRef, provinceRef, zipCodeRef] = refs;

    //Every field should be filled
    if (!isFilled(firstNameRef) || !isFilled(lastNameRef) || !isFilled(emailRef) || 
      !isFilled(nasRef) || !isFilled(streetNumberRef) || !isFilled(streetNameRef) || 
      !isFilled(cityRef) || !isFilled(provinceRef) || !isFilled(zipCodeRef)) {
      setError('Please fill every field');
      return false;
    }

    if (!isEmailValid(emailRef)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isNASValid(nasRef)) {
      setError('Please make sure the NAS is a number of length 9');
      return false;
    }

    if (!isNumber(streetNumberRef)) {
      setError('Please make sure the street number is in a numeric format');
      return false;
    }

    if (!isNumber(aptNumberRef) && isFilled(aptNumberRef)) {
      setError('Please make sure the apt number is in a numeric format');
      return false;
    }

    const params = {
      first_name: firstNameRef.current?.value.trim()!, 
      last_name: lastNameRef.current?.value.trim()!,
      email: emailRef.current?.value.trim()!,
      nas: parseInt(nasRef.current?.value.trim()!),
      roles: rolesRef.current?.value.split(', '),
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
      await saveProfileEmployee(params);
      return true;
    } catch (err: any) {
      if (err.code === 'user-already-exists') {
        setError('This name and/or email and/or NAS is already taken');
      } else {
        console.error(err);
      }
      return false;
    }
  }

  async function deleteUser() {
    try {
      await deleteCurrentUser();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  
  return (
    <>
      <button className='signOutButton' onClick={() => signOut()}>Sign Out</button>
      <main className={styles.employeeHome}>
        <div className={styles.box}>
          <Profile title='Profile' editable={true} onSave={saveProfile} onDelete={deleteUser} inputs={[
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
            },
            {
              name: 'Roles',
              type: 'text',
              onChange: () => {},
              maxLength: 256,
              initialValue: initialValue[4]
            },
            {
              name: 'Street Number',
              type: 'text',
              onChange: (ref) => isNumber(ref),
              maxLength: 10,
              initialValue: initialValue[5]
            },
            {
              name: 'Street Name',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 40,
              initialValue: initialValue[6]
            },
            {
              name: 'Apt Number',
              type: 'text',
              onChange: (ref) => isNumber(ref),
              maxLength: 10,
              initialValue: initialValue[7]
            },
            {
              name: 'City',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[8]
            },
            {
              name: 'Province',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 20,
              initialValue: initialValue[9]
            },
            {
              name: 'Zip',
              type: 'text',
              onChange: (ref) => isFilled(ref),
              maxLength: 7,
              initialValue: initialValue[10]
            }
          ]} />
        </div>
        <div className={styles.box}>
          <h1 className={styles.boxTitle}>Rooms</h1>
          <RoomList hotelId={hotelId} isManager={isManager} />
        </div>
      </main>
    </>
  );
}