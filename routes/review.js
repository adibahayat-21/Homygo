const express=require("express");
const router=express.Router({ mergeParams: true });

// mergeParams: true ka matlab:
// Jab hum nested routers use karte hain (parent-child relationship), tab child router ko parent router ke URL parameters chahiye hote hain.
// By default, child router apne parent ke params ko inherit nahi karta.
// mergeParams: true ke saath, child router parent ke params bhi access kar paata hai.

const wrapAsync=require("../utils/wrapAsync.js");

const {reviewSchema}=require("../schema.js");

const listingModel=require("../models/listing.js");
const reviewModel=require("../models/review.js");

const ExpressError=require("../utils/ExpressError.js");
const {isLoggedIn}=require("../middleware.js");

const reviewController=require("../controllers/review.js");

// ======================= defining validation (Joi) ====================================
// now we can pass this validation as a middleware in any routes


// this is Joi for reviews only =========================================

const validateReviews=(req,res,next)=>{
    let {error}=reviewSchema.validate({ review:req.body.review });
    if(error)
    {
        throw new ExpressError(400,error);
    }
    else
    {
        next();
    }
}

// ================================== adding the review for specific listing ==========================================

router.post("/",isLoggedIn,validateReviews,reviewController.add_review);



// ============= delete the specific review of the listing =================================================

router.delete("/:reviewId",wrapAsync(reviewController.delete_review));


module.exports=router;