const express = require("express");
const router = express.Router();
const userModel = require("../models/user.js");   // jo bhi routes ki files hoti h wha pr usi ke model ko import ya require krna hi padta h 
// jese reveiw  route file m review model ko reuire kiya aur listing route ke andar listing model ko define kiya 
// model mtlb wha pr schema+model dono define hote h 
// more description is given below:

const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

const userController=require("../controllers/user.js");


router.route("/signup")
.get(userController.sign)
.post(
    wrapAsync(userController.user_signup)
);

router.route("/login")
.get(userController.log)
.post(
    savedRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),userController.user_login
);

router.get("/home",userController.home);

router.get("/logout",userController.user_logout);

  
module.exports = router;

// ============================================ Description ================================================================

// Model ka Matlab

// Model file (user.js, listing.js, review.js, etc.) me do cheezein hoti hain:

// Schema → mongoose.Schema() se structure define karte hain
// (kaun-kaun se fields, unka type, validations, etc.)

// Model → mongoose.model("User", userSchema)
// (Schema ko MongoDB collection se connect karta hai)

// ⚡ Example (models/user.js):

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String
// });

// module.exports = mongoose.model('User', userSchema);

// 👉 Yehi file hi model ke naam se pehchani jaati hai.
// 2️⃣ Route File me require kyun karte hain
// Jab aap routes/user.js me user-related CRUD likhte ho,
// Aapko User model chahiye hota hai taaki DB pe query chal sake.
// Isliye route file me:
// const User = require("../models/user");
// Ab aap User.find(), User.create() etc. use kar sakte ho.
// ⚡ Same pattern:
// routes/review.js → const Review = require("../models/review");
// routes/listing.js → const Listing = require("../models/listing");

//======================= Difference between login and signup =============================

// Signup vs Login ka difference
// Signup:
// Jab user pehli baar register karta hai, wo apna account banata hai.
// Example: Email + Password dal ke "Create Account" click karta hai.
// Ye sirf user ko database me store karta hai.
// Login:
// Jab user apna account use karna chahta hai (already signup kar chuka hai), tab wo login karta hai.
// Login verify karta hai credentials aur user ko session deta hai.
// 💡 Note: Signup automatically login nahi karta. Matlab agar user signup ho gaya, tab bhi browser me wo logged in nahi hoga jab tak explicitly login na kare.
