
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51OSubSSGKRmw9b8IHenZS8KiXyhqMdJojzED97edP4jgQ7Q95qMkgKAxwXPtNrGW07gAHJ74N0Rxi1MBCeMH762500pqWR8UDg');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
