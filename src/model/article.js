/**
 *
 * model article
 *   cover
 *      title
 *      author
 *      content
 *      read-count
 *      category // model
 *
 * timestamps // created_at updated_at
 *
 *
 *  category
 *      name
 *
 */

const mongoose = require("mongoose");
const { Schema } = require("mongoose");
// store
const articleSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 4 },
    content: { type: String, required: true, minlength: 10 },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "Category",
      validate : {
          validator : async(category)=>{ 
             return categoryModel.findById(category).exec();
           },
           message : (props) => {return `${props.value} is not valid category`}
      }
    },
    cover: {
      type: {
        image_url: { type: String, required: true },
        image_name: { type: String, required: true },
      },
    },
    read_count: { type: Number, default: 0 },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const categorySchema = new Schema({
    name : {type : String , required : true , minlength : 4},
})


const categoryModel = mongoose.model('Category' , categorySchema);
const articleModel = mongoose.model('Article' , articleSchema);

module.exports = {
    categoryModel ,
    articleModel
}