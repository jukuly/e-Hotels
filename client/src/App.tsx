import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/signIn/signIn';
import SignUp from './pages/signUp/signUp';

export default function () {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}