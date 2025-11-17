const reviewModel=require("../models/review.js");
const listingModel=require("../models/listing.js");

// ================================== adding the review for specific listing ==========================================

const add_review=async (req,res)=>{
   let listing_result=await listingModel.findById(req.params.id); 
    //pehle to wo listing nikali 
   let new_review=new reviewModel(req.body.review);               //fir jo review submit hua tha post request ke through form se usko extract kiya uske name attribute m jo value hogi jese review thi isliye body.review yha use kiya  
   new_review.author=req.user._id;
   console.log(new_review.author);
   listing_result.reviews.push(new_review);                     //fir us review ko listing m add krdiya
//    the review is defined of array type in there schema that's why here we are using push method because 
// if we are adding something in array then we can use push method 

   await new_review.save();    //insertOne ya create manually nahi likh rahe,
// par new_review.save() khud internally insertOne hi chalata hai.
   await listing_result.save();
   console.log("review saved");
   req.flash("success","New Review Added Successfully!");
   res.redirect(`/listings/${req.params.id}`);
}

// ============= delete the specific review of the listing =================================================

const delete_review=async (req,res)=>{
 let {id,reviewId}=req.params;
 let listing_result=await listingModel.findById(id);
 listing_result.reviews.pull(reviewId);

 await listing_result.save();
//  yeh sirf Listing document ke array se reference hata dega.
// Review collection me actual document abhi bhi exist karega (orphaned record).
//  Agar tum chahte ho ki review ka data bhi database se poori tarah delete ho jaye,
// to tumhe reviewModel par bhi delete call karni padegi:

 await reviewModel.findByIdAndDelete(reviewId);  //in short if we don't write this then our review will not be deleted
//  from reviews collection , it will only delete from ref of array of listing's document and it will also not show in our listing in UI
 console.log("review deleted");
   req.flash("success", "Review Deleted Successfully!");
 res.redirect(`/listings/${id}`);

}

// (new_review.save() khud Review collection me insert karta hai).

// pull → Listing ke array se ObjectId remove karta hai
// (Review collection me document delete nahi hota).

// Isliye delete ke case me pull ke saath
// reviewModel.findByIdAndDelete(reviewId) zaroori hai
// taaki dono jagah clean-up ho.

// Add = 2 saves (child & parent)
// ➡️ Delete = 2 deletes (parent array se pull + child collection se delete)

// ======================== Exporting Functions ==========================================================

module.exports={add_review,delete_review};