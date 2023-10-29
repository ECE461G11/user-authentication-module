import React from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../helpers/routes';
import { registerUser } from '../../api/userAuth';
import './Register.css';

const validate = values => {
  const errors = {};

  if (values.username.length < 3) {
    errors.username = 'Username must be at least 3 characters long.';
  }

  if (values.username.includes(' ')) {
    errors.username = 'Username must not contain spaces.';
  }

  return errors;
};

function Register() {
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    const payload = {
      username: values.username,
      password: values.password,
      role: values.role,
    };
    const response = await registerUser(payload, navigate);
    if (response?.status === 201) {
      alert(response.data.message)
      setTimeout(() => {
        navigate(LOGIN_ROUTE);
      }, 1000);
    } else {
      alert(response.errormessage);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      role: 'user',
    },
    validate,
    onSubmit: async (values) => {
      await handleRegister(values);
    }
  });

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={formik.handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.username}
        />
        {formik.touched.username && formik.errors.username ? (
          <span style={{ color: 'red' }}>{formik.errors.username}</span>
        ) : null}

        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />

        <select
          name="role"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.role}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <div className="login-link">
        <span>Already have an account?</span>
        <button onClick={() => navigate(LOGIN_ROUTE)}>Login</button>
      </div>
    </div>
  );
}

export default Register;
