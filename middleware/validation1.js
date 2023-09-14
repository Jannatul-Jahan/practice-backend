const { success, failure } = require("../util/common");

const updateValidation = (req, res, next)=>{
    const { price, stock, author} =req.body;
    const errors = {};

    if(!price || price ===""){
        errors.price = "price is not provided";
    }
    if(!stock || stock ===""){
        errors.stock = "stock is not provided";
    }
    if(!author || author ===""){
        errors.author = "author is not provided";
    }
    if(Object.keys(errors).length>0){
        return res.status(422).send(failure("unprocessable entity", errors))
    }
    next();
};

module.exports = updateValidation;