import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const login = async (loginData) => {
    return axios.post(`${BASE_URL}/user/login`, loginData);
};
