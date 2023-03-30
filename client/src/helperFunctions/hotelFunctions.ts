import { RefObject } from "react";
import { deleteHotel, updateHotel } from "../database/setter";
import { isEmailValid, isFilled, isNumber, isPhoneValid } from "./inputCheck";

export async function modifyHotel(refs: RefObject<HTMLInputElement>[], setError: React.Dispatch<React.SetStateAction<string>>, id: string): Promise<boolean> {

  const [emailRef, phoneRef, streetNumberRef, streetNameRef, aptNumberRef, cityRef, provinceRef, zipCodeRef] = refs;

  //Every field should be filled (apt can be empty)
  if (!isFilled(emailRef) || !isFilled(phoneRef) || !isFilled(streetNumberRef) || 
    !isFilled(streetNameRef) || !isFilled(cityRef) || 
    !isFilled(provinceRef) || !isFilled(zipCodeRef)) {
    setError('Please fill every field');
    return false;
  }

  if (!isEmailValid(emailRef)) {
    setError('Please enter a valid email address');
    return false;
  }

  if (!isPhoneValid(phoneRef)) {
    setError('Please enter a valid phone number');
    return false;
  }

  if (!isNumber(streetNumberRef)) {
    setError('Please make sure the street number is in a numeric format');
    return false;
  }

  if (!isNumber(aptNumberRef) && isFilled(aptNumberRef)) {
    setError('Please make sure the apt number is in a numeric format');
    return false;
  }

  const params = {
    email: emailRef.current?.value.trim()!,
    phone: parseInt(phoneRef.current?.value.trim()!),
    address: {
      street_name: streetNameRef.current?.value.trim()!, 
      street_number: parseInt(streetNumberRef.current?.value.trim()!), 
      apt_number: parseInt(aptNumberRef.current?.value.trim()!), 
      city: cityRef.current?.value.trim()!, 
      province: provinceRef.current?.value.trim()!, 
      zip: zipCodeRef.current?.value.replace(/\s/g, '')!
    }
  }

  try {
    await updateHotel({ id: id, ...params });
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
}

export async function removeHotel(hotelId: string) {
  try {
    await deleteHotel(hotelId)
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}