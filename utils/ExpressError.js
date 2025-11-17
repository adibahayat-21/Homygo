// this is a boiler plate code for Custom error which will be fixed
// this structure will always be same whenever we need to make a custom error

class ExpressError extends Error{
    constructor (statusCode, message)
    {
        super();
        this.statusCode=statusCode;
        this.message=message;
    }
}
module.exports=ExpressError;