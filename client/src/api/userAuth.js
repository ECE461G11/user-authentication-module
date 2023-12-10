import { postRequest } from "../utils/axiosClient";
import { LOGIN_API, PACKAGE_API, PACKAGES_API, RESET_API, REGISTER_API, AUTHENTICATE_API, PACKAGE_RATE_API } from "../helpers/apiEndpoints";
import axios from 'axios';
require('dotenv').config();
axios.get(`${API_URL}/api/user`);
const API_URL = process.env.BACKEND_URL;

export const loginUser = async (payload, navigate) => {
  try {
    const response = await postRequest(LOGIN_API, payload, navigate);
    if (response.type === 1) {
      return response.response;
    }
  } catch (error) {
    console.log(error);
  }
}

export const createPackage = async (packageData, navigate) => {
  try {
    const response = await postRequest(PACKAGE_API, packageData, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error('Error creating package: ', error);
  }
};

export const createMultiplePackages = async (packagesData, navigate) => {
  try {
    const response = await postRequest(PACKAGES_API, packagesData, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error('Error creating multiple packages: ', error);
  }
};

export const resetAPI = async (navigate) => {
  try {
    const response = await postRequest(RESET_API, {}, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error('Error resetting API: ', error);
  }
};

export const registerUser = async (userData, navigate) => {
  try {
    const response = await postRequest(REGISTER_API, userData, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error('Error registering user: ', error);
  }
};

export const authenticateUser = async (userData, navigate) => {
  try {
    const response = await postRequest(AUTHENTICATE_API, userData, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error('Error authenticating user: ', error);
  }
};

export const getPackageRating = async (id, navigate) => {
  try {
    const response = await getRequest(`${PACKAGE_RATE_API}/${id}`, {}, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error(`Error getting rating for package ${id}: `, error);
  }
};

