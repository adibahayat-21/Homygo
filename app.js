// =========================== Required Packages ===============================================
if(process.env.NODE_ENV!="production")
{
require('dotenv').config()
}
 
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");       // ========== session-creation ======================
const MongoStore=require('connect-mongo');
const flash = require("connect-flash");
// =========================== Utilities & Custom Modules ======================================

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listingModel = require("./models/listing.js");
const reviewModel = require("./models/review.js");
const userModel = require("./models/user.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes=require("./routes/user.js");

// =========================== Database Connection =============================================

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}

// =========================== App Configuration ===============================================
// for static files
app.use(express.static("public"));

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

// ========================= Session Configuration =============================================
// session ko flash aur passport dono use krte h isliye session ko flash aur passport se pehle banana pdega
// jbki passport aur flash uper neeche ho skte h lekin jb req.user access krna ho mtlb user loggedin ya loggedout
// to uske liye hume pehle passport ko use krna pdega uske baad hi hum req.user ko access kr paenge

const store=MongoStore.create({
  mongoUrl:process.env.ATLASDB_URL,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("error in mongo session store",err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    //relate this expiry date from the situation when we are logged in insta aur linkedin and if we logged in once then we don't have to logged in again and again the cookie saves the data for this for given time and that given time is given from the expires just like here we did it.
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //it means that the cookie cannot be accessed or modified by client-side scripts, enhancing security against cross-site scripting (XSS) attacks.
  },
};

app.use(session(sessionOptions));

// =========================== Passport Configuration ==========================================
// for using passport it must be ensure that session must be created first
app.use(passport.initialize());
app.use(passport.session());

// above line means that a web application needs the ability to identify users as they browse from page to page.
// this series of requests and responses,each assosiated with the same user, is known as a session.
passport.use(new LocalStrategy(userModel.authenticate()));
// because humne email ko hi unique field ki tarah treat kiya h to username ki field m hum email ko use krrhe h 
// Yaha userModel.authenticate() (Passport-Local-Mongoose ka method)
// email aur password verify karta hai:
// DB se email search
// Password ko bcrypt hash se compare
// Match hua → success
// Nahi hua → fail

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// =================================== Using Flash =============================================
app.use(flash());

// =================================== middleware for locals(flash) =============================
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  res.locals.check_user=req.user;    //storing the information of current user
  next();
});


// Flash ke time par aapko passport.session() ki jarurat nahi thi → isliye koi dikkat nahi hui.
// req.user ke liye deserialization zaruri hai jo passport.session() karta hai → isliye ab order critical hai
// isliye yeh ensure krna zaruri h ki passport aur deseralize krne ke baad hi user ke login aur logout ka pta chlega 

// =============================== Just a demo for registering a fake user ===================================================

// from this request we will make a new user and then add that user to database
// app.get("/demouser",async(req,res)=>{
//    let fakeUser=new userModel({email:"abs@gmail.com",username:"abs_ha"
//    })

//    let registered_user = await userModel.register(fakeUser,"pass123")     //here we pass a password  pass123
//    res.send(registered_user);
//   })

// =========================== Routes Mounting ==================================================

app.use("/listings", listingRoutes); 
// yeh path m koi id nhi h jo uske routes wale module ko inherit krna pde isliye yha pr mergeParams:true use krne ki zarurat nhi h

app.use("/listings/:id/reviews", reviewRoutes); 
// yha hum wo path likhte h us wale module ke liye common path hoti h baaki saare routes ke liye
// yha pr dekho parent ki id yha pr likhi h lekin review routes m parent ki id nhi h to usko yha se inherhit krne ke liye
// mergeParams:true kiya

app.use("/",userRoutes);

// app.use(<mountPath>, <router>) ka pehla argument wo common prefix hota hai jo
// us router ke saare routes ke aage automatically jud jaata hai.

// ================================ Global Routes ===============================================

//=========== ROOT PAGE ==================================================================

app.get("/", (req, res) => {
  res.render("login.ejs");
});

// Jo route feature-specific ho (e.g., Listings, Reviews, Users),
//  uske liye separate router file.
// Jo route global ho (Home, About, Contact),
//  usse app.js me rakho.

// ================= About Page ==========================================================
app.get("/about", (req, res) => {
  res.render("about.ejs");
  //res.redirect ka use sirf ek route se doosre route par jaane ke liye hota hai, aur redirect same URL par nahi karna chahiye.
});

// ================= Contact Page ========================================================
app.get("/contacts", (req, res) => {
  res.render("contact.ejs");
});

// ============ If user accesses a page not inside our website ===========================
app.use((req, res, next) => {
  // if the user is accessing any page and if the page is not match with any routes that is written above then this route will be open and it will print the message that
  // is given here and also give this status code
  next(new ExpressError(404, "page not found"));
});

// =========================== Error Handling Middleware =================================
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err; //here default statuscode and message is giving
  res.status(statusCode).render("error.ejs", { message, err });
  // res.status(statusCode).send(message);
});

// =========================== Server Listening ==========================================
app.listen(8080, () => {
  console.log("server is listening to port:8080");
});

// ========================================================================================================================================

// 1st method using async await
// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new listingModel({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:12000,
//         location:"Goa",
//         country:"India",
//     })
//     let sampleListing1=new listingModel({
//         title:"My Garden",
//         description:"By the Beach",
//         price:12000,
//         location:"Goa",
//         country:"India",
//     })
//     await sampleListing.save();
//     await sampleListing1.save();
//     console.log(sampleListing);
//     res.send("successfull testing");
// })

// 2nd method using then and catch
// app.get("/testListing",(req,res)=>{
//     let sampleListing=new listingModel(
//         {
//         title:"My New Villa",
//         description:"By the Beach",
//         price:12000,
//         location:"Goa",
//         country:"India",
//         }
//     )
//     sampleListing.save()
//     .then((result)=>{
//         console.log(result);
//         res.send("listings");
//     }).catch((err)=>{
//         console.log(err);
//     })
// })
