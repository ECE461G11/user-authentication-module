import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import { LOGIN_ROUTE, DASHBOARD_ROUTE } from './helpers/routes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path={LOGIN_ROUTE} element={<Login />} />
                <Route path={DASHBOARD_ROUTE} element={<Dashboard />} />
                <Route path="*" element={<Navigate replace to={LOGIN_ROUTE} />} />
            </Routes>
        </Router>
    );
}

export default App;
