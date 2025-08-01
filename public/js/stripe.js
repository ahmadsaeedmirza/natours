import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51RqJjHLRVY1oNiPv5I8jSwHvVyNxuFxt0WbajPUrpxpbv9fswzi15UlnTtSMSOLNzVm8AOahAKIuukQzoskDQNPt00CPRtDGMc');

export const bookTour = async tourId => {
    try {
        // 1) GET CHECKOUT SESSION FROM API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

        // 2) CREATE CHECKOUT FORM + CHARGE CREDIT CARD
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        showAlert('error', err);
    }
}