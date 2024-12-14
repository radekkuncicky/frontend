import axios from './axiosInstance';

export const fetchProjects = async () => {
  const res = await axios.get('/projects');
  return res.data;
};
