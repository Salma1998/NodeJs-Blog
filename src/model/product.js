const mongoose = require("mongoose");
const { Schema } = require("mongoose");

/***
 *
 *
 * delete product //
 *
 * const productStatus = {
 *  ACTIVE :1 ,
 *  ARCHIVED : 0 ,
 * }
 *
 * // archivage
 * // status  => 0 => archived 1 => exists
 *
 *
 *
 * delete => update product.status = productStatus.ARCHIVED product.save()
 *
 *
 *
 * HOME WORK
 *
 * /// status// middlewares archived or not
 *
 * get products => status = active /// => ex productexist
 *
 */

const productSchema = new Schema(
  {
    //  attribute name + is required  , new String()
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 100,
      validate: {
        validator: (name) => {
          return /([a-zA-Z]{3,30}\s*)+/.test(name);
          // regexp
        },
        message: (props) => {
          return `name ${props.value} is in valid`;
        },
      },
    },
    price: { type: Number, required: true, min: 0 },
    id_user : {type : mongoose.SchemaTypes.ObjectId  , required : true }
  },
  { timestamps: true, validateBeforeSave: true }
);

const productModel = mongoose.model("Product", productSchema);

module.exports = {
  productModel,
};
