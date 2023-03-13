import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../database/auth';

export default function({ type, children }: { type: 'client' | 'employee' | 'hotel-chain', children: any }) {
  const navigate = useNavigate();

  useEffect(() => {
    const navigateToUser = async () => {
      const user = await getUser();
      if (!user || user.type !== type) navigate('/');
    }
    
    navigateToUser();
  }, []);

  return children;
}

