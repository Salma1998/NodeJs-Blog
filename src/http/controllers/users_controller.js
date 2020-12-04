const { userModel } = require("../../model/user");
const isImage = require("is-image");
const path = require("path");
const router = require("express").Router();
const { handleHttpErrorResponse } = require("./../../utils/error_handler");
const pageElements = 10;
const bcrypt = require("bcrypt");
const fs = require("fs");
const userImageOutputPath = "./../../uploads/users/";

/**
 *
 *
 * get user infromation done
 * update user fullName
 * get users
 *
 *
 *
 */

router.patch("/", async (req, res) => {
  try {
    const { user_id } = req;
    const { fullName } = req.body;
    if (!fullName) handleHttpErrorResponse(res, new Error("full name is required"), 400);

    await userModel
      .findByIdAndUpdate(user_id, { full_name: fullName })
      .exec();
    res.status(200).send({ data: `your name was update ${fullName}` });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

//update user img
router.patch("/add_profile_image", async (req, res) => {
  try {
    const { image } = req.files;
    const { user_id } = req
    var ObjectId = require('mongodb').ObjectID;
    const user = await userModel.findOne(ObjectId(user_id));
    if (!user)
      return handleHttpErrorResponse(res, new Error("user not found"), 400);
    if (!image || !isImage(image.path))
      return handleHttpErrorResponse(res, new Error("image is required"), 400);

    const userImage = "users-" + user._id + path.extname(image.path);
    const outputPath = path.join(__dirname, userImageOutputPath);
    fs.renameSync(image.path, outputPath + userImage);
    user.image = {
      image_name: userImage,
      image_url: outputPath + userImage,
    };
    await user.save();
    res.status(201).send({
      data: {
        user: user,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

//password

router.patch("/restPassword", async (req, res) => {
  try {
    const { user_id } = req;
    const { newPassword, oldPassword, newPasswordConfirmation } = req.body;
    if (!newPassword || !oldPassword || !newPasswordConfirmation)
      handleHttpErrorResponse(res, new Error("fill all data"), 400);
    if (newPassword.length < 8)
      handleHttpErrorResponse(res, new Error("password too short"), 400);
    if (newPassword != newPasswordConfirmation)
      handleHttpErrorResponse(res, new Error("password doesnt match"), 400);
    const user = await userModel.findById(user_id).exec();
    if (!bcrypt.compareSync(oldPassword, user.password))
      handleHttpErrorResponse(res, new Error("wrong password"), 400);

    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    await userModel.findByIdAndUpdate(user_id, { password: hashedPassword })
      .exec();
    const accessToken = generateToken(user._id, userRoles.USER);
    const refreshToken = await generateRefreshToken(user._id, userRoles.USER);

    res.status(200).send({
      data: `your password was updated `,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});
const generateRefreshToken = async (id_user, role) => {
  const refreshToken = jwt.sign(
    { id_user: id_user, role: role },
    refreshTokenSecret
  );
  await userModel
    .findByIdAndUpdate(id_user, { refresh_token: refreshToken })
    .exec();
  return refreshToken;
};

// {{server}}/users/all get all users with paginations
router.get("/all", async (req, res) => {
  try {
    // page == undefined
    const { page } = req.query;
    const countPages = Math.ceil(
      (await userModel.find({}).countDocuments().exec()) / pageElements
    );
    const usersList = await userModel
      .find({})
      .select("full_name email _id")
      .skip(page * pageElements)
      .limit(pageElements)
      .exec();
    res.status(200).send({
      data: {
        usersList: usersList,
        pages: countPages,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

// {{server}}/users/ => get user informations
router.get("/", async (req, res) => {
  try {
    // user_id
    const { user_id } = req;
    const user = await userModel
      .findById(user_id)
      .select("full_name email _id")
      .exec();
    res.status(200).send({
      data: {
        user: user,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

module.exports = router;
