import { Navigate } from 'react-router-dom';
import { User } from '../types/interfaces';

export default function({ user, type, children }: { user: User | null, type: 'client' | 'employee' | 'admin', children: any }) {
  //if (user?.type === type) {
    return children;
  //}
  //return <Navigate to='/' />
}

