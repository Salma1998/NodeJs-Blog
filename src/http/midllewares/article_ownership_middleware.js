const { articleModel } = require("./../../model/article");
const { handleHttpErrorResponse } = require("../../utils/error_handler");

// localhost:300/articles/:id_blog
// router  hassAccess => id user /

const verifyOwnerShip = async (req, res, next) => {
  try {
    const { user_id } = req;
    const article_id = req.params.article_id;
    const article = await articleModel
      .findOne({
        _id: article_id,
        author: user_id,
      })
      .exec();
    if (!article)
      return handleHttpErrorResponse(res, new Error("forbidant"), 403);
    next();
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
};

module.exports = {
    verifyOwnerShip
}