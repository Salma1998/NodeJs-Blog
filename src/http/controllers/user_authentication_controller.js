const { userModel, resetPasswordModel, confirmEmailModel } = require("../../model/user");
const { handleHttpErrorResponse } = require("../../utils/error_handler");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { userRoles } = require("../../enums/enums");
const cryptoRandomString = require('crypto-random-string');
const { sendMail } = require("./../../config/mail");
const { tokenSecret, refreshTokenSecret } = require("../../config/enviroment");
/***
 *
 * sign up
 * login
 * logout
 * refresh token
 *
 */

// user sign up
router.post("/sign-up", async (req, res) => {
  try {
    const { email, fullName, password, passwordConfirmation } = req.body;

    if (!(password && password.length >= 8 && password == passwordConfirmation))
      return handleHttpErrorResponse(
        res,
        new Error("password does not match the password confirmation"),
        400
      );

    // package  bcrypt(password , 10)

    // hash the password

    const hasedPassword = bcrypt.hashSync(password, 10);

    const createdUser = await userModel.create({
      email: email,
      full_name: fullName,
      password: hasedPassword,
    });

    // generate tokens
    const accessToken = generateToken(createdUser._id, userRoles.USER);
    const refreshToken = await generateRefreshToken(
      createdUser._id,
      userRoles.USER
    );

    res.status(201).send({
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });

    /// refresh token

    // token  createdUserId , role  jwt.sign("data" , secret)
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

// user sign up
router.post("/confirm-email-request", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return handleHttpErrorResponse(res, new Error("email is required"), 400)
    // generate code
    const code = cryptoRandomString(10);
    // collection to store code / email
    const date = new Date();
    await confirmEmailModel.create({
      email: email,
      code: code,
      expires_in: new Date().setHours(date.getHours() + 2),
    });
    await sendMail("fm_benlagha@gmail.com", email, code, "Confirm Email");
    res.status(201).send({
      data: "check your email",
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

//email code 
router.post("/confirm-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    const userConfirmEmail = await confirmEmailModel.find({
      email: email,
      code: code,
    })
    // check if combinission exist
    if (!userConfirmEmail)
      return handleHttpErrorResponse(res, new Error("code does not exist"), 404);

    // check if code is valid
    if (userConfirmEmail.expires_in < new Date()) {
      await userConfirmEmail.remove();
      return handleHttpErrorResponse(res, new Error("code expired"), 400);
    }
    //const user = await userModel.findOne({ email: email }).exec();
    //user.password = bcrypt.hashSync(password, 10);
    //await user.save();
    //await userConfirmEmail.remove();
    res.status(200).send({ data: "success" });
  } catch (error) {
    handleHttpErrorResponse(res, error, 500);
  }
});

// localhost:3000/auth/reset-password-request /// body email
/* router.post("/confirm-email-request", async (req, res) => {
  try {
    // generate code
    const code = Date.now().toString().slice(0, 5);
    // collection to store code / email
    const date = new Date();
    await confirmEmailModel.create({
      email: email,
      code: code,
      expires_in: new Date().setHours(date.getHours() + 2),
    });
    await sendMail("fm_benlagha@gmail.com", email, code, "Confirm Email");
    res.status(201).send({
      data: "check your email",
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});
 */// router.get("/", async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     jwt.verify(token, tokenSecret, (error, user) => {
//       if (error) return handleHttpErrorResponse(res, error, 401);
//       return res.status(200).send(user);
//     });
//   } catch (error) {
//     handleHttpErrorResponse(res, error, 400);
//   }
// });

/**
 *
 * smtp server
 * mail
 *
 * nodemailer
 *
 *
 * transporter
 * sendMail (from , to , title , conent);
 *
 * smtp
 * fakemail
 *
 *
 * reset password
 * verify mail
 *
 *
 *
 */

router.get("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, tokenSecret, async (error, user) => {
      if (error)
        return handleHttpErrorResponse(res, new Error("invalid token"), 401);
      await userModel
        .findByIdAndUpdate(user.id_user, { refresh_token: null })
        .exec();
      res.status(200).send({ data: "you are logged out" });
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await userModel
      .findOne({ refresh_token: refreshToken })
      .exec();

    if (!user)
      return handleHttpErrorResponse(
        res,
        new Error("invalid refresh token"),
        400
      );

    const accessToken = generateToken(user._id, userRoles.USER);

    res.status(200).send({
      data: {
        accessToken: accessToken,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email }).exec();

    // if does not exist
    if (!user)
      return handleHttpErrorResponse(res, new Error("user was not found"), 404);

    // compare password / password

    if (!bcrypt.compareSync(password, user.password)) {
      return handleHttpErrorResponse(
        res,
        new Error("email or password is wrong"),
        404
      );
    }

    const accessToken = generateToken(user._id, userRoles.USER);
    const refreshToken = await generateRefreshToken(user._id, userRoles.USER);

    res.status(201).send({
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

// code / email / password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body;
    // validate password
    if (!password || password.length < 8)
      return handleHttpErrorResponse(res, new Error("invalid password"), 400);

    const userResetPassword = await resetPasswordModel.find({
      email: email,
      code: code,
    });

    // check if combinission exist
    if (!userResetPassword)
      return handleHttpErrorResponse(
        res,
        new Error("code does not exist"),
        404
      );

    // check if code is valid
    if (userResetPassword.expires_in < new Date()) {
      await userResetPassword.remove();
      return handleHttpErrorResponse(res, new Error("code expired"), 400);
    }
    const user = await userModel.findOne({ email: email }).exec();
    user.password = bcrypt.hashSync(password, 10);
    await user.save();
    await userResetPassword.remove();
    res.status(200).send({ data: "success" });
  } catch (error) {
    handleHttpErrorResponse(res, error, 500);
  }
});

// localhost:3000/auth/reset-password-request /// body email
router.post("/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.find({ email: email }).exec();

    if (!user)
      return handleHttpErrorResponse(
        res,
        new Error("user does not exist"),
        404
      );
    // generate code
    const code = Date.now().toString().slice(0, 5);
    // collection to store code / email
    const date = new Date();
    await resetPasswordModel.create({
      email: email,
      code: code,
      expires_in: new Date().setHours(date.getHours() + 2),
    });
    await sendMail("fm_benlagha@gmail.com", email, code, "Reset Password");
    res.status(201).send({
      data: "check your email",
    });
  } catch (error) {
    handleHttpErrorResponse(res, error, 400);
  }
});

const generateToken = (id_user, role) => {
  return jwt.sign({ id_user: id_user, role: role }, tokenSecret, {
    expiresIn: "1800s",
  });
};

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

module.exports = router;
