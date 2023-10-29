import React from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { REGISTER_ROUTE, DASHBOARD_ROUTE } from '../../helpers/routes';
import { loginUser } from '../../api/userAuth';
import { setCurrentUser } from '../../utils/localStorage';
import './Login.css';

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

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const payload = {
      username: values.username,
      password: values.password,
    }
    const response = await loginUser(payload, navigate);
    if (response?.status === 200) {
      alert(response.data.message);
      setCurrentUser(response.data);
      navigate(DASHBOARD_ROUTE);
    } else {
      alert(response.errormessage);
    }
  }

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validate,
    onSubmit: async (values) => {
      handleLogin(values);
    },
  });

  const handleRegister = () => {
    navigate(REGISTER_ROUTE);
  };

  return (
    <div className="login-container">
      <h2>User Authentication Module</h2>
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
        <button type="submit">Login</button>
      </form>
      <div className="register-link">
        <p>Don't have an account?</p>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default Login;
