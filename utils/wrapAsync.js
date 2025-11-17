// boiler plate code for wrapAsync

// iske liye tumhe ek alag file (wrapAsync.js) banani hoti hai jisme upar wala boilerplate likhoge.
// ✅ Fir har jagah try-catch likhne ke bajay bas wrapAsync use karna hoga.
// wrapAsync ka boilerplate fix hota hai — matlab uska syntax hamesha same rahega.

module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
}