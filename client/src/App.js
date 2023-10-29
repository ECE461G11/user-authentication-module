import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';
import { LOGIN_ROUTE, REGISTER_ROUTE, DASHBOARD_ROUTE } from './helpers/routes';

function App() {
    return (
        <Router>
            <Routes>
                <Route path={LOGIN_ROUTE} element={<Login />} />
                <Route path={REGISTER_ROUTE} element={<Register />} />
                <Route path={DASHBOARD_ROUTE} element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
