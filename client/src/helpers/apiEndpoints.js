import {
    PACKAGE_CREATE_ROUTE,
    PACKAGES_CREATE_ROUTE,
    API_RESET_ROUTE,
    USER_REGISTER_ROUTE,
    USER_AUTHENTICATE_ROUTE,
    PACKAGE_RATE_ROUTE,
  } from './routes';

export const AUTH_USER_API = 'api/user';
export const LOGIN_API = `${AUTH_USER_API}/login`;
export const PACKAGE_API = PACKAGE_CREATE_ROUTE;
export const PACKAGES_API = PACKAGES_CREATE_ROUTE;
export const RESET_API = API_RESET_ROUTE;
export const REGISTER_API = USER_REGISTER_ROUTE;
export const AUTHENTICATE_API = USER_AUTHENTICATE_ROUTE;
export const PACKAGE_RATE_API = PACKAGE_RATE_ROUTE;
export const GET_ALL_PACKAGES_API = '/get-all-packages';
export const GET_PACKAGE_API = '/packages/:id';
