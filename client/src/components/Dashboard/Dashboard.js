import React, { useState, useEffect} from 'react';
import { getCurrentUser } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../helpers/routes';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);

  useEffect(() => {
    if (!getCurrentUser()) {
      navigate(LOGIN_ROUTE);
      setIsUserAuthenticated(false);
    }
  }, [navigate]);

  if (!isUserAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome to the Dashboard</h2>
    </div>
  );
}

export default Dashboard;
