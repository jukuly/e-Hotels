import { RefObject } from "react";

export function isNumber(inputRef: RefObject<HTMLInputElement>): boolean {
  const value = inputRef.current?.value.trim();
  if (isNaN(parseInt(value!)) || !isFinite(parseInt(value!))) {
    inputRef.current?.classList.add('error');
    return false;
  } else {
    inputRef.current?.classList.remove('error');
    return true;
  }
}

export function isFilled(inputRef: RefObject<HTMLInputElement>): boolean {
  const value = inputRef.current?.value.trim();
  if (!inputRef.current || !value) {
    inputRef.current?.classList.add('error');
    return false;
  } else {
    inputRef.current?.classList.remove('error');
    return true;
  }
}

export function isEmailValid(emailRef: RefObject<HTMLInputElement>): boolean {
  const value = emailRef.current?.value.trim();
  if (!value!.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    emailRef.current?.classList.add('error');
    return false;
  } else {
    emailRef.current?.classList.remove('error');
    return true;
  }
}

export function isPasswordValid(passwordRef: RefObject<HTMLInputElement>): boolean {

  //length: 8-16, normal & capital letter, number and symbol: [!, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, ^, _, `, {, |, }, ~] 
  if (!passwordRef.current?.value.match(/^(?=.*[0-9])(?=.*[!"#$%&'()*+\,\-\./:;<=>?@^_`{|}~])[a-zA-Z0-9!"#$%&'()*+\,\-\./:;<=>?@^_`{|}~]{8,16}$/)) {
    passwordRef.current?.classList.add('error');
    return false;
  } else {
    passwordRef.current?.classList.remove('error');
    return true;
  }
}

export function isPasswordConfirmValid(passwordRef: RefObject<HTMLInputElement>, passwordConfirmRef: RefObject<HTMLInputElement>): boolean {
  if (passwordConfirmRef.current?.value !== passwordRef.current!.value) {
    passwordConfirmRef.current?.classList.add('error');
    return false;
  } else {
    passwordConfirmRef.current?.classList.remove('error');
    return true;
  }
}

export function isPhoneValid(phoneRef: RefObject<HTMLInputElement>): boolean {
  if (phoneRef.current?.value.length !== 10 || !isNumber(phoneRef)) {
    phoneRef.current?.classList.add('error');
    return false;
  } else {
    phoneRef.current?.classList.remove('error');
    return true;
  }
}

export function isNASValid(nasRef: RefObject<HTMLInputElement>): boolean {
  if (nasRef.current?.value.length !== 9 || !isNumber(nasRef)) {
    nasRef.current?.classList.add('error');
    return false;
  } else {
    nasRef.current?.classList.remove('error');
    return true;
  }
}