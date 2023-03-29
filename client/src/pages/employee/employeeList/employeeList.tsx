import { RefObject, useEffect, useRef, useState } from 'react';
import { Employee } from '../../../types/interfaces';
import styles from './employeeList.module.css'
import { isEmailValid, isFilled, isNASValid, isNumber, isPasswordConfirmValid, isPasswordValid } from '../../../helperFunctions/inputCheck';
import PopUp from '../../../components/popUp/popUp';
import Profile from '../../../components/profile/profile';
import listToStringProfile from '../../../helperFunctions/listToStringProfile';
import { saveProfileEmployee } from '../../../database/profileChange';
import { createNewEmployee, deleteEmployee } from '../../../database/setter';
import { getEmployees } from '../../../database/getter';

export default function({ hotelId }: { hotelId: string | undefined }) {
  const addEmailRef = useRef<HTMLInputElement>(null);
  const addNasRef = useRef<HTMLInputElement>(null);
  const addFirstNameRef = useRef<HTMLInputElement>(null);
  const addLastNameRef = useRef<HTMLInputElement>(null);
  const addStreetNumberRef = useRef<HTMLInputElement>(null);
  const addStreetNameRef = useRef<HTMLInputElement>(null);
  const addAptNumberRef = useRef<HTMLInputElement>(null);
  const addCityRef = useRef<HTMLInputElement>(null);
  const addProvinceRef = useRef<HTMLInputElement>(null);
  const addZipRef = useRef<HTMLInputElement>(null);
  const addPasswordRef = useRef<HTMLInputElement>(null);
  const addPasswordConfirmRef = useRef<HTMLInputElement>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [addPressed, setAddPressed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [popUpOpen, setOpenPopUpOpen] = useState<boolean>(false);
  const [popUp, setPopUp] = useState<Employee | undefined>(undefined);

  useEffect(() => {
    if (!hotelId) return;
    const getEmployeesFromHotel = async () => {
      try {
        const employees = await getEmployees(hotelId!);
        setEmployees(employees);
      } catch (err) {
        console.error(err);
      }
    }

    getEmployeesFromHotel();
  }, [hotelId]);

  async function addEmployee() {

    //Every field should be filled (apt can be empty)
    if (!isFilled(addFirstNameRef) || !isFilled(addLastNameRef) || !isFilled(addEmailRef) || !isFilled(addNasRef) || 
      !isFilled(addStreetNumberRef) || !isFilled(addStreetNameRef) || !isFilled(addCityRef) || !isFilled(addProvinceRef) || 
      !isFilled(addZipRef) || !isFilled(addPasswordRef) || !isFilled(addPasswordConfirmRef)) {
      setError('Please fill every field');
      return;
    }

    if (!isEmailValid(addEmailRef)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isNumber(addStreetNumberRef)) {
      setError('Please make sure the street number is in a numeric format');
      return;
    }

    if (!isNASValid(addNasRef)) {
      setError('Please make sure the NAS is a number of length 9');
    }

    if (!isNumber(addAptNumberRef) && isFilled(addAptNumberRef)) {
      setError('Please make sure the apt number is in a numeric format');
      return;
    }

    if (!isPasswordValid(addPasswordRef)) {
      setError('Please choose a more secure password');
      return;
    }

    if (!isPasswordConfirmValid(addPasswordRef, addPasswordConfirmRef)) {
      setError('Please make sure both passwords match');
      return;
    }

    const params = {
      email: addEmailRef.current?.value.trim()!,
      nas: parseInt(addNasRef.current?.value.trim()!), 
      first_name: addFirstNameRef.current?.value.trim()!, 
      last_name: addLastNameRef.current?.value.trim()!, 
      address: {
        street_name: addStreetNameRef.current?.value.trim()!, 
        street_number: parseInt(addStreetNumberRef.current?.value.trim()!), 
        apt_number: parseInt(addAptNumberRef.current?.value.trim()!), 
        city: addCityRef.current?.value.trim()!, 
        province: addProvinceRef.current?.value.trim()!, 
        zip: addZipRef.current?.value.replace(/\s/g, '')!
      }, 
      password: addPasswordRef.current?.value!,
      hotel_id: hotelId 
    }

    try {
      await createNewEmployee(params);
      setError('');
      setAddPressed(false);
      try {
        const employees = await getEmployees(hotelId!);
        setEmployees(employees);
      } catch (err) {
        console.error(err);
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  async function modifyEmployee(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>): Promise<boolean> {

    const [rolesRef] = refs;

    const params = { 
      id: popUp?.id,
      email: popUp?.email,
      nas: popUp?.nas,
      first_name: popUp?.first_name,
      last_name: popUp?.last_name,
      roles: rolesRef.current?.value.split(', ')
    }

    try {
      await saveProfileEmployee(params);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async function removeEmployee(employeeId: string): Promise<boolean> {
    try {
    await deleteEmployee(employeeId)
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function openPopUp(employee: Employee) {
    setOpenPopUpOpen(popUpOpen => !popUpOpen);
    setPopUp(employee)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.employees}>
        <PopUp openTrigger={popUpOpen}>
          <div className={styles.popUp}>
            <Profile title='Manage Roles' editable={true} onSave={modifyEmployee} onDelete={() => removeEmployee(popUp?.id!)} inputs={[
              {
                name: 'Roles',
                type: 'text',
                onChange: () => {},
                maxLength: 256,
                initialValue: popUp ? listToStringProfile(popUp?.roles!) : ''
              }
            ]} />
          </div>
        </PopUp>
        {
          employees.map(employee => 
            <button className={`${styles.box} ${styles.employeeBox}`} key={employee.id} onClick={() => openPopUp(employee)}>
              <div>Email: {employee.email}</div>
              <div>NAS: {employee.nas}</div>
              <div>First Name: {employee.first_name}</div>
              <div>Last Name: {employee.last_name}</div>
              <div>Roles: {listToStringProfile(employee.roles!)}</div>
            </button>
          )
        }
        {
          addPressed ?
            <div className={`${styles.box} ${styles.employeeBox}`}>
              <form className={styles.addEmployeeForm} onSubmit={e => {
                e.preventDefault();
                addEmployee();
              }}>
                <input className={styles.two} type='text' placeholder='First Name *' size={1} ref={addFirstNameRef} onChange={() => isFilled(addFirstNameRef)} maxLength={20} />
                <input className={styles.two} type='text' placeholder='Last Name *' size={1} ref={addLastNameRef} onChange={() => isFilled(addLastNameRef)} maxLength={20} />
                <input type='text' placeholder='Email *' size={1} ref={addEmailRef} onChange={() => isEmailValid(addEmailRef)} maxLength={40} />
                <input type='text' placeholder='NAS *' size={1} ref={addNasRef} onChange={() => isNumber(addNasRef)} maxLength={9} inputMode='numeric' />

                <input className={styles.one} type='text' placeholder='Number *' size={1} ref={addStreetNumberRef} onChange={() => isNumber(addStreetNumberRef)} inputMode='numeric' />
                <input className={styles.two} type='text' placeholder='Street *' size={1} ref={addStreetNameRef} onChange={() => isFilled(addStreetNameRef)} maxLength={40} />
                <input className={styles.one} type='text' placeholder='Apt' size={1} ref={addAptNumberRef} onChange={() => isNumber(addAptNumberRef)} inputMode='numeric' />
                <input className={styles.two} type='text' placeholder='City *' size={1} ref={addCityRef} onChange={() => isFilled(addCityRef)} maxLength={20} />
                <input className={styles.two} type='text' placeholder='Province *' size={1} ref={addProvinceRef} onChange={() => isFilled(addProvinceRef)} maxLength={20} />
                <input type='text' placeholder='Zip Code *' size={1} ref={addZipRef} onChange={() => isFilled(addZipRef)} maxLength={7} />

                <input type='password' placeholder='Password *' size={1} ref={addPasswordRef} onChange={() => isPasswordValid(addPasswordRef)} maxLength={16} />
                <input type='password' placeholder='Confirm Password *' size={1} ref={addPasswordConfirmRef} onChange={() => isPasswordConfirmValid(addPasswordRef, addPasswordConfirmRef)} maxLength={16} />

                <div className={styles.belowFields}>
                  <span>{ error }</span>
                  <button className={styles.addEmployeeButton} type='submit'>Add</button>
                </div>
              </form>
              <div className={styles.underlineWrapper}><span className={styles.underline} onClick={() => setAddPressed(false)}>Cancel</span></div>
            </div>
          :
            <button className={`${styles.box} ${styles.employeeBox} ${styles.addEmployee}`} onClick={() => setAddPressed(true)}>
              +
            </button>
        }  
      </div> 
    </div>
  );
}