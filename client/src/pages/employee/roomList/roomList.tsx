import { RefObject, useEffect, useRef, useState } from 'react';
import { Room } from '../../../types/interfaces';
import styles from './roomList.module.css'
import { isFilled, isNumber } from '../../../helperFunctions/inputCheck';
import { getRooms } from '../../../database/getter';
import PopUp from '../../../components/popUp/popUp';
import Profile from '../../../components/profile/profile';
import listToStringProfile from '../../../helperFunctions/listToStringProfile';
import { createNewRoom, deleteRoom, updateRoom } from '../../../database/setter';
import { locateRoom } from '../../../database/reservations';

export default function({ hotelId, isManager }: { hotelId: string | undefined, isManager: boolean }) {
  const addPriceRef = useRef<HTMLInputElement>(null);
  const addCommoditiesRef = useRef<HTMLInputElement>(null);
  const addCapacityRef = useRef<HTMLInputElement>(null);
  const addSeaVueRef = useRef<HTMLInputElement>(null);
  const addMountainVueRef = useRef<HTMLInputElement>(null);
  const addExtendableRef = useRef<HTMLInputElement>(null);
  const addIssuesRef = useRef<HTMLInputElement>(null);
  const addAreaRef = useRef<HTMLInputElement>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [addPressed, setAddPressed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const locationEmailRef = useRef<HTMLInputElement>(null);
  const locationStartDateRef = useRef<HTMLInputElement>(null);
  const locationEndDateRef = useRef<HTMLInputElement>(null);

  const [popUpOpen, setOpenPopUpOpen] = useState<boolean>(false);
  const [popUp, setPopUp] = useState<Room | undefined>(undefined);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    if (!hotelId) return;
    const getRoomsFromHotel = async () => {
      try {
        const rooms = await getRooms({
          specificHotelId: hotelId
        });
        setRooms(rooms);
      } catch (err) {
        console.error(err);
      }
    }

    getRoomsFromHotel();
  }, [hotelId]);

  async function addRoom() {

    //Every field should be filled (apt can be empty)
    if (!isFilled(addPriceRef) || !isFilled(addCapacityRef) || !isFilled(addAreaRef)) {
      setError('Please fill every field');
      return;
    }

    if (!isNumber(addPriceRef)) {
      setError('Please make sure the price is in a numeric format');
      return;
    }

    if (!isNumber(addCapacityRef)) {
      setError('Please make sure the capacity is in a numeric format');
      return;
    }

    if (!isNumber(addAreaRef)) {
      setError('Please make sure the area is in a numeric format');
      return;
    }

    const params = {
      price: parseInt(addPriceRef.current?.value.trim()!),
      commodities: addCommoditiesRef.current?.value.split(', '),
      capacity: parseInt(addCapacityRef.current?.value.trim()!),
      sea_vue: addSeaVueRef.current?.checked,
      mountain_vue: addMountainVueRef.current?.checked,
      extendable: addExtendableRef.current?.checked,
      issues: addIssuesRef.current?.value.split(', '),
      hotel_id: hotelId,
      area: parseInt(addAreaRef.current?.value.trim()!)
    }

    try {
      await createNewRoom(params);
      setError('');
      setAddPressed(false);
      try {
        const rooms = await getRooms({
          specificHotelId: hotelId
        });
        setRooms(rooms);
      } catch (err) {
        console.error(err);
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  async function modifyRoom(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>): Promise<boolean> {

    const [priceRef, commoditiesRef, capacityRef, seaVueRef, mountainVueRef, extendableRef, issuesRef, areaRef] = refs;

    //Every field should be filled (apt can be empty)
    if (!isFilled(priceRef) || !isFilled(capacityRef) || !isFilled(areaRef)) {
      setError('Please fill every field');
      return false;
    }

    if (!isNumber(priceRef)) {
      setError('Please make sure the price is in a numeric format');
      return false;
    }

    if (!isNumber(capacityRef)) {
      setError('Please make sure the capacity is in a numeric format');
      return false;
    }

    if (!isNumber(areaRef)) {
      setError('Please make sure the area is in a numeric format');
      return false;
    }

    const params = {
      price: parseFloat(priceRef.current?.value.trim()!),
      commodities: commoditiesRef.current?.value.split(', '),
      capacity: parseInt(capacityRef.current?.value.trim()!),
      sea_vue: seaVueRef.current?.checked,
      mountain_vue: mountainVueRef.current?.checked,
      extendable: extendableRef.current?.checked,
      issues: issuesRef.current?.value.split(', '),
      hotel_id: hotelId,
      area: parseInt(areaRef.current?.value.trim()!)
    }

    try {
      await updateRoom({ id: popUp?.id, ...params });
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  }

  async function removeRoom(roomId: string): Promise<boolean> {
    try {
    await deleteRoom(roomId)
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function openPopUp(room: Room) {
    setOpenPopUpOpen(popUpOpen => !popUpOpen);
    setPopUp(room)
  }

  async function createLocation() {
    const params = {
      client_email: locationEmailRef.current?.value,
      room_id: popUp?.id,
      start_date: locationStartDateRef.current?.value ? new Date(locationStartDateRef.current?.value).toISOString() : undefined,
      end_date: locationEndDateRef.current?.value ? new Date(locationEndDateRef.current?.value).toISOString() : undefined
    }
    try {
      await locateRoom(params);
      alert('Location successfull!');
      window.location.reload();
    } catch(err: any) {
      if (err.code === 'invalid-time-interval') {
        alert('This time interval is already occupied.');
      } else if (err.code === 'invalid-credentials') {
        alert('This email is not associated with any client.');
      } else {
        alert('An error has occured.');
      }
      console.error(err);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.rooms}>
        <PopUp openTrigger={popUpOpen}>
          <div className={styles.popUp}>
            <Profile title='Room Info' editable={isManager} onSave={modifyRoom} onDelete={() => removeRoom(popUp?.id!)} inputs={[
              {
                name: 'Price',
                type: 'text',
                onChange: (ref) => isNumber(ref),
                maxLength: 10,
                initialValue: popUp?.price?.toString()
              },
              {
                name: 'Commodities',
                type: 'text',
                onChange: () => {},
                maxLength: 256,
                initialValue: popUp ? listToStringProfile(popUp?.commodities!) : ''
              },
              {
                name: 'Capacity',
                type: 'text',
                onChange: (ref) => isNumber(ref),
                maxLength: 10,
                initialValue: popUp?.capacity?.toString()
              },
              {
                name: 'Sea Vue',
                type: 'checkbox',
                onChange: () => {},
                maxLength: 0,
                initialValue: popUp?.sea_vue
              },
              {
                name: 'Mountain Vue',
                type: 'checkbox',
                onChange: () => {},
                maxLength: 10,
                initialValue: popUp?.mountain_vue
              },
              {
                name: 'Extendable',
                type: 'checkbox',
                onChange: () => {},
                maxLength: 20,
                initialValue: popUp?.extendable
              },
              {
                name: 'Issues',
                type: 'text',
                onChange: () => {},
                maxLength: 256,
                initialValue: popUp ? listToStringProfile(popUp?.issues!) : ''
              },
              {
                name: 'Area',
                type: 'text',
                onChange: (ref) => isNumber(ref),
                maxLength: 7,
                initialValue: popUp?.area?.toString()
              }
            ]} />
            <form className={styles.locationForm} onSubmit={e => {
              e.preventDefault();
              createLocation();
            }}>
              <div className={styles.separator}></div>
              <h2>Create a location for this room</h2>
              <input type='text' placeholder='Client Email' ref={locationEmailRef} size={1} maxLength={20} />
              <div className={styles.inputGroup}>
                <span>Start Date: </span><input type='date' ref={locationStartDateRef} size={1} />
              </div>
              <div className={styles.inputGroup}>
                <span>End Date: </span><input type='date' ref={locationEndDateRef} size={1} />
              </div>
              <input type='text' placeholder='Name on the card' size={1} maxLength={20} />
              <input type='text' placeholder='Card number' size={1} maxLength={16} inputMode='numeric' />
              <div className={styles.inputGroup}>
                <span>Expiry Date: </span><input type='date' size={1} />
              </div>
              <input type='text' placeholder='CCV' size={1} maxLength={3} inputMode='numeric' />
              <div className={styles.belowFields}>
                <span>{locationError}</span>
                <button type='submit'>Create Location</button>
              </div>
            </form>
          </div>
        </PopUp>
        {
          rooms.map(room => 
            <button className={`${styles.box} ${styles.roomBox}`} key={room.id} onClick={() => openPopUp(room)}>
              <div>Price: {room.price}</div>
              <div>Commodities: {listToStringProfile(room.commodities!)}</div>
              <div>Capacity: {room.capacity}</div>
              <div>Sea Vue: {room.sea_vue ? 'Yes' : 'No'}</div>
              <div>Mountain vue: {room.mountain_vue ? 'Yes' : 'No'}</div>
              <div>Extendable: {room.extendable ? 'Yes' : 'No'}</div>
              <div>Issues: {listToStringProfile(room.issues!)}</div>
              <div>Area: {room.area}</div>
            </button>
          )
        }
        {
          isManager ?
          addPressed ?
            <div className={`${styles.box} ${styles.roomBox}`}>
              <form className={styles.addRoomForm} onSubmit={e => {
                e.preventDefault();
                addRoom();
              }}>
                <input type='text' placeholder='Price *' size={1} ref={addPriceRef} onChange={() => isNumber(addPriceRef)} maxLength={10} inputMode='numeric' />
                <input type='text' placeholder='Commodities' size={1} ref={addCommoditiesRef} maxLength={256} />
                <input type='text' placeholder='Capacity *' size={1} ref={addCapacityRef} onChange={() => isNumber(addPriceRef)} maxLength={10} inputMode='numeric' />
                <span className={styles.two}>Sea Vue: </span><input className={styles.two} type='checkbox' ref={addSeaVueRef} />
                <span className={styles.two}>Mountain Vue: </span><input className={styles.two} type='checkbox' ref={addMountainVueRef}  />
                <span className={styles.two}>Extendable Vue: </span><input className={styles.two} type='checkbox' ref={addExtendableRef}  />
                <input type='text' placeholder='Issues' size={1} ref={addIssuesRef} onChange={() => isFilled(addIssuesRef)} maxLength={20} />
                <input type='text' placeholder='Area *' size={1} ref={addAreaRef} onChange={() => isNumber(addAreaRef)} maxLength={10} inputMode='numeric' />

                <div className={styles.belowFields}>
                  <span>{ error }</span>
                  <button className={styles.addRoomButton} type='submit'>Add</button>
                </div>
              </form>
              <div className={styles.underlineWrapper}><span className={styles.underline} onClick={() => setAddPressed(false)}>Cancel</span></div>
            </div>
          :
            <button className={`${styles.box} ${styles.roomBox} ${styles.addRoom}`} onClick={() => setAddPressed(true)}>
              +
            </button>
          : 
            <></>
        }  
      </div> 
    </div>
  );
}