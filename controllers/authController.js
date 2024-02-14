const User=require('./../models/userModel');
const jwt= require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const { promisify } = require('util');
const crypto=require('crypto')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_SECRET_IN
    });
  };
  
  const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };

  exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });
//const url =`${req.protocol}://${req.get('host')}/me`;

//console.log(url);
  // await  new Email(newUser,url).sendWelcome() ;

  
    createSendToken(newUser, 201, res);
  });


  exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
  
    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
  
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
  
    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  });


  exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

  exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt){
      token=req.cookies.jwt;
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
    // 3) Check if user still exists
   const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    } 
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser; 
    res.locals.user = currentUser;
    next();
  });


  exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
  
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };
  

  exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        //roles is an array  ['admin, lead-guide] role='user

        if(!roles.includes(req.user.role)){
            return next(new AppError('you do not have permission',403));


        }
        next();
    }
};


exports.forgotPassword= catchAsync( async(req,res,next)=>{
    //1) get user based on posted email 

    const user=await User.findOne({email:req.body.email});

    if(!user){
        return next(new AppError('no user with this email ',404))
    }

    //2) genrate random reset token 
    const resetToken= user.createPasswordResetToken();
    //await user.save();
    await user.save({validateBeforeSave:false });
    
    

    //3) send it to users email 

    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message=`Forgot your Password ? submit patch with your new password and
     passwordConform to :${resetURL}.\n If you dindt forgrt password ingore it `;
    try{

   //     await sendEmail({
     //       email:user.email,
       //     subject:'your password is rest toekn ',
         //   message
        //});
    
        res.status(200).json({
            status:'success',
            message:'token sent to email',
    
    
        })
    }catch(err){

        user.passwordResetToken=undefined;
       // user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false });

  return next(new AppError('there was error for sending email',500));
    }

});
exports.resetPassword= catchAsync(async(req,res,next)=>{


    //1)get user based on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:
    
    Date.now()}});


    //2)if token has not expired , and there is user , set new password 

    if(!user){
        return next(new AppError('token is invalid or has expired', 400))
    }

    user.password=req.body.password;

    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;

    await user.save();

    //3) update changedapssword property for the user 

    //4)log the user in , send JWT

    createSendToken(user,200,res);
   



});

exports.updatePassword=catchAsync(async(req,res,next)=>{
  //1) get user from collection 
const user=await User.findById(req.user.id).select('+password');

  //2) check if the posted current password is correct
 if(! (await user.correctPassword(req.body.passwordCurrent,user.password))){

  return next(new AppError('current password is wrong ',401))
 }


  //3) if so , updated password 

  user.password=req.body.password;

  user.passwordConfirm=req.body.passwordConfirm;

  await user.save();
  

  //4) log user in , send jwt
  createSendToken(user,201,res);
})