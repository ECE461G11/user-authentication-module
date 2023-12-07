import React from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../helpers/routes';
import { registerUser } from '../../api/userAuth';
import './Register.css';

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

function Register() {
  const navigate = useNavigate();
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  
  const handleRegister = async (values) => {
    const payload = {
      username: values.username,
      password: values.password,
      role: values.role,
    };
  try{
    const response = await registerUser(payload);
    if (response?.status === 201) {
      alert(response.data.message);
      navigate(LOGIN_ROUTE);
    } else {
      alert(response?.errormessage);
    }
  }
  catch(error){
    console.log("Error registering: ",error);
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
      setSubmitAttempted(true);
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
        {formik.touched.password && formik.errors.password ? (
          <span style={{ color: 'red' }}>{formik.errors.password}</span>
        ) : null}

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
