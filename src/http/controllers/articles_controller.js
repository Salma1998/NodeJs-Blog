const router = require("express").Router();
const { handleHttpErrorResponse } = require("../../utils/error_handler");
const {
  verifyOwnerShip,
} = require("./../midllewares/article_ownership_middleware");
const isImage = require("is-image");
const { articleModel, categoryModel } = require("../../model/article");
const fs = require("fs");
const path = require("path");

const coverImageOutputPath = "./../../uploads/blogs/";
// location => images

/**
 *
 * create article
 *
 *
 *
 * // article owner ship
 * update article
 * get my articles
 * delete articles
 *
 *
 *
 *
 */

///
router.delete("/:article_id", verifyOwnerShip, async (req, res) => {
  try {
    const { article_id } = req.params;
    const deletedArticle = await articleModel
      .findByIdAndDelete(article_id)
      .exec();
    fs.unlinkSync(deletedArticle.cover.image_url);
    res.status(200).send({
      data: "article deleted",
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});
router.post("/", async (req, res) => {
  try {
    const { title, content, id_category } = req.body;
    const { user_id } = req;
    const { cover } = req.files;

    if (!cover || !isImage(cover.path))
      return handleHttpErrorResponse(res, new Error("cover is required"), 400);

    const article = await articleModel.create({
      title: title,
      author: user_id,
      content: content,
      category: id_category,
    });

    // path ,, fs
    const coverImage = "blog-" + article._id + path.extname(cover.path);
    const outputPath = path.join(__dirname, coverImageOutputPath);
    fs.renameSync(cover.path, outputPath + coverImage);
    // fs.copyFile(cover.path, outputPath + coverImage)
    article.cover = {
      image_name: coverImage,
      image_url: outputPath + coverImage,
    };
    await article.save();
    res.status(201).send({
      data: {
        article: article,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});
//update
router.patch("/:article_id", async (req, res) => {
  try {
    const { title, content, id_category } = req.body;
    const { cover } = req.files;
    const {article_id} = req.params
    const ObjectId = require('mongodb').ObjectID;
    const article = await articleModel.findOne(ObjectId(article_id));
    if (!article)
      return handleHttpErrorResponse(res, new Error("article not found"), 400);
    if (!title && !content && !id_category && !cover )
      return handleHttpErrorResponse(res, new Error("no data"), 400);
    if (cover && !isImage(cover.path))
      return handleHttpErrorResponse(res, new Error("cover must be an image"), 400);
    if (cover) {
      const coverImage = "blog-" + article._id + path.extname(cover.path);
      const outputPath = path.join(__dirname, coverImageOutputPath);
      fs.renameSync(cover.path, outputPath + coverImage);
      //fs.copyFile(cover.path, outputPath + coverImage)
      //fs.unlinkSync()
      //the new img replace the old img if there is one bc they have the same name
      article.cover = {
        image_name: coverImage,
        image_url: outputPath + coverImage,
      };
    }
    if (title) article.title = title
    if (content) article.content = content
    if (id_category) article.id_category = id_category

    await article.save();
    res.status(201).send({
      data: {
        article: article,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

router.post("/category", async (req, res) => {
  try {
    const { name } = req.body;
    res.status(201).send({
      data: {
        category: await categoryModel.create({
          name: name,
        }),
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

module.exports = router;
