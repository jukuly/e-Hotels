import { useRef, useState } from 'react';
import { getRooms } from '../../../database/getter';
import { Room } from '../../../types/interfaces';
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

  const [results, setResults] = useState<Room[]>([]);

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

  return (
    <>
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
          <select className={styles.input} ref={hotelChainRef} >
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
          <button className={styles.searchButton} type='submit'>Search</button>
        </div>
      </form>

      <div className={styles.results}>
        {
          results.map(room => 
            <button className={`${styles.box} ${styles.roomBox}`} key={room.id}>
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
    </>
  );
}