const mongoose = require('mongoose');
const { Schema } = require('mongoose');
require('mongoose-type-email');
const { userRoles } = require('./../enums/enums');

const userSchema = new Schema(
  {
    full_name: { type: String, required: true, minlength: 4, maxlength: 50 },
    email: { type: mongoose.SchemaTypes.Email, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: Number, default: userRoles.USER, min: 0, max: 1 },
    refresh_token: { type: String, default: null },
    image: {
      type: {
        image_url: { type: String },
        image_name: { type: String },
      },
    },
  },
  { timestamps: true }
);

const resetPasswordSchema = new Schema(
  {
    email: { type: mongoose.SchemaTypes.Email, required: true },
    code: { type: String, required: true },
    expires_in: { type: Date, required: true },
  },
  { timestamps: true }
);

const confirmEmailSchema = new Schema(
  {
    email: { type: mongoose.SchemaTypes.Email, required: true },
    code: { type: String, required: true },
    expires_in: { type: Date, required: true },
  },
  { timestamps: true }
);

const confirmEmailModel = mongoose.model('confirmEmail', confirmEmailSchema);
const resetPasswordModel = mongoose.model('ResetPassword', resetPasswordSchema);
const userModel = mongoose.model('User', userSchema);

module.exports = { userModel, resetPasswordModel, confirmEmailModel };
