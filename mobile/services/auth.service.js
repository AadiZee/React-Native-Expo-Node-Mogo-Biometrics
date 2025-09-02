import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: password,
    });

    return res;
  } catch (error) {
    console.log("Error making api call");
  }
};

export const logout = async (refreshToken) => {
  try {
    const res = await axios.post(`${API_URL}/auth/logout`, {
      refreshToken,
    });
    return res;
  } catch (error) {
    console.log("Error making api call");
  }
};

export const register = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
    });
    return res;
  } catch (error) {
    console.log("Error making api call");
  }
};
