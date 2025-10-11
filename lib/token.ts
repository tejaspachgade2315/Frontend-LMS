// utils/auth.ts
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Set the token in cookies
export const setToken = (token: any, name: string) => {
  Cookies.set(name, token, { expires: 7, secure: true });
};

// Get the token from cookies
export const getToken = (name: string): string | undefined => {
  return Cookies.get(name);
};

// Remove the token from cookies
export const removeToken = (name: string) => {
  Cookies.remove(name);
  localStorage.clear();
};

// Check if the token exists in cookies

// Check if the token is valid (not expired)
export const isTokenValid = (
  token: string | undefined,
  tokenName: string
): boolean => {
  if (!token) return false;

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decodedToken.exp <= currentTime) {
      removeToken(tokenName);
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};