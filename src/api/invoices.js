import axios from './axiosInstance';

export const fetchInvoices = async () => {
  const res = await axios.get('/invoices');
  return res.data;
};
