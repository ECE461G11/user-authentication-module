import { postRequest } from "../utils/axiosClient";
import { LOGIN_API } from "../helpers/apiEndpoints";

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



