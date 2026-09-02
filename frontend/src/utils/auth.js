export const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Impossible de récupérer le user :", error);
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};
