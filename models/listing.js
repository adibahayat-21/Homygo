// here we design the structure and model of listings

// One-to-Many Relation ka Matlab
// One Post → Many Reviews
// Ek post ke andar multiple reviews hote hain aur har post ka sirf ek hi owner h 
// Isliye:
// Parent = Post
// Child = Review

const mongoose=require("mongoose");

const reviewSchema=require("./review");

const Schema=mongoose.Schema;

const listingSchema=new Schema({         //designing schema (structure)

    title:{type:String, required:true},

    description:String,

    // image:{
    //     filename:String, 
    //     url:{ type:String, 
    //     default:"https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //     set: (v)=>v===""?"https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v} 
    // // This ensures that if someone tries to save an empty string "", it will replace it with the default URL.
    // },

    image:{
        url:String,
        filename:String,
    },
    
    price:Number,

    location:String,

    country:String,

    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],   // yaha [Number] ka matlab hai "array of numbers"
            required: true
        }
    },
    
    
 category: {
    type: String,
    enum: [
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Castles",
        "Pools",
        "Arctic",
        "Farmhouse",
        "Nature",
        "Beach",
        "Camping",
        "Adventure",
        "Mountains",
        "Urban",
        "Boating",
    ],
    default:"Trending",
    required: true
},

    // One-to-Many relation: One Listing → Many Reviews
    // listings => parent, reviews => childrens

    reviews:[{type:Schema.Types.ObjectId,ref:"Review"}],   //here we use ref with the name of the model which is Review and this variable name reviews will be anything we can give any variable name here
    //now we added the review schema inside the listing schema
    // Yaha tumne Review (child) ke ObjectId ko Listing/Post (parent) ke andar embed kiya hai.
// Matlab Parent schema ke andar child ka reference store kar rahe ho.
// Ye One-to-Many (Approach 2) hai —
// jaha parent ke andar ek array of ObjectId (references) store hote hain jo child collection ko point karte hain.

    owner:{type:Schema.Types.ObjectId, ref:"User"}
})

// ref:"Review" ka matlab hai:
// Listing document me reviews array me sirf IDs rakhe gaye hain.
// Jab tum .populate("reviews") call karte ho,
// tab Mongoose in IDs ko use karke Review collection se
// poore documents fetch karta hai.


// Agar ek field me multiple references chahiye → array [] use karo.
// Agar sirf single reference chahiye → object {} hi use karo.
// mtlb dekho ek listings ke multiple reviews ho skte h isliye usko denote krne ke liye [] yeh use kiya kyuki yeh
// array ke liye use hota h 
// lekin dekho owner m humne [] iska use nhi kiyuki ek listing ka sirf ek hi owner ho skta h multiple owner 
// nhi ho skte to uske liye humne [] yeh use krne ki zarurat nhi h



// ================= post middleware used for deleted the reviews from Review collection of the deleted listing ===================================

// ab tum Listing.findOneAndDelete(id) call karte ho, Listing document delete ho jata hai.
// post("findOneAndDelete") middleware ye kaam karta hai delete hone ke baad:
// Deleted Listing document milta hai as listing parameter
// Uske reviews array se Review documents delete karte hain

listingSchema.post("findOneAndDelete",async(l)=>{
    if(l)
        await reviewSchema.deleteMany({_id:{$in:l.reviews}})
})
// yha pr l ek variable h uski jagah kuch aur bhi naam rkh skte h lekin 
// .reviews ki jagah hum kuch aur nhi use kr skte kyuki wo Review model ka plural form h

// How Mongoose knows when to run it
// Mongoose models (Listing) ke andar methods hoti hain, jaise:
// findByIdAndDelete(id)
// findOneAndDelete(filter)
// Jab tum Listing.findByIdAndDelete(id) call karte ho:
// const deletedListing = await Listing.findByIdAndDelete(id);
// Mongoose internally findOneAndDelete operation perform karta hai.
// Kyunki tumne schema me post("findOneAndDelete") middleware define kiya hai,
// Mongoose automatically us middleware ko call kar deta hai after the document is deleted.



const listingModel=mongoose.model("Listing",listingSchema);     //defining model (collections)

module.exports=listingModel;


// if we used approach 1 then there is a issue and the issue is :
//  reviews: [
//     { user: String, comment: String, rating: Number }
//   ]
// Isme child alag collection me nahi hota, directly parent ke andar array of subdocuments hota hai.
// Simple but limited (large data hone par parent ka document heavy ho jata hai).


// if we used approach 2 then
//   reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
// Yaha Parent (Post) ke andar sirf Review ke ids store hoti hain.
// Actual review ek alag Review collection me hota hai.
// Jab chahiye, .populate("reviews") se full details le lete ho.
// Ye scalable aur recommended hai jab child records zyada hote hain.


// Jab hum ek collection ke document ko dusri collection ke sath link karna chahte hain
// (jaise Post aur Review),
// tab hume reference store karna hota hai.

// Reference always _id hota hai, aur _id ka data type by default ObjectId hota hai.

// Isliye schema me likhte hain:
// reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
// Schema.Types.ObjectId → yeh mongoose ko batata hai ki is field me ObjectId type ka data (id of another document) store hoga.
// ref: "Review" → mongoose ko batata hai ki yeh ObjectId Review model/collection ko reference karta hai.