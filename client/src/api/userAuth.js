import {
  postRequest,
  getRequest,
  putRequest,
} from "../utils/axiosClient";
import {
  LOGIN_API,
  RESET_REGISTRY_API,
  REGISTER_API,
  GET_ALL_PACKAGES_API,
} from "../helpers/apiEndpoints";

// Parameters: URL, params, navigate, requireToken, requireContentType

export const getAllPackage = async (params, navigate) => {
  try {
    const response = await getRequest(GET_ALL_PACKAGES_API, params, navigate);
    return response.type === 1 ? response.response.data : null;
  } catch (error) {
    console.error("Error getting all packages: ", error);
  }
};

export const loginUser = async (payload, navigate) => {
  try {
    const response = await putRequest(
      LOGIN_API,
      payload,
      navigate,
      false,
      false,
    );
    if (response.type === 1) {
      return response.response;
    }
  } catch (error) {
    console.log(error);
  }
};

// export const getPackage = async (packageQueries, offset, navigate) => {
//   try {
//     const response = await postRequest(
//       GET_PACKAGE_API,
//       packageQueries,
//       navigate,
//     );
//     return response.type === 1 ? response.response : null;
//   } catch (error) {
//     console.error(`Error getting package details: `, error);
//   }
// };

// export const createPackage = async (packageData, navigate) => {
//   try {
//     const response = await postRequest(PACKAGE_API, packageData, navigate);
//     return response.type === 1 ? response.response : null;
//   } catch (error) {
//     console.error("Error creating package: ", error);
//   }
// };
//
// export const createMultiplePackages = async (packagesData, navigate) => {
//   try {
//     const response = await postRequest(PACKAGES_API, packagesData, navigate);
//     return response.type === 1 ? response.response : null;
//   } catch (error) {
//     console.error("Error creating multiple packages: ", error);
//   }
// };

export const resetAPI = async (navigate) => {
  try {
    const response = await postRequest(RESET_REGISTRY_API, {}, navigate);
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error("Error resetting API: ", error);
  }
};

export const registerUser = async (userData, navigate) => {
  try {
    const response = await postRequest(
      REGISTER_API,
      userData,
      navigate,
      true,
      false,
    );
    return response.type === 1 ? response.response : null;
  } catch (error) {
    console.error("Error registering user: ", error);
  }
};

// export const getPackageRating = async (id, navigate) => {
//   try {
//     const response = await getRequest(
//       `${PACKAGE_RATE_API}/${id}`,
//       {},
//       navigate,
//     );
//     return response.type === 1 ? response.response : null;
//   } catch (error) {
//     console.error(`Error getting rating for package ${id}: `, error);
//   }
// };
