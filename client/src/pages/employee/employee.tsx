import { RefObject, useEffect, useState } from 'react';
import Profile from '../../components/profile/profile';
import { signOut } from '../../database/auth';
import { getHotelById, getProfileEmployee } from '../../database/getter';
import { deleteCurrentUser, saveProfileEmployee } from '../../database/profileChange';
import { removeHotel, modifyHotel } from '../../helperFunctions/hotelFunctions';
import { isEmailValid, isFilled, isNASValid, isNumber, isPhoneValid } from '../../helperFunctions/inputCheck';
import listToStringProfile from '../../helperFunctions/listToStringProfile';
import { Hotel } from '../../types/interfaces';
import styles from './employee.module.css'
import EmployeeList from './employeeList/employeeList';
import ReservationList from './reservationList/reservationList';
import RoomList from './roomList/roomList';

export default function () {
  const [initialValue, setInitialValue] = useState<string[]>([]);
  const [hotelId, setHotelId] = useState<string | undefined>(undefined);
  const [hotel, setHotel] = useState<Hotel | undefined>(undefined);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

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

        if (profile.roles?.includes('manager')!) {
          const hotel = await getHotelById(profile.hotel_id!);
          setHotel(hotel);
        }
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
        street_name: streetNameRef.current?.value.trim()!, 
        street_number: parseInt(streetNumberRef.current?.value.trim()!), 
        apt_number: parseInt(aptNumberRef.current?.value.trim()!), 
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

  function switchProfile() {
    setPage(page => (page+1)%3);
  }
  
  return (
    <>
      <button className='signOutButton' onClick={() => signOut()}>Sign Out</button>
      <main className={styles.employeeHome}>
        <div className={`${styles.box} ${isManager ? styles.profile : ''}`}>
          {
            isManager &&
            <button className={styles.arrow} onClick={() => switchProfile()}>&#60;</button>
          }
          <div className={page === 0 ? '' : styles.hidden}>
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
          
          {
            isManager &&
            <>
              <div className={page === 1  ? '' : styles.hidden}>
                <Profile title='Hotel Info' editable={true} 
                  onSave={(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) => modifyHotel(refs, setError, hotelId!)} 
                  onDelete={() => removeHotel(hotelId!)}  inputs={[
                  {
                    name: 'Email',
                    type: 'text',
                    onChange: (ref) => isEmailValid(ref),
                    maxLength: 40,
                    initialValue: hotel?.email
                  },
                  {
                    name: 'Phone',
                    type: 'text',
                    onChange: (ref) => isPhoneValid(ref),
                    maxLength: 10,
                    initialValue: hotel?.phone?.toString()
                  },
                  {
                    name: 'Street Number',
                    type: 'text',
                    onChange: (ref) => isNumber(ref),
                    maxLength: 10,
                    initialValue: hotel?.address?.street_number?.toString()
                  },
                  {
                    name: 'Street Name',
                    type: 'text',
                    onChange: (ref) => isFilled(ref),
                    maxLength: 40,
                    initialValue: hotel?.address?.street_name
                  },
                  {
                    name: 'Apt Number',
                    type: 'text',
                    onChange: (ref) => isNumber(ref),
                    maxLength: 10,
                    initialValue: hotel?.address?.apt_number?.toString()
                  },
                  {
                    name: 'City',
                    type: 'text',
                    onChange: (ref) => isFilled(ref),
                    maxLength: 20,
                    initialValue: hotel?.address?.city
                  },
                  {
                    name: 'Province',
                    type: 'text',
                    onChange: (ref) => isFilled(ref),
                    maxLength: 20,
                    initialValue: hotel?.address?.province
                  },
                  {
                    name: 'Zip',
                    type: 'text',
                    onChange: (ref) => isFilled(ref),
                    maxLength: 7,
                    initialValue: hotel?.address?.zip
                  }
                ]} />
              </div>
              <div className={`${styles.employeeList} ${page === 2  ? '' : styles.hidden}`}>
                <h1 className={styles.boxTitle}>Employees</h1>
                <EmployeeList hotelId={hotelId} />
              </div>
              <button className={styles.arrow} onClick={() => switchProfile()}>&#62;</button>
            </>
          }
        </div>
        <div className={styles.box}>
          <h1 className={styles.boxTitle}>Reservations</h1>
          <ReservationList hotelId={hotelId} />
        </div>
        <div className={styles.box}>
          <h1 className={styles.boxTitle}>Rooms</h1>
          <RoomList hotelId={hotelId} isManager={isManager} />
        </div>
      </main>
    </>
  );
}