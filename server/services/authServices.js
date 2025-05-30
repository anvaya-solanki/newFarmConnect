const sendMail = require("./mailServices");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Seller = require("../models/sellerSchema");
const User = require("../models/userSchema");
const Admin = require("../models/adminSchema"); // Make sure you have this file
const capitalizeFirstLetter = require("../helper/capitalizeFirstLetter");

const saveAndSendVerficationToken = async (id, type, origin) => {
  var salt = await bcrypt.genSalt(0);
  var verificationToken = await bcrypt.hash(id, salt);

  let Model = authModelSelector(type);

  const data = await Model.findById(id);

  data.verificationToken = verificationToken;
  data.verificationTokenExpiry = Date.now() + 3600000; // token valid for 1 hour

  const encodedToken = encodeURIComponent(verificationToken);

  await data.save();

  const verificationTokenLink = `${origin}/${type}/verify/${encodedToken}`;

  const mailRes = await sendMail(
    data.email,
    `Click <a href="${verificationTokenLink}">here</a> to verify your account`,
    `Verify your ${capitalizeFirstLetter(type)} account`
  );

  return mailRes;
};

const authModelSelector = (type, res) => {
  // Select the appropriate model based on account type.
  if (type === "seller") {
    return Seller;
  } else if (type === "user") {
    return User;
  } else if (type === "admin") {
    return Admin;
  } else {
    // If 'res' is provided, send a response; otherwise, throw an error.
    if (res) {
      res.status(400).send({ message: "Invalid type" });
      return;
    }
    throw new Error("Invalid account type");
  }
};

const generateAccessToken = (type, id) => {
  const access_token = jwt.sign({ [type]: id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return access_token;
};

module.exports = {
  saveAndSendVerficationToken,
  authModelSelector,
  generateAccessToken,
};
