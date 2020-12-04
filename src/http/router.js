const express = require("express");
const userAuthenicationController = require("./controllers/user_authentication_controller");
const productsController = require("./controllers/products_controller");
const usersController = require("./controllers/users_controller");
const { hasAccess } = require("./midllewares/users_middlewares");
const { handleHttpErrorResponse } = require("../utils/error_handler");
// our router module
const router = express.Router();

const articlesController = require("./controllers/articles_controller");
const { verifyOwnerShip } = require("./midllewares/article_ownership_middleware");
const publicController = require('./controllers/public_controller')
// routes
router.use("/auth", userAuthenicationController);
router.use("/products", hasAccess, productsController);
router.use("/users", hasAccess, usersController);
router.use("/articles", hasAccess,  articlesController);
router.use('/public' , publicController);

// default route
router.use("**", (req, res) => {
  return handleHttpErrorResponse(res, new Error("not found"), 404);
});
module.exports = router;
