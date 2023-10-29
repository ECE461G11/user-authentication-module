import axios from 'axios';
import { LOGIN_ROUTE } from '../helpers/routes';
import { getCurrentUser } from './localStorage';

const axiosClient = axios.create({
  baseURL: (process.env.BACKEND_URL || 'http://localhost:8000'),
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const unAuthorized = (navigate) => {
  localStorage.clear();
  navigate(LOGIN_ROUTE);
};
export function getRequest(URL, params, navigate) {
  return axiosClient
    .get(`/${URL}`, {
      params: params,
      headers: {
        'x-access-token': getCurrentUser()?.token,
      },
    })
    .then((response) => ({ type: 1, response }))
    .catch((error) => {
      if (error.response.status === 401) {
        unAuthorized(navigate);
      }
      const errors = error?.response?.data?.errors;
      const errormessage = error?.response?.data?.message;
      return { type: 2, errors, errormessage };
    });
}

export function postRequest(URL, payload, navigate) {
  return axiosClient
    .post(
      `/${URL}`,
      payload,
      {
        headers: {
          'x-access-token': getCurrentUser()?.token,
        },
      }
    )
    .then((response) => ({ type: 1, response }))
    .catch((error) => {
      console.log(error.response);
      if (error.response.status === 401) {
        unAuthorized(navigate);
      }
      const errors = error?.response?.data?.errors;
      const errormessage = error?.response?.data?.message;
      return { type: 2, errors, errormessage };
    });
}