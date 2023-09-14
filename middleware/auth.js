const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const { success, failure } = require("../util/common");


const usedTokens = new Set();

const isAuthorized = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
    }
    const jwt = req.headers.authorization.split(" ")[1];

  
    if (usedTokens.has(jwt)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Token has already been used"));
    }

    const user = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);

    usedTokens.add(jwt);

    // Separate decoding of the token
    // const decodedToken = jsonwebtoken.decode(jwt);

    
    const tokenExpirationInSeconds = user.exp - user.iat;
    setTimeout(() => {
      usedTokens.delete(jwt);
    }, tokenExpirationInSeconds * 1000);

    req.user = user;
    // req.decodedToken = decodedToken;

    next();
  } catch (error) {
    console.log(error);
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Token invalid"));
    }
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Token expired"));
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
  }
};

const isAdmin = (req, res, next) => {
    try {
     
      const { role } = req.user;
  
      if (role === 1) {
        next();
      } else {
        return res.status(HTTP_STATUS.FORBIDDEN).send(failure("Unauthorized access"));
      }
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
    }
  };



  
  module.exports = { isAuthorized, isAdmin };
  

