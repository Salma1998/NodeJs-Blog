const { productModel } = require("./../../model/product");
const { handleHttpErrorResponse } = require("./../../utils/error_handler");

const checkProductExistance = async (req, res, next) => {
  try {
    const { id_product } = req.params;
    const product = await productModel.findById(id_product);
    if (!product)
      return handleHttpErrorResponse(
        res,
        new Error(`product with the id   : ${id_product} was not found`),
        404
      );
    req.product = product;
    next();
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
};

const checkProductOwnership = async (req, res, next) => {
  try {
    const { id_product } = req.params;
    const { user_id } = req;
    const product = await productModel.findById(id_product).exec();
    if (!product)
      return handleHttpErrorResponse(
        res,
        new Error("product was not found"),
        404
      );
    if (product.id_user != user_id)
      return handleHttpErrorResponse(res, new Error("forbidant"), 403);
    return next();
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
};

module.exports = { checkProductExistance, checkProductOwnership };
