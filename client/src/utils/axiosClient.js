import axios from "axios";
import { LOGIN_ROUTE } from "../helpers/routes";
import { getCurrentUser } from "./localStorage";

console.log(process.env.REACT_APP_BACKEND_URL);

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  timeout: 600000,
});

export const unAuthorized = (navigate) => {
  localStorage.clear();
  navigate(LOGIN_ROUTE);
};

const getRequestHeaders = (requireToken, requireContentType) => {
  let headers = {};
  if (requireToken) {
    console.log(getCurrentUser());
    headers["X-Authorization"] = getCurrentUser()?.value;
  }
  if (requireContentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

export function getRequest(
  URL,
  params,
  navigate,
  requireToken = true,
  requireContentType = true,
) {
  return axiosClient
    .get(`${URL}`, {
      params: params,
      headers: getRequestHeaders(requireToken, requireContentType),
    })
    .then((response) => ({ type: 1, response }))
    .catch((error) => handleRequestError(error, navigate));
}

export function postRequest(
  URL,
  payload,
  navigate,
  requireToken = true,
  requireContentType = true,
) {
  return axiosClient
    .post(`${URL}`, payload, {
      headers: getRequestHeaders(requireToken, requireContentType),
    })
    .then((response) => ({ type: 1, response }))
    .catch((error) => handleRequestError(error, navigate));
}

export function putRequest(
  URL,
  payload,
  navigate,
  requireToken = true,
  requireContentType = true,
) {
  return axiosClient
    .put(`${URL}`, payload, {
      headers: getRequestHeaders(requireToken, requireContentType),
    })
    .then((response) => ({ type: 1, response }))
    .catch((error) => handleRequestError(error, navigate));
}

export function deleteRequest(
  URL,
  navigate,
  requireToken = true,
  requireContentType = true,
) {
  return axiosClient
    .delete(`${URL}`, {
      headers: getRequestHeaders(requireToken, requireContentType),
    })
    .then((response) => ({ type: 1, response }))
    .catch((error) => handleRequestError(error, navigate));
}

const handleRequestError = (error, navigate) => {
  if (error?.response?.status === 401) {
    unAuthorized(navigate);
  }
  const errors = error?.response?.data?.errors;
  const errorMessage = error?.response?.data?.message;
  return { type: 2, errors, errorMessage };
};
