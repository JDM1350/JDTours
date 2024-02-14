const reviewController=require('./../controllers/reviewController');
const express= require('express')
const authController=require('./../controllers/authController')

const router=express.Router({mergeParams:true}); // to access the parameter of other routers 


router.use(authController.protect);

router.route('/')
.get( reviewController.getAllReviews)
.post(  
    authController.restrictTo('user'),
     reviewController.createReview);



//router.route('/:id').delete(reviewController.deleteReview);

router.route('/:id').get(reviewController.getReview).patch(authController.restrictTo('user','admin'),reviewController.updateReview).delete(authController.restrictTo('user','admin'),reviewController.deleteReview);
module.exports=router;