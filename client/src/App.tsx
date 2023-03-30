import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotSignedIn from './guards/notSignedIn';
import SignedIn from './guards/signedIn';
import HotelChain from './pages/hotelChain/hotelChain';
import Client from './pages/client/client';
import Employee from './pages/employee/employee';
import SignIn from './pages/signIn/signIn';
import SignUp from './pages/signUp/signUp';

export default function () {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NotSignedIn><SignIn /></NotSignedIn>} />
          <Route path='/sign-up' element={<NotSignedIn><SignUp /></NotSignedIn>} />
          <Route path='/client' element={<SignedIn type='client'><Client /></SignedIn>} />
          <Route path='/employee' element={<SignedIn type='employee'><Employee /></SignedIn>} />
          <Route path='/hotel_chain' element={<SignedIn type='hotel_chain'><HotelChain /></SignedIn>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}