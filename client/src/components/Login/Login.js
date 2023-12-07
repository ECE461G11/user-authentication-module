import React from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../../helpers/routes';
import { loginUser } from '../../api/userAuth';
import { setCurrentUser } from '../../utils/localStorage';
import './Login.css';

const validate = values => {
  const errors = {};
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (values.username.length < 3) {
    errors.username = 'Username must be at least 3 characters long.';
  }

  if (values.username.includes(' ')) {
    errors.username = 'Username must not contain spaces.';
  }

  if (!passwordRegex.test(values.password)) {
    errors.password = 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
  }

  console.log('Validation errors: ', errors);
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
      alert(response?.errormessage);
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
        {formik.touched.password && formik.errors.password ? (
          <span style={{ color: 'red' }}>{formik.errors.password}</span>
        ) : null}
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
