const express = require("express");
const routes = express();
const AuthController = require("../controller/AuthController");
const { authValidator } = require("../middleware/validation");
// const { blockLoginAfterThreeFailures } = require("../middleware/trackLogin");

routes.post("/sign-up", authValidator.signup, AuthController.signup);
routes.post("/login", authValidator.login, AuthController.login)


module.exports = routes;
