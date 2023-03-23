import PopUp from '../../../components/popUp/popUp';
import { locateRoom } from '../../../database/reservations';
import { Reservation } from '../../../types/interfaces';
import styles from './locationPopUp.module.css';

export default function({ openTrigger, popUp }: { openTrigger: boolean, popUp: Reservation | undefined }) {
  async function reservationToLocation() {
    if (!popUp) return;
    try {
      await locateRoom(popUp);
      alert('Location successfull!');
      window.location.reload();
    } catch(err: any) {
      alert('An error has occured.');
      console.error(err);
    }
  }

  return (
    <PopUp openTrigger={openTrigger}>
      <form className={styles.paymentForm} onSubmit={e => {
        e.preventDefault();
        reservationToLocation();
      }}>
        <input type='text' placeholder='Name on the card' size={1} maxLength={20} />
        <input type='text' placeholder='Card number' size={1} maxLength={16} inputMode='numeric' />
        <div>
          <span>Expiry Date: </span><input type='date' size={1} />
        </div>
        <input type='text' placeholder='CCV' size={1} maxLength={3} inputMode='numeric' />
        <button className={styles.locationButton} type='submit'>Save</button>
      </form>
    </PopUp>
  );
}