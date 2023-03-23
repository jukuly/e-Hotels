import { useEffect, useState } from 'react';
import { getClientEmail, getReservations } from '../../../database/getter';
import { Reservation } from '../../../types/interfaces';
import LocationPopUp from '../locationPopUp/locationPopUp';
import styles from './reservationList.module.css'

export default function({ hotelId }: { hotelId: string | undefined }) {
  const [reservations, setReservations] = useState<{ client_email?: string, reservation: Reservation }[]>([]);

  const [popUpOpen, setOpenPopUpOpen] = useState<boolean>(false);
  const [popUp, setPopUp] = useState<Reservation | undefined>(undefined);

  useEffect(() => {
    if (!hotelId) return;
    const getReservationsByHotelId = async () => {
      try {
        const reservations = await Promise.all((await getReservations(hotelId!)).map(async (reservation) => {
          return { client_email: await getClientEmail(reservation.client_id!), reservation: reservation }
        }));
        setReservations(reservations);
      } catch (err) {
        console.error(err);
      }
    }

    getReservationsByHotelId();
  }, [hotelId]);

  

  function openPopUp(reservation: Reservation) {
    setOpenPopUpOpen(popUpOpen => !popUpOpen);
    setPopUp(reservation)
  }

  return (
    <div className={styles.wrapper}>
      <LocationPopUp openTrigger={popUpOpen} popUp={popUp} />
      <div className={styles.reservation}>
        {
          reservations.map(reservation => 
            <button className={styles.box} key={reservation.reservation.id} onClick={() => openPopUp(reservation.reservation)}>
              <div>Client: {reservation.client_email}</div>
              <div>Room: {reservation.reservation.room_id}</div>
              <div>Start Date: {reservation.reservation.start_date}</div>
              <div>End Date: {reservation.reservation.end_date}</div>
            </button>
          )
        } 
      </div> 
    </div>
  );
}