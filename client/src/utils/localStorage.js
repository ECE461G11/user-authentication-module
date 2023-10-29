export const getCurrentUser = () => {
  let user = null;
  try {
    user = localStorage.getItem('currentUser') != null ? JSON.parse(localStorage.getItem('currentUser')) : null;
  } catch (error) {
    user = null;
  }
  return user;
};

export const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  } catch (error) {
    // console.error(error);
  }
};
