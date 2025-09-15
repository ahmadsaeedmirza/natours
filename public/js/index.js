import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signup } from './signup';
import { forgetpass, resetpass } from './forgetPassword';
import { postReview, updateReview } from './review';
import { showAlert } from './alert';

// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const forgetPassForm = document.querySelector('.form--forget-pass');
const resetPassForm = document.querySelector('.form--reset-pass');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
const bookLogin = document.getElementById('book-login');
const reviewForm = document.querySelector('.form--review');
const reviewUpdateForm = document.querySelector('.form--review--update');
const modalBtns = document.querySelectorAll('.card__review');
const modalUpdateBtns = document.querySelectorAll('.update__review');
const xBtn = document.querySelector('.modal__close');
const xBtn2 = document.querySelector('.modal__close-2');
const star1 = document.querySelector('.star-1');
const star2 = document.querySelector('.star-2');
const star3 = document.querySelector('.star-3');
const star4 = document.querySelector('.star-4');
const star5 = document.querySelector('.star-5');
const alertMsg = document.querySelector('body').dataset.alert;

if (alertMsg) {
    showAlert('success', alertMsg);
    window.setTimeout(() => {
        location.assign('/my-tours');
    }, 5000);
}

// DELEGATION
if (mapbox) {
    const locations = JSON.parse(mapbox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    })
}

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        signup(name, email, password, confirmPassword);
    })
}

if (forgetPassForm) {
    forgetPassForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        forgetpass(email);
    })
}

if (resetPassForm) {
    resetPassForm.addEventListener('submit', e => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = window.location.pathname.split('/').pop();
        resetpass(token, password, confirmPassword);
    })
}

var rating;
var tourId;
var reviewId;

if (reviewForm) {
    reviewForm.addEventListener('submit', e => {
        e.preventDefault();
        const review = document.getElementById('review__submit').value;
        postReview(tourId, rating, review);
    })
}

if (reviewUpdateForm) {
    reviewUpdateForm.addEventListener('submit', e => {
        e.preventDefault();
        const review = document.getElementById('review__submit-2').value;
        updateReview(reviewId, rating, review);
    })
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    })
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save--password').textContent = 'Updating...';
        const currentPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        await updateSettings({ currentPassword, password, confirmPassword }, 'password');

        document.querySelector('.btn--save--password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}

if (bookLogin) {
    bookLogin.addEventListener('click', () => {
        window.location.replace('/login');
    })
}

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    })
}

modalBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector('.modal').style.display = 'block';
        tourId = btn.dataset.tourId; // 🟢 Make sure tourId is set from the clicked button
    });
});

modalUpdateBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector('.modal-2').style.display = 'block';
        reviewId = btn.dataset.reviewId;
    })
})

if (xBtn) {
    xBtn.addEventListener('click', e => {
        document.querySelector('.modal').style.display = 'none';
    })
}

if (xBtn2) {
    xBtn2.addEventListener('click', e => {
        document.querySelector('.modal-2').style.display = 'none';
    })
}

if (star1) {
    star1.addEventListener('click', e => {
        star1.style.color = 'gold';
        star2.style.color = 'inherit';
        star3.style.color = 'inherit';
        star4.style.color = 'inherit';
        star5.style.color = 'inherit';
        rating = 1;
    })
}

if (star2) {
    star2.addEventListener('click', e => {
        star1.style.color = 'gold';
        star2.style.color = 'gold';
        star3.style.color = 'inherit';
        star4.style.color = 'inherit';
        star5.style.color = 'inherit';
        rating = 2;
    })
}

if (star3) {
    star3.addEventListener('click', e => {
        star1.style.color = 'gold';
        star2.style.color = 'gold';
        star3.style.color = 'gold';
        star4.style.color = 'inherit';
        star5.style.color = 'inherit';
        rating = 3;
    })
}
if (star4) {
    star4.addEventListener('click', e => {
        star1.style.color = 'gold';
        star2.style.color = 'gold';
        star3.style.color = 'gold';
        star4.style.color = 'gold';
        star5.style.color = 'inherit';
        rating = 4;
    })
}

if (star5) {
    star5.addEventListener('click', e => {
        star1.style.color = 'gold';
        star2.style.color = 'gold';
        star3.style.color = 'gold';
        star4.style.color = 'gold';
        star5.style.color = 'gold';
        rating = 5;
    })

}