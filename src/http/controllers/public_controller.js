const { articleModel, categoryModel } = require('../../model/article');
const { handleHttpErrorResponse } = require('../../utils/error_handler');
const router = require('express').Router();
const pageElements = 10;
const { articleCoverUrl, authorImgUrl } = require('./../../config/enviroment');
const path = require('path');

router.get('/articles/:image_name', async (req, res) => {
  try {
    const { image_name } = req.params;
    const url = path.join(__dirname, './../../uploads/blogs/' + image_name);
    res.sendFile(url);
  } catch (error) {
    handleHttpErrorResponse(res, error, 404);
  }
});

router.get('/articles/userImage/:user_image_name', async (req, res) => {
  try {
    const { user_image_name } = req.params;
    const url = path.join(
      __dirname,
      './../../uploads/users/' + user_image_name
    );
    res.sendFile(url);
  } catch (error) {
    handleHttpErrorResponse(res, error, 404);
  }
});

/***
 *
 *
 * get articles
 * get article image file
 * search for users
 *
 *
 */

// localhost:3000/public/articles?page=0
/// get all articles and search
router.get('/articles', async (req, res) => {
  try {
    const { page, category, articleTitle } = req.query;

    var obj = {};
    if (articleTitle) obj.title = articleTitle;
    if (category) {
      const allCategories = await categoryModel.find({ name: category }).exec();
      obj.category = allCategories;
    }

    const countPages = Math.ceil(
      (await articleModel.find(obj).countDocuments().exec()) / pageElements
    );
    const articles = await articleModel
      .find(obj)
      .populate({ path: 'author', select: 'full_name email _id image' })
      .populate({ path: 'category', select: 'name _id' })
      .skip(pageElements * page)
      .limit(pageElements)
      .exec();

    const articlesList = articles.map((article) => {
      if (!article.author.image) article.author.image = '';
      return {
        ...article._doc,
        coverUrl: articleCoverUrl + article.cover.image_name,
        authorImageUrl: authorImgUrl + article.author.image.image_name,
      };
    });
    res.status(200).send({
      data: {
        articles: articlesList,
        pages: countPages,
      },
    });

    // title , cover , content author  category
  } catch (error) {
    handleHttpErrorResponse(res, error, 500);
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await categoryModel.find().exec();
    res.status(200).send({
      data: {
        categories: categories,
      },
    });

    // title , cover , content author  category
  } catch (error) {
    handleHttpErrorResponse(res, error, 500);
  }
});

/// get an article and increase the read counter in it
router.get('/articles/read_article/:_id', async (req, res) => {
  try {
    var ObjectId = require('mongodb').ObjectID;
    const { _id } = req.params;
    const articles = await articleModel
      .findById(ObjectId(_id))
      .populate({ path: 'author', select: 'full_name email _id image' })
      .populate({ path: 'category', select: 'name _id' })
      .exec();
    if (!articles)
      handleHttpErrorResponse(res, new Error('article not found'), 400);
    articles.read_count += 1;
    articles.save();
    if (!articles.author.image) articles.author.image = '';
    const articlesList = {
      ...articles._doc,
      coverUrl: articleCoverUrl + articles.cover.image_name,
      authorImageUrl: authorImgUrl + articles.author.image.image_name,
    };
    res.status(200).send({
      data: {
        articles: articlesList,
      },
    });

    // title , cover , content author  category
  } catch (error) {
    handleHttpErrorResponse(res, error, 500);
  }
});

module.exports = router;
