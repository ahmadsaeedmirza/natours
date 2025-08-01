import axios from 'axios';
import { showAlert } from './alert';

export const forgetpass = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Token sent to mail');
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const resetpass = async (token, password, confirmPassword) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/resetPassword/${token}`,
            data: {
                password,
                confirmPassword
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Password changed successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}