const bookingController=require('./../controllers/bookingController');
const express= require('express')
const authController=require('./../controllers/authController')


const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
module.exports=router;