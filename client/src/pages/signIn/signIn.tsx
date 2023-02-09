import { useRef, useState } from 'react';
import styles from './signIn.module.css'
import { signInEmailPassword } from '../../auth/auth';
import { useNavigate } from 'react-router-dom';

export default function () {
  const [error, setError] = useState<string>('');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  async function signIn() {
    try {
      await signInEmailPassword(emailRef.current?.value, passwordRef.current?.value);
      setError('');
      navigate('/client');
    } catch (err: any) {
      if (err.code === 'missing-credentials' || err.code === 'invalid-credentials') {
        setError('Username or password incorrect');
      } else {
        console.error(err);
      }
    }
  }

  return (
    <>
      <main className={styles.box}>
        <h1 className={styles.boxTitle}>Sign In</h1>
        <form className={styles.signIn} onSubmit={e => {
          e.preventDefault();
          signIn();
        }}>
          <input className={styles.input} type='text' placeholder='Email' ref={emailRef} />
          <input className={styles.input} type='password' placeholder='Password' ref={passwordRef} />
          <div className={styles.belowFields}>
            <span>{ error }</span>
            <button className={styles.signInButton} type='submit'>Sign In</button>
          </div>
        </form>
        <div className={styles.aWrapper}><a href='/sign-up'>No account yet?</a></div>
      </main>
    </>
  );
}