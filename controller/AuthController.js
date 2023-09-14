const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const AuthModel = require("../model/Auth");
const UserModel = require("../model/User");
const ProductModel = require("../model/Product");
const HTTP_STATUS = require("../constants/statusCodes");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
// const blockLoginAfterThreeFailures = require("../middleware/trackLogin");


class AuthController{ 
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const auth = await AuthModel.findOne({ email })
         .populate("user")
  
      if (!auth) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Invalid email or password"));
      }
  
      const checkPassword = await bcrypt.compare(password, auth.password);
      
      if (!checkPassword) {
        return res.status(HTTP_STATUS.OK).send(failure("Invalid ctrdentials"));
      }
  
      const responseAuth = auth.toObject();
      delete responseAuth.password;
      delete responseAuth._id;

      const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
        expiresIn: "1h"});

      responseAuth.token = jwt;
      return res.status(HTTP_STATUS.OK).send(success("Login successful", responseAuth));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
    
   
    async signup(req, res) {
        try {
          const validation = validationResult(req).array();
          if (validation.length > 0) {
            return res
              .status(HTTP_STATUS.BAD_REQUEST)
              .send(failure("Failed to add the user", validation));
          }
      
          const { name, email, password, address } = req.body;
          const hashedPassword = await bcrypt.hash(password, 10);
      
          const newUser = new UserModel({
            name: name,
            email: email,
            address: address,
          });
      
          await newUser.save();
      
          const authData = new AuthModel({
            email: email,
            password: hashedPassword,
            user: newUser._id, 
          });
      
          await authData.save();
      
          return res.status(HTTP_STATUS.OK).send(success("User registered successfully"));
        } catch (error) {
          return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .send(failure("Internal server error"));
        }
      }
      
}

module.exports = new AuthController;