const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const multer=require('multer');
//const upload = multer({dest:'public/img/users'});
const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);


  router.patch('/updateMyPassword',authController.protect,authController.updatePassword);
  router.get('/me',authController.protect, userController.getMe, userController.getUser);
 router.patch('/updateMe',authController.protect,userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe',authController.protect,userController.deleteMe);
  
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
