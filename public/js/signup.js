/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const signupData = async (name,email,password,passwordConfirm) => {
  try {
   
        

    const res = await axios({
      method: 'POST',
      url:'http://127.0.0.1:3000/api/v1/users/signup',
      data:{
       name,
       email,
       password,
       passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success',  'Signup successfully');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};