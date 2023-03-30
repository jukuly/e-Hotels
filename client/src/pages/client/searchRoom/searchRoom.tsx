import { useRef, useState } from 'react';
import PopUp from '../../../components/popUp/popUp';
import { getRooms } from '../../../database/getter';
import { reserveRoom } from '../../../database/reservations';
import { ErrorWithCode, Room } from '../../../types/interfaces';
import styles from './searchRoom.module.css';

export default function() {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const capacityRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLInputElement>(null);
  const hotelChainRef = useRef<HTMLSelectElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const hotelRatingRef = useRef<HTMLInputElement>(null);
  const roomCountRef = useRef<HTMLInputElement>(null);
  const priceStartRef = useRef<HTMLInputElement>(null);
  const priceEndRef = useRef<HTMLInputElement>(null);

  const startDateReserveRef = useRef<HTMLInputElement>(null);
  const endDateReserveRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<Room[]>([]);
  const [popUpOpen, setOpenPopUpOpen] = useState<boolean>(false);
  const [popUp, setPopUp] = useState<Room | undefined>(undefined);

  async function search() {
    const rooms = await getRooms({
      startDate: startDateRef.current?.value ? new Date(startDateRef.current?.value).toISOString() : undefined,
      endDate: endDateRef.current?.value ? new Date(endDateRef.current?.value).toISOString() : undefined,
      capacity: capacityRef.current?.value ? parseInt(capacityRef.current?.value) : undefined,
      area: areaRef.current?.value ? parseInt(areaRef.current?.value) : undefined,
      chainName: hotelChainRef.current?.value,
      city: cityRef.current?.value,
      hotelRating: hotelRatingRef.current?.value ? parseInt(hotelRatingRef.current?.value) : undefined,
      numberOfRoomInHotel: roomCountRef.current?.value ? parseInt(roomCountRef.current?.value) : undefined,
      priceMin: priceStartRef.current?.value ? parseInt(priceStartRef.current?.value) : undefined,
      priceMax: priceEndRef.current?.value ? parseInt(priceEndRef.current?.value) : undefined
    });
    setResults(rooms);
  }

  function openPopUp(room: Room) {
    setOpenPopUpOpen(popUpOpen => !popUpOpen);
    setPopUp(room)
  }

  async function reserve() {
    try {
      await reserveRoom(
        { 
          room_id: popUp?.id!, 
          start_date: new Date(startDateReserveRef.current?.value!).toISOString(), 
          end_date: new Date(endDateReserveRef.current?.value!).toISOString()
        }
      );
      alert('Room reserved successfully!');
      window.location.reload();
    } catch(err: any) {
      if (err.code === 'invalid-time-interval') {
        alert('This time interval is already occupied.');
      } else {
        alert('An error has occured.');
      }
      console.error(err);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.searchForm} onSubmit={e => {
          e.preventDefault();
          search();
        }}>
        <div className={styles.inputGroup}>
          <span>Start: </span>
          <input className={styles.input} type='date' ref={startDateRef} min={new Date().toISOString().slice(0, 10)} max='2030-12-31' size={1} />
          <span>End: </span>
          <input className={styles.input} type='date' ref={endDateRef} min={new Date().toISOString().slice(0, 10)} max='2030-12-31' size={1} />
        </div>
        <div className={`${styles.inputGroup} ${styles.one}`}>
          <span>Capacity: </span>
          <input className={styles.input} placeholder='Capacity' type='text' inputMode='numeric' ref={capacityRef} size={1} />
        </div>
        <div className={`${styles.inputGroup} ${styles.one}`}>
          <span>Area: </span>
          <input className={styles.input} placeholder='Area' type='text' inputMode='numeric' ref={areaRef} size={1} />
        </div>
        <div className={styles.inputGroup}>
          <span>Hotel chain: </span>
          <select className={styles.input} ref={hotelChainRef}>
            <option>HotelChain1</option>
            <option>HotelChain2</option>
            <option>HotelChain3</option>
            <option>HotelChain4</option>
            <option>HotelChain5</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <span>City: </span>
          <input className={styles.input} placeholder='City' type='text' ref={cityRef} size={1} />
        </div>
        <div className={`${styles.inputGroup} ${styles.one}`}>
          <span>Hotel rating: </span>
          <input className={styles.input} placeholder='Hotel rating' type='text' inputMode='numeric' ref={hotelRatingRef} size={1} />
        </div>
        <div className={`${styles.inputGroup} ${styles.one}`}>
          <span>Hotel room count: </span>
          <input className={styles.input} placeholder='Hotel room count' type='text' inputMode='numeric' ref={roomCountRef} size={1} />
        </div>
        <div className={styles.inputGroup}>
          <span>Price: </span>
          <input className={styles.input} placeholder='Min' type='text' inputMode='numeric' ref={priceStartRef} size={1} />
          <input className={styles.input} placeholder='Max' type='text' inputMode='numeric' ref={priceEndRef} size={1} />
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.button} type='submit'>Search</button>
        </div>
      </form>

      <PopUp openTrigger={popUpOpen}>
        <form className={styles.reservationForm} onSubmit={e => {
          e.preventDefault();
          reserve();
        }}>
          <span>Start Date: </span>
          <input className={styles.input} type='date' ref={startDateReserveRef} min={new Date().toISOString().slice(0, 10)} max='2030-12-31' size={1} />
          <span>End Date: </span>
          <input className={styles.input} type='date' ref={endDateReserveRef} min={new Date().toISOString().slice(0, 10)} max='2030-12-31' size={1} /> 
          <button className={`${styles.button} ${styles.reserve}`} type='submit'>Reserve</button>
        </form>
      </PopUp>
      <div className={styles.results}>
        {
          results.map(room => 
            <button className={`${styles.box} ${styles.roomBox}`} key={room.id} onClick={() => openPopUp(room)}>
              <div>Price: {room.price}</div>
              <div>Capacity: {room.capacity}</div>
              <div>Sea vue: {room.sea_vue ? 'Yes' : 'No'}</div>
              <div>Mountain vue: {room.mountain_vue ? 'Yes' : 'No'}</div>
              <div>Extendable: {room.extendable ? 'Yes' : 'No'}</div>
              <div>Area: {room.area}</div>
              <div>Issues: {room.issues}</div>
              <div>Commodities: {room.commodities}</div>
            </button>
          )
        }
      </div>
    </div>
  );
}