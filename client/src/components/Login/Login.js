import React from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../../helpers/routes';
import { loginUser } from '../../api/userAuth';
import { setCurrentUser } from '../../utils/localStorage';
import './Login.css';

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
      alert(response?.errormessage);
    }
  }

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: async (values) => {
      handleLogin(values);
    },
  });

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
    </div>
  );
}

export default Login;
