import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [emailError, setEmailError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const email = event.target[0].value;

        if (!isValidEmail(email)) {
            setEmailError("Invalid email format");
            return;
        }

    
        setIsLoggedIn(true);  
    };

    const handleRegister = () => {
        navigate("/register");
    };

    if (isLoggedIn) {
        return (
            <div className="dashboard">
                <h2>Welcome to Dashboard</h2>
            </div>
        );
    }

    return (
        <div className="login-container">
            <h2>User Authentication Module</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" />
                {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
                <input type="password" placeholder="Password" />
                <select>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                </select>
                <button type="submit">Login</button>
            </form>
            <button onClick={handleRegister} className="register-button">Register</button>
        </div>
    );
}

export default Login;
