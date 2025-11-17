// Routes ko alag files (modular approach)
// here is the route for listings (all things related to listings)

const express=require("express");
const router=express.Router();   //this is used for making modules of the routes
const wrapAsync=require("../utils/wrapAsync.js");

const {listingSchema}=require("../schema.js");
const listingModel=require("../models/listing.js");

const ExpressError=require("../utils/ExpressError.js");

const {validateListing,isLoggedIn, isOwner}=require("../middleware.js");

const listingController=require("../controllers/listing.js");

const multer  = require('multer')
const {storage}=require("../cloudConfig.js");   //Agar tumhe sirf image upload karni hai → sirf storage import kaafi hai. Agar tumhe Cloudinary API bhi use karni hai (delete, transform etc.) → cloudinary bhi import karo.
const upload = multer({ storage: storage })

const apiKey = process.env.MAP_TOKEN;

// ======================================== Routes =======================================

// we use router.route for combining all the routes which are going to same path 

// ======================================= for this path("/") =================================

// ======== listings page (it shows all the listings) =======================================
// ==================== to add the details of the form for new listing ===================

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'),validateListing,wrapAsync(listingController.add_new));
// here multer middleware is used to upload the image to cloudinary (upload.single('image') is done by multer)


// wrapAsync aur error handling middleware ko sath m use krte h 
// wrapAsync ek helper function hai jo async routes ke errors ko automatically next(err) me pass kar deta hai.

// wrapAsync ek helper hai jo har async route ke liye yeh repetitive try...catch kaam automatically kar deta hai:



// ============= show new page to add new listings ===================================================

router.get("/new",isLoggedIn,listingController.new_page)

// =================================== for this path ("/:category") ===========================

router.get("/category/:category",listingController.categories);

// Ek hi HTTP method (GET, POST, PUT, DELETE) ho ek path ke liye → direct use karo:
// router.get("/listings/:category", listingController.categories);

// Yahan :category URL se category ka naam le raha hai.
// Example URLs:
// /listings/Rooms → category = "Rooms"
// /listings/Beach → category = "Beach"
// /listings/Castles → category = "Castles"

//=========================================================================================

router.post("/place",listingController.search_place);

// ============== go to edit page =====================================================================


router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.edit_page))

// ======================================= for this path("/:id") =================================

// ================ Show Route (showing full detail of any individual listings) ============================
// =============== update the details after editing it ===============================================
// ============== delete the listing =======================================================================

router.route("/:id")
.get(wrapAsync(listingController.show_listing))
.put(isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.update_listing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.delete_listing))

// Ek path ke liye multiple methods ho (GET + POST + PUT + DELETE) → tab .route() chain use karte ho:

//================ Exporting Router ===============================================

module.exports=router;


//===================== description about this file ==============================

// listing.js ek Router file hai:
// Sirf listings se related routes rakhta hai.
// Example:
// /listings → sab listings dikhana
// /listings/new → naya listing form
// /listings/:id → ek listing ka detail
// /listings/:id/edit → edit form
// /listings/:id/delete → delete
// Yahan hum router banate h aur mini-app ki tarah use karte ho:

// Phir app.js me hum ise mount karte h:
// app.use("/listings", listingRouter);

// Mounting ka Fayda
// Mount karne ka matlab hai:
// Jab user /listings pe jaye,
// listing.js ke saare routes activate ho jayein.
// Agar kal ko tum reviews ya users ke liye alag module banao,
// to unke routes bhi alag files me manageable rahenge.
// Yeh Modular Approach hai.