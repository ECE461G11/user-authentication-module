import React from 'react';
import './Register.css';

function Register() {
    return (
        <div className="register-container">
            <h2>Register</h2>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <select>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            <button>Register</button>
        </div>
    );
}

export default Register;
