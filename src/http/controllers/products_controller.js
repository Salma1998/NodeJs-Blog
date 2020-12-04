const router = require("express").Router();
const product = require("./../../model/product");
const { productModel } = require("./../../model/product");
const {
  checkProductOwnership,
} = require("./../midllewares/products_middlewars");
const { handleHttpErrorResponse } = require("./../../utils/error_handler");

/***
 *
 * create product
 * get products
 * delete product // creator
 *
 */

router.post("/", async (req, res) => {
  try {
    const { user_id } = req;
    const { name, price } = req.body;
    const createdProduct = await productModel.create({
      id_user: user_id,
      name: name,
      price: price,
    });
    res.status(201).send({
      data: { product: createdProduct },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});
router.delete("/:id_product", checkProductOwnership, async (req, res) => {
  try {
    const { id_product } = req.params;
    await productModel.findByIdAndDelete(id_product).exec();
    res.status(200).send({ data: "product was deleted" });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

module.exports = router;
