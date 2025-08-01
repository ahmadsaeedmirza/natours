import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const postReview = async (tourId, rating, review) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `http://127.0.0.1:8000/api/v1/tours/${tourId}/reviews`,
            data: {
                rating,
                review
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Thank you for your review');
            document.querySelector('.modal').style.display = 'none';
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const updateReview = async (reviewId, rating, review) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:8000/api/v1/reviews/${reviewId}`,
            data: {
                rating,
                review
            }
        });

        console.log(res);

        if (res.data.status === 'success') {
            showAlert('success', 'Review updated successfully');
            document.querySelector('.modal-2').style.display = 'none';
            window.setTimeout(() => {
                location.assign('/my-reviews');
            }, 1500);
        }

    } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message);
    }
}
