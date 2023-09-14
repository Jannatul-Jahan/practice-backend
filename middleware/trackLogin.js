const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const { success, failure } = require("../util/common");

const loginAttempts = new Map();

const blockLoginAfterThreeFailures = (req, res, next) => {
  const { email } = req.body;

  if (loginAttempts.has(email)) {
    const attempts = loginAttempts.get(email);
    const now = Date.now();

    if (attempts.count >= 3 && now - attempts.timestamp <= 5 * 60 * 1000) {
      return res.status(429).json({ message: "Login blocked. Try again in 5 minutes." });
    }

    if (now - attempts.timestamp > 5 * 60 * 1000) {
      loginAttempts.delete(email);
    }
  }

  next();
};

module.exports = {blockLoginAfterThreeFailures};
