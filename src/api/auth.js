import axios from './axiosInstance';

export const login = async (email, password) => {
  const res = await axios.post('/auth/login', {email, password});
  return res.data;
};
