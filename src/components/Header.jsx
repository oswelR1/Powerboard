import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { handleLogout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout(() => {
      console.log('Logout callback executed');
      navigate('/login', { replace: true });
    });
  };

  return (
    <header>
      {/* ... other header content ... */}
      <button onClick={onLogout}>Logout</button>
    </header>
  );
};

export default Header;