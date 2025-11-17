const Joi=require("joi");
// Har field ke liye aapko rule likhna padta hai (Joi.string().required(), Joi.number().min(0)).
// Lekin yeh ek hi jagah likhna padta hai (schema me), routes me baar-baar nahi.


// validation schema for listings======================

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string()
            .valid(
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
            )
            .required(),
        image: Joi.object({
            url: Joi.string().uri().allow("", null),
            filename: Joi.string().allow("", null)
        }).allow(null)
    }).required()
});

// validation schema for reviews==========================================================

module.exports.reviewSchema=Joi.object({
  review:Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comment:Joi.string().required(),
  }).required()
})