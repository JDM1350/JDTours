const Tour=require('../models/tourModel')
const catchAsync=require('../utils/catchAsync')
const AppError = require('../utils/appError');
const User=require('../models/userModel')
exports.getOverview=catchAsync(async (req,res)=>{

    // 1) get tour data from collection 
    const tours=await Tour.find();


    //2) build templates 

    //3)Render that template using tour data from 1 
    res.status(200).render('overview',{
        title:'All Tours',
        tours
    })
}
)

exports.getTour=catchAsync(async(req,res)=>{
    //1) get darta for the requestex tour 
const tour=await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
});

if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
    //2) build template 

    //3) render template using data from 1 
    res.status(200).render('tour',{
        title:`${tour.name} Tour`,
        tour
    })
})


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
      title: 'Log into your account'
    });
  };

  exports.getForm = (req, res) => {
    res.status(200).render('signup', {
      title: 'form'
    });
  };

  exports.getAccount = (req, res) => {
    res.status(200).render('account', {
      title: 'Your account'
    });
  };
  

  exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });
  