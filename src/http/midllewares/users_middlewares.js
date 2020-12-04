const { handleHttpErrorResponse } = require("./../../utils/error_handler");
const jwt = require("jsonwebtoken");
const { tokenSecret } = require("./../../config/enviroment");

const hasAccess = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, tokenSecret, async (error, user) => {
      if (error)
        return handleHttpErrorResponse(res, new Error("invalid token"), 401);
      req.user_id = user.id_user;
      return next();
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
};

module.exports = { hasAccess };
