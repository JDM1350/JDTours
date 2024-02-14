const catchAsync = require('../utils/catchAsync');
const Review=require('./../models/reviewModel');
const factory=require('./../controllers/handlerFactory')

const AppError=require('../utils/appError')

exports.getAllReviews=catchAsync(async(req,res,next)=>{

let filter={}
    if(req.params.tourId) filter={tour:req.params.tourId};
    
    const reviews=await Review.find(filter);

    res.status(200).json({
        status:'success',
        results:reviews.length,
        data:{
            reviews
        }
    })

})

// factory function - function that returns another function  or handler function ( delete , update, create )


/*exports.setToursUserId=(req,res,next)=>{
    if(!req.body.tour)req.body.tour=req.params.tourId;

    if(!req.body.user) req.body.user=req.user.id;

    next();
} */ 
exports.createReview=catchAsync(async (req,res,next)=>{

    //allow nested routes 
    if(!req.body.tour)req.body.tour=req.params.tourId;

    if(!req.body.user) req.body.user=req.user.id;

    const  newReview=await Review.create(req.body);


    res.status(201).json({
        status:'success',
        data:{
            review:newReview
        }
    })
})

exports.updateReview=catchAsync(async(req,res,next)=>{
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    
      if (!review) {
        return next(new AppError('No tour found with that ID', 404));
      }
    
      res.status(200).json({
        status: 'success',
        data: {
          review
        }
      });
});

exports.getReview=factory.getOne(Review);

exports.deleteReview=catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });;