import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';

export default function () {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}