const userModel = require("../models/user.js");


// =================================================================================================================

const sign=(req, res) => {
    res.render("signup.ejs");
}
// =================================================================================================================

const log=(req, res) => {
    res.render("login.ejs");
}
// =================================================================================================================

const home=(req, res) => {
    res.render("home.ejs");
}

// =================================================================================================================

// yha hum authenticate ka kaam krenge, authenticate mtlb yeh hota h ki yeh check krna ki user pehle se database 
// mein exist krta h ya nhi to yeh kaam passport krke deta h 

const user_login=(req, res) => {
        // failureRedirect:'/login' iska mtlb yeh h ki agar user login krne se fail ho jata h to wo whi /login wale
        // page pr redirect kr dega 
        // res.send("Welcome to Homygo! You are Logged in");
        // jo app.js m authenticate wala method h wo apne aap check kr lega ki user ka password correct h ya nhi 
        req.flash("success", "Welcome to Homygo! You are Logged in");
        const redirectUrl = res.locals.redirect_url || "/home"; // default /home
        delete req.session.redirect_url; // clean session
        res.redirect(redirectUrl);
}   
// =================================================================================================================

const user_logout=(req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are Logged Out!");
        res.redirect("/login");
    });
}

// =================================================================================================================

const user_signup=async (req, res, next) => {
        try {
            let { username, email, password, confirmpassword } = req.body;
            if (password !== confirmpassword) {
                req.flash("error", "Passwords do not match!");
                return res.redirect("/signup");
            }
            const new_user = new userModel({ email, username });
            const registered_user = await userModel.register(new_user, password);
            console.log(registered_user);
            req.login(registered_user, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome to Homygo!");
                res.redirect("/home");
            });
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/signup");
        }
    }

//    Pehle kya ho raha tha
// Jab user login karta tha, tab hi session banta tha.
// Matlab req.user me user ka data aata tha.
// Tabhi logout button dikhta tha.
// Signup ke baad pehle:
// User database me create ho jata, lekin login nahi hota automatically.
// req.user undefined hota.
// Logout button nahi dikhta.
// Ab kya ho raha hai (req.login se)
// req.login(registered_user, (err)=>{
//     if(err) return next(err);
// });
// req.login() Passport ka function hai.
// Ye session create karta hai aur user ko automatically login kar deta hai.
// Ab signup ke turant baad bhi:
// req.user me user ka data aa jata.
// Logout button dikhta hai.
// User ko manually login karne ki zarurat nahi.

//    Try-catch ke fayde:
// Tum error ko gracefully handle kar sakte ho
// Flash message ya user-friendly message show kar sakte ho
// Server crash nahi hota
// register() error throw karta hai. Agar tum try-catch use nahi karte ho, aur error aata hai, toh:
// Server crash ho sakta hai ya
// Error browser me directly dikhega, jo achha UX nahi hai.


// ==================================== Exporting Functions ==============================================================

module.exports={sign,log,home,user_login,user_logout,user_signup};