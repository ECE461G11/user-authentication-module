import { postRequest } from "../utils/axiosClient";
import { LOGIN_API, REGISTER_API } from "../helpers/apiEndpoints";

export const registerUser = async (payload, navigate) => {
  try {
    const response = await postRequest(REGISTER_API, payload, navigate);
    if (response.type === 1) {
      return response.response;
    }
  } catch (error) {
    console.log(error);
  }
}

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



