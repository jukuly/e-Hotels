import { RefObject, useEffect, useRef, useState } from 'react';
import styles from './profile.module.css'

export default function ({ title, onSave, inputs }: {
  title: string,
  onSave: (refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) => any,
  inputs: {
    name: string,
    type: string,
    onChange: (ref: RefObject<HTMLInputElement>) => any,
    maxLength: number,
    initialValue?: string 
  }[]
}) {
  const [error, setError] = useState<string>('');
  let inputRefs: RefObject<HTMLInputElement>[] = [];

  useEffect(() => {
    inputRefs.forEach((ref, index) => {
      if (inputs[index].initialValue) ref.current?.setAttribute('value', inputs[index].initialValue!);
    });
  }, [inputs])
  
  return (
    <>
      <h1 className={styles.title}>{ title }</h1>
      <form className={styles.profile} onSubmit={e => {
        e.preventDefault();
        onSave(inputRefs, setError);
      }}>
        {
          inputs.map((input, index) => {
            inputRefs.push(useRef(null));
            return (
              <div className={styles.inputGroup} key={index}>
                <span>{ input.name }: </span>
                <input className={styles.input} type={input.type} placeholder={input.name} size={1} ref={inputRefs[index]} onChange={() => input.onChange(inputRefs[index])} maxLength={input.maxLength} />
              </div>
            );
          })
        }
        <div className={styles.belowFields}>
          <span>{ error }</span>
          <button className={styles.saveButton} type='submit'>Save</button>
        </div>
      </form>
    </>
  );
}