const listingModel=require("../models/listing.js");
const ExpressError=require("../utils/ExpressError.js");
const axios = require('axios');

async function getCoordinates(location,country)
{
    try{
        const response=await axios.get('https://nominatim.openstreetmap.org/search',{
            params:{
                q:`${location},${country}`,
                format:'json',
                limit:1
            }
        });
        if(response.data.length>0)
        {
            const{lat,lon}=response.data[0];
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
            }
        }
        else
            return null;
    }catch(error)
    {
        console.error("Geocoding failed:",error);
        return null;
    }
}


// ======== listings page (it shows all the listings) =======================================

const index=async (req,res)=>{
    const listingdata=await listingModel.find({});
    res.render("listings.ejs",{listingdata})
}

// ============= show new page to add new listings ===================================================

const new_page=(req,res)=>{
    res.render("new.ejs");
}


// ==================== to add the details of the form for new listing ===================

const add_new=async (req,res,next) => {
    let url_path=req.file.path;
    let filename=req.file.filename;
    console.log(url_path,"...",filename)
    // let result=listingSchema.validate(req.body);
    // console.log(result);

      // Validate request body with Joi ================== advanced approach (server side validation)
    // const { error } = listingSchema.validate({ listing: req.body });   //here it checks all the rules that is defined inside the object
    // if (error) {
    //     throw new ExpressError(400, error);
    // }

    // if we want to validate listing for different routes then instead of routing separately for each and every 
    // route we can define it separately and then pass it in the parameters

    const { title, description, price, location,country,category} = req.body.listing;
    const coordinates=await getCoordinates(location,country);
        if (!coordinates) {
        // Agar coordinates nahi milte, to error handle karen
        req.flash("error", "Geocoding failed for the given location.");
        return res.redirect("/listings/new");
    }

    // Manual validation (if not using Joi) (client side validation)===================

    // if (!title || title.trim() === "")
    //     throw new ExpressError(400, "Title needed");
    // // trim() ek JavaScript string method hai jo string ke start aur end se extra spaces (whitespaces) remove kar deta hai.
    // // if we are only checking like this if(!title) and not using trim method then it will only checks for the undefined, null value or the empty 
    // // string but if the user enters only spaces in the title then also it will be considered as a valid title but actually it is not a valid title
    // // so to improve this we use trim() method which removes the extra spaces from the start and end of the string 

    // if (!description || description.trim() === "")
    //     throw new ExpressError(400, "Description needed");
    // if (!location || location.trim() === "")
    //     throw new ExpressError(400, "Location needed");

    // const new_listing = new listingModel({
    //     title: title.trim(),
    //     description: description.trim(),
    //     price,
    //     location: location.trim(),
    //     image: image ? { url: image.url, filename: "listingimage" } : undefined
    // });

        const new_listing = new listingModel({
        title,
        description,
        price,
        location,
        country,
        category,
        image:  req.file ? { url: req.file.path, filename: req.file.filename } : undefined,
        owner:req.user._id
              });

    new_listing.geometry={
        type:"Point",
        coordinates: [coordinates.longitude, coordinates.latitude]
    }
    new_listing.owner=req.user._id;
    new_listing.image={url:url_path,filename};
    await new_listing.save();
    req.flash("success","New Listing Added Successfully!");
    res.redirect("/listings");
}

// ============== go to edit page =====================================================================

const edit_page=async(req,res)=>{
    let {id}=req.params;
    const listing=res.locals.listing;
    let original_imageUrl=listing.image.url;
    original_imageUrl=original_imageUrl.replace("/upload","/upload/h_300,w_250"); //it will lower the quality of current image while showing in the edit page because there is no such need of showing the image in high quality in the edit page
    res.render("edit.ejs",{listing,original_imageUrl});
}


// =============== update the details after editing it ===============================================


const update_listing = async (req, res) => {
    let { id } = req.params;
    const { title, description, price, location,country,category } = req.body.listing; // ✅ use req.body.listing
    const listing = await listingModel.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found for update");
    }


    // Update fields
    listing.title = title;
    listing.description = description;
    listing.price = price;
    listing.location = location;
    listing.country = country;
    listing.category=category;

    const coordinates = await getCoordinates(location, country);
     if (coordinates) {
        listing.geometry = {
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude]
        };
    }

    if(typeof req.file!=="undefined")
    {
    let url_path=req.file.path;
    let filename=req.file.filename;
    listing.image={url:url_path,filename};
    }

    await listing.save();

    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
};


// ============== delete the listing =======================================================================

const delete_listing=async (req,res)=>{
    let {id}=req.params;
    let deleted_listing=await listingModel.findByIdAndDelete(id);
// jese hi yeh delete call hoga wese hi humare listing.js ka post middleware (findOneAndDelete) bhi call hoga
    if(!deleted_listing){
        throw new ExpressError(404,"Listing not found for delete");
    }
    console.log(deleted_listing);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
}

// ================ Show Route (showing full detail of any individual listings) ============================

const show_listing=async (req,res)=>{    //listings page m har listings ke title clickable h to jb koi wha 
    let {id}=req.params;                   //click krta h to yeh request jati h jisse dusra page open hoga aur 

    const data= await listingModel.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");   //here the "reviews" is the variable name inside the schema when we are doing referencing (same for "owner")
    //wo listing individually open ho jaegi jisme uski puri detail dikhegi
    // listing.reviews stores only the IDs of the Review documents, not the full reviews themselves.
    // What populate("reviews") does
//     Mongoose looks at reviews (the array of ObjectIds), and fetches the full documents from the Review collection for those IDs.
// After populate, data.reviews becomes an array of full Review objects:

    if(!data){   //Agar given id se koi document nahi mila (data falsy hai),
        // throw new ExpressError(404,"Listing not found");  agar hum flash msg ka use krrhe h to flash msg ke liye hum redirect kr denge wapas usi page pe chle jaenge to fir is wale error ko throw krne ki zarurat nhi h 

        req.flash("error","Cannot find listing")
        res.redirect("/listings");
    }
    else
    {
        console.log(data);
        res.render("show.ejs",{data});
    }
}

// ====================== showing listings according to the category selected by the user ====================================

const categories=async(req,res)=>{
    try{
        const find_category=req.params.category; //url se category 
        const listingdata=await listingModel.find({category:find_category});  //yeh filter out kr degi to listings ke andar sirf whi listings aaengi jo us specific find_category (acc to variable) ki hongi
        res.render("category.ejs",{listingdata,find_category});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send("Server Error");
    }
}

// ===============================================================================================

const search_place=async(req,res)=>{
    try{
        const {search_place}=req.body;
        const listingdata=await listingModel.find({ $or: [
    { country: { $regex: `^${search_place}`, $options: "i" } },   // country starts with search_place
    { location: { $regex: `^${search_place}`, $options: "i" } }   // location starts with search_place
  ]
}); // case-insensitive search);
        res.render("findplace.ejs",{listingdata,search_place});
    }catch(err)
    {
        console.log(err);
        res.status(500).send("Server Error");
    }
}

// =================================== Exportings functions ==================================================================

module.exports={index,new_page,add_new,edit_page,update_listing,delete_listing,show_listing,categories,search_place};   

//agar yha bracket lga h to require krte time bhi bracket lgega agar yha nhi lgaya to wha bhi nhi lgana pdega