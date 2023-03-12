import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../database/auth';

export default function({ children }: { children: any }) {
  const navigate = useNavigate();

  useEffect(() => {
    const navigateToUser = async () => {
      const user = await getUser();
      if (user) navigate(`/${user.type}`);
    }
    
    navigateToUser();
  }, []);

  return children;
}

