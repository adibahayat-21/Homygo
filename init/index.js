const mongoose=require("mongoose");

const sampledata=require("./data.js");

const listingModel=require("../models/listing.js");   //index.js khud hi ek folder ke andar h isliye .. yeh use hoga

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main()
{
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

const initDB=async()=>{      
    await listingModel.deleteMany({  });   //firstly delete the data that is already present 
    sampledata.data=sampledata.data.map((a)=>({...a, owner:"68db92accf6d8199c382ffbb"}))  //yeh jo map hota h wo usi array m update nhi krta blki wo naya array bnata h aur given property ko fulfill krta h usme
    await listingModel.insertMany(sampledata.data);
    console.log("data was initialized");
}
initDB();

// ======================================================================================================================

// here ...a is spread operator iska role yeh h ki yeh krta h flattened na ki nested bnata h 
// { ...a, owner: "..." } me ye flattened ho jata:
// const obj = { ...a, owner: "68d7f1f50227272df6850a5e" };
// console.log(obj);
// // Output:
// // { title: 'House', price: 1000, owner: '68d7f1f50227272df6850a5e' }

// Agar aap sirf {a, owner: "..."} likhte to naya object me a ke andar hi original object aa jata:
// const obj = { a, owner: "68d7f1f50227272df6850a5e" };
// console.log(obj);
// Output:
// { a: { title: 'House', price: 1000 }, owner: '68d7f1f50227272df6850a5e' }

// ====================================================================================================================

// MERN / backend projects me aksar ek seeding script banayi jati hai jisme:
// Database Connection
// mongoose.connect(...) se aap apni MongoDB se connect ho rahe ho.
// Purana Data Clear Karna
// listingModel.deleteMany({}) ka matlab hai ki pehle se jo bhi listings DB me hain wo saari delete ho jaye.
// Ye isliye hota hai taaki har baar fresh dummy/test data insert ho aur duplicate na bane.
// Sample Data Insert Karna
// insertMany(sampledata.data) ka use karke aap data.js me jo dummy/sample listings banayi hain wo database me daal dete ho.
// Testing & Development ke liye
// Iska main kaam hai ki development ke time pe aapke paas hamesha kuch data ready rahe jisse aap frontend/CRUD operations test kar sako.
// Production me jaane ke baad aap is file ka use nahi karte, tab real user data database me aata hai.


// Aapne listingModel banaya (schema + model).

// Aapke paas ek data.js hai jisme kuch dummy listings hain (title, price, location, etc.).

// Ye seeding script run karte hi DB me automatically wo saara sample data aa jayega.

// Ab aap frontend pe jaake listings ko fetch karke easily dekh aur test kar sakte ho.


// 1. Separation of Concerns (Code Cleanliness)

// app.js ka kaam hai server ko start karna, routes set karna, middleware use karna, etc.

// Database ko dummy data se seed karna ek alag responsibility hai, isliye isko alag rakha jata hai.

// Agar sab kuch app.js me daal denge to file cluttered aur confusing ho jayegi.

// 2. Ek hi baar chalana hota hai

// Seeding code (initDB()) sirf development ke start me ek–do baar run karna hota hai.

// Agar isko app.js me daal diya to har baar server start karte hi data delete + reinsert ho jayega ❌

// Matlab aapka DB hamesha reset ho jayega, jo galat hoga.

// node index.js   # sirf ek baar seeding ke liye
// node app.js     # normal server run karne ke liye

// node index.js   # sirf ek baar seeding ke liye
// node app.js     # normal server run karne ke liye
