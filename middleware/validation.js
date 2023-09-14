const { body, query, param } = require("express-validator");

const userValidator = {
  create: [
    body("name")
      .exists()
      .withMessage("Name was not provided")
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),
    body("email")
      .exists()
      .withMessage("Email was not provided")
      .bail()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .isEmail()
      .withMessage("Email format is incorrect"),
  ],
};


const cartValidator = {
  addItemToCart: [
    body("user")
      .exists()
      .withMessage("UserId was not provided"),
    body("products")
      .exists()
      .withMessage("Product was not provided"),
  ],
};



const authValidator = {
  signup:[
    body("email")
      .exists()
      .withMessage("Email must be provided")
      .bail()
      .isEmail()
      .withMessage("Email must be in valid format"),
    body("password")
      .exists()
      .withMessage("Password must be provided")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail().isStrongPassword({minLength : 8, minLowercase: 1, minUppercase: 1, minSymbols:1, minNumbers:1})
      .withMessage("the password need to contain at least 8 characters, with a minimum of 1 lower case, 1 upper case, 1 number, and 1 symbol."),
    body("name")
      .exists()
      .withMessage("Name was not provided")
      .bail()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isString()
      .withMessage("Name must be a string")
      .isLength({ max: 30 })
      .withMessage("Name cannot be more than 30 characters"),

  ],
  login:[
    body("email")
    .exists()
    .withMessage("Email must be provided")
    .bail()
    .isEmail()
    .withMessage("Email must be in valid format"),
    body("password")
    .exists()
    .withMessage("Password must be provided")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail().isStrongPassword({minLength : 8, minLowercase: 1, minUppercase: 1, minSymbols:1, minNumbers:1}),

  ],
};



module.exports = { userValidator, authValidator, cartValidator };
