/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

 export const login = async (email, password) => {
    console.log(email,password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    

   if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } 
    console.log(res);
  } catch (err) {
   showAlert('error', err.response.data.message);
  console.log(err.response.data);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    if ((res.data.status = 'success')){
      showAlert('error', 'Log-out successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

