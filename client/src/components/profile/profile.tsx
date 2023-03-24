import { RefObject, useEffect, useRef, useState } from 'react';
import styles from './profile.module.css'

export default function ({ title, editable, onSave, onDelete, inputs }: {
  title: string,
  editable: boolean,
  onSave: (refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) => any,
  onDelete: (refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>) => any,
  inputs: {
    name: string,
    type: string,
    onChange: (ref: RefObject<HTMLInputElement>) => any,
    maxLength: number,
    initialValue?: string | boolean 
  }[]
}) {
  const [error, setError] = useState<string>('');
  let inputRefs: RefObject<HTMLInputElement>[] = [];

  useEffect(() => {
    inputRefs.forEach((ref, index) => {
      if (inputs[index].initialValue && inputs[index].type !== 'checkbox') ref.current?.setAttribute('value', inputs[index].initialValue! as string);
      if (inputs[index].initialValue && inputs[index].type === 'checkbox') ref.current?.setAttribute('checked', inputs[index].initialValue! as string)
    });
  }, [inputs])
  
  return (
    <div>
      <h1 className={styles.title}>{ title }</h1>
      <form className={styles.profile} onSubmit={async (e) => {
        e.preventDefault();
        if (await onSave(inputRefs, setError)) window.location.reload();
      }}>
        {
          inputs.map((input, index) => {
            inputRefs.push(useRef(null));
            return (
              <div className={styles.inputGroup} key={index}>
                <span>{ input.name }: </span>
                <input 
                  className={styles.input} 
                  type={input.type} 
                  placeholder={input.name} 
                  size={1} 
                  ref={inputRefs[index]} 
                  onChange={() => input.onChange(inputRefs[index])} 
                  maxLength={input.maxLength} 
                  disabled={!editable} />
              </div>
            );
          })
        }
        {
          editable &&
          <div className={styles.belowFields}>
            <span>{ error }</span>
            <button className={styles.saveButton} type='submit'>Save</button>
          </div>
        }
      </form>
      {
        editable &&
        <div className={styles.aWrapper}><span onClick={async () => {
          if (await onDelete(inputRefs, setError)) window.location.reload();
        }}>Delete</span></div>
      }
    </div>
  );
}