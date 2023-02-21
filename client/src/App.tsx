import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthState } from './database/auth';
import NotSignedIn from './guards/notSignedIn';
import SignedIn from './guards/signedIn';
import HotelChain from './pages/hotelChain/hotelChain';
import Client from './pages/client/client';
import Employee from './pages/employee/employee';
import SignIn from './pages/signIn/signIn';
import SignUp from './pages/signUp/signUp';

export default function () {
  const user = useAuthState();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NotSignedIn user={user}><SignIn /></NotSignedIn>} />
          <Route path='/sign-up' element={<NotSignedIn user={user}><SignUp /></NotSignedIn>} />
          <Route path='/client' element={<SignedIn user={user} type='client'><Client /></SignedIn>} />
          <Route path='/employee' element={<SignedIn user={user} type='employee'><Employee /></SignedIn>} />
          <Route path='/hotel-chain' element={<SignedIn user={user} type='hotel-chain'><HotelChain /></SignedIn>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}