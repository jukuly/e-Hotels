import { Navigate } from 'react-router-dom';
import { User } from '../types/interfaces';

export default function({ user, children }: { user: User | null, children: any }) {
  if (!user) {
    return children;
  }

  switch (user.type) {
    case 'client':
      return <Navigate to='/client' />
    case 'employee':
      return <Navigate to='/employee' />
    case 'hotel-chain':
      return <Navigate to='/hotel-chain' />
    default:
      return <Navigate to='/' />
  }
}

