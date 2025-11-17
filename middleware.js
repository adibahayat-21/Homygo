const listingModel = require("./models/listing"); 
const { listingSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

// ======================= defining validation (Joi) ====================================
// now we can pass this validation as a middleware in any routes


// this is Joi for Listings only=======================================================

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);

    if(error)
    {
        throw new ExpressError(400,error);
    }
    else
    {
        next();
    }
}

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Agar user POST request ke sath review add kar raha tha
    if (req.method === "POST" && req.originalUrl.includes("reviews")) {
      // usse listing detail page par redirect karo login ke baad
      const listingId = req.params.id;   // route params se id nikal lo
      req.session.redirect_url = `/listings/${listingId}`;
    } else {
      // baaki cases me normal originalUrl save karo
      req.session.redirect_url = req.originalUrl;
    }

    req.flash("error", "You Must be Logged in First!");
    return res.redirect("/login");
  }
  next();
};


const savedRedirectUrl=(req,res,next)=>{
   if(req.session.redirect_url)
    {
        res.locals.redirect_url=req.session.redirect_url;
    }
   next();
}

const isOwner=async (req,res,next)=>{
  let {id}=req.params;
    let listing=await listingModel.findById(id);
    if(!listing){
        throw new ExpressError(404,"Listing not found for edit");
    }
    let check_user=req.user;
    if(!check_user || !listing.owner ||  !listing.owner._id.equals(check_user._id))
    {
         req.flash("error","You are not the Owner of the Listing");
         return res.redirect(`/listings/${id}`);
    }
    res.locals.listing=listing;
    next();
};

module.exports={validateListing,isLoggedIn,savedRedirectUrl,isOwner};

// ========== NOTE =================
// session ke sath - req.session.......
// locals ke sath - res.locals........

// ============================================================================================================================

//                              Description about the above middleware 

// Ye middleware basically authentication guard ka kaam karta hai. Jab bhi koi route par is middleware ko lagaya 
// jata hai, tab ye har incoming request ko sabse pehle check karta hai ki user login hai ya nahi. 
// req.isAuthenticated() passport.js ka method hai jo yeh batata hai ki current session me koi authenticated
//  user hai ya nahi. Agar user login nahi hota to middleware req.flash ke through ek error message set karta 
// hai, jisse user ko pata chale ki us page par jane ke liye login karna zaruri hai, aur usko /login page par
//  redirect kar deta hai. Saath hi console.log(req.path, req.originalUrl) ka use karke wo yeh track karta hai 
// ki user originally kis page par jana chah raha tha, taaki login hone ke baad usi page par wapas bheja ja sake,
//  na ki hamesha home page par. Agar user already logged in hai to middleware simply next() call karke request 
// ko aage route handler tak pahucha deta hai. Is tarah se ye middleware har sensitive route ko unauthorized access 
// se bachata hai aur login ke baad user ko seamless experience provide karta hai.

//=========================================== Different syntax of exporting and importing the functions ===========================

// 1️⃣ Single export
// // middleware.js
// const isLoggedIn = (req, res, next) => { ... }
// module.exports = isLoggedIn;  // ✅ sirf ek function export
// Import karte waqt bina {} use karte ho:
// const isLoggedIn = require('../middleware.js');  // correct

// Multiple exports (object ke form me)
// // middleware.js
// const isLoggedIn = (req,res,next)=>{...};
// const isCheck = (req,res,next)=>{...};

// module.exports = { isLoggedIn, isCheck };  // ✅ object me multiple functions


// Import karte waqt destructuring {} use karte ho:

// const { isLoggedIn, isCheck } = require('./middleware.js');  // correct


// file.js
// function index() { console.log("Hello"); }
// module.exports = index;

// // anotherFile.js
// const index = require("./file");
// index(); // ✅ directly use karna hoga
