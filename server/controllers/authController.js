// const capitalizeFirstLetter = require("../helper/capitalizeFirstLetter");
// const {
//   saveAndSendVerficationToken,
//   authModelSelector,
//   generateAccessToken,
// } = require("../services/authServices");
// const { setCookie } = require("../services/cookieServices");
// const bcrypt = require("bcryptjs");

// // SignUp
// const signup = async (req, res) => {
//   let type = req.params.type.toLowerCase();
//   try {
//     let Model = authModelSelector(type, res);

//     let data = Model(req.body);

//     let salt = await bcrypt.genSalt(8);
//     data.password = await bcrypt.hash(data.password, salt);

//     let result = await data.save();

//     const isMailSentSuccessful = await saveAndSendVerficationToken(
//       result._id.toString(),
//       type,
//       req.get("Origin")
//     );
//     if (isMailSentSuccessful) {
//       return res.status(200).send({
//         message: `${capitalizeFirstLetter(
//           type
//         )} account created, please verify your email to login`,
//       });
//     } else {
//       return res.status(200).send({
//         message: `${capitalizeFirstLetter(
//           type
//         )} account created. However, we couldn't send the verification link. You can verify your account during login.`,
//       });
//     }
//   } catch (error) {
//     if (error.code === 11000) {
//       if (error.keyPattern.email || error.keyPattern.contact) {
//         return res.status(400).send({
//           message: `${capitalizeFirstLetter(
//             type
//           )} with this email or phone number already exists`,
//         });
//       } else if (type === "seller" && error.keyPattern.brandName) {
//         return res
//           .status(409)
//           .send({ message: "This brand name already exists" });
//       }
//     }

//     res.status(500).send({ message: "Something went wrong!" });
//     console.log(error);
//   }
// };

// // Login
// const login = async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     let type = req.params.type.toLowerCase();

//     let Model = authModelSelector(type, res);

//     let data = await Model.findOne({ email }).select(
//       `password isVerified ${type === "seller" && "brandName"}`
//     );

//     if (!data) {
//       res.status(404);
//       return res.send({ message: `${capitalizeFirstLetter(type)} not found` });
//     }

//     let isPasswordMatched = await bcrypt.compare(password, data.password);

//     if (!isPasswordMatched) {
//       return res.status(401).send({ message: "Incorrect password" });
//     } else {
//       if (!data.isVerified) {
//         const isMailSentSuccessful = await saveAndSendVerficationToken(
//           data._id.toString(),
//           type,
//           req.get("Origin")
//         );
//         if (!isMailSentSuccessful) {
//           return res.status(200).send({
//             message: `${capitalizeFirstLetter(
//               type
//             )} account not verified. We couldn't send the email. Please try again later. If this issue persists, contact the developer.`,
//           });
//         } else {
//           return res.status(200).send({
//             message: `${capitalizeFirstLetter(
//               type
//             )} account not verified. We've sent you an email, please verify your email to login`,
//           });
//         }
//       }

//       // setCookie(
//       //   res,
//       //   `${type}_access_token`,
//       //   generateAccessToken(type, data._id.toString())
//       // );

//       // if (type === "seller") {
//       //   setCookie(res, "brandName", data.brandName);
//       // }

//       return res.status(200).send({
//         message: `${capitalizeFirstLetter(type)} login successful`,
//         cookies: {
//           [`${type}_access_token`]: generateAccessToken(
//             type,
//             data._id.toString()
//           ),
//           ...(type === "seller" && { brandName: data.brandName }),
//         },
//       });
//     }
//   } catch (error) {
//     res.status(500).send({ message: "Something went wrong!" });
//     console.log(error);
//   }
// };

// const verifyToken = async (req, res) => {
//   try {
//     const verificationToken = decodeURIComponent(req.params.token).toString();
//     const type = req.params.type.toLowerCase();

//     let Model = authModelSelector(type, res);

//     if (!Model) return res.status(400).send({ message: "Invalid type" });

//     const data = await Model.findOne({
//       verificationToken: verificationToken,
//     }).select(
//       `isVerified verificationTokenExpiry ${type === "seller" && "brandName"}`
//     );

//     if (data?.isVerified)
//       return res.status(409).send({ message: "Account already verified" });

//     if (!data) {
//       return res.status(404).send({ message: "Invalid token" });
//     }

//     const isTokenExpired = data.verificationTokenExpiry < Date.now();
//     if (isTokenExpired) {
//       return res.status(403).send({ message: "Token expired" });
//     }

//     await Model.findByIdAndUpdate(data._id, { isVerified: true });

//     // setCookie(
//     //   res,
//     //   `${type}_access_token`,
//     //   generateAccessToken(type, data._id.toString())
//     // );

//     // if (type === "seller") {
//     //   setCookie(res, "brandName", data.brandName);
//     // }

//     return res.status(200).send({
//       message: "Account verified successfully",
//       cookies: {
//         [`${type}_access_token`]: generateAccessToken(
//           type,
//           data._id.toString()
//         ),
//         ...(type === "seller" && { brandName: data.brandName }),
//       },
//     });
//   } catch (error) {
//     res.status(500).send({ message: "Something went wrong!" });
//     console.log(error);
//   }
// };

// module.exports = {
//   verifyToken,
//   login,
//   signup,
// };
const capitalizeFirstLetter = require("../helper/capitalizeFirstLetter");
const {
  saveAndSendVerficationToken,
  authModelSelector,
  generateAccessToken,
} = require("../services/authServices");
const { setCookie } = require("../services/cookieServices");
const bcrypt = require("bcryptjs");

// Allowed account types
const allowedTypes = ["user", "seller", "admin"];

// SignUp
const signup = async (req, res) => {
  let type = req.params.type.toLowerCase();

  // Validate type
  if (!allowedTypes.includes(type)) {
    return res.status(400).send({ message: "Invalid account type" });
  }

  try {
    let Model = authModelSelector(type, res);

    let data = new Model(req.body);

    let salt = await bcrypt.genSalt(8);
    data.password = await bcrypt.hash(data.password, salt);

    let result = await data.save();

    const isMailSentSuccessful = await saveAndSendVerficationToken(
      result._id.toString(),
      type,
      req.get("Origin")
    );
    if (isMailSentSuccessful) {
      return res.status(200).send({
        message: `${capitalizeFirstLetter(
          type
        )} account created, please verify your email to login`,
      });
    } else {
      return res.status(200).send({
        message: `${capitalizeFirstLetter(
          type
        )} account created. However, we couldn't send the verification link. You can verify your account during login.`,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email || error.keyPattern.contact) {
        return res.status(400).send({
          message: `${capitalizeFirstLetter(
            type
          )} with this email or phone number already exists`,
        });
      } else if (type === "seller" && error.keyPattern.brandName) {
        return res
          .status(409)
          .send({ message: "This brand name already exists" });
      }
    }

    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

// Login
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let type = req.params.type.toLowerCase();

    // Validate type
    if (!allowedTypes.includes(type)) {
      return res.status(400).send({ message: "Invalid account type" });
    }

    let Model = authModelSelector(type, res);

    let fieldsToSelect = "password isVerified";
    if (type === "seller") {
      fieldsToSelect += " brandName";
    }
    let data = await Model.findOne({ email }).select(fieldsToSelect);

    if (!data) {
      res.status(404);
      return res.send({ message: `${capitalizeFirstLetter(type)} not found` });
    }

    let isPasswordMatched = await bcrypt.compare(password, data.password);

    if (!isPasswordMatched) {
      return res.status(401).send({ message: "Incorrect password" });
    } else {
      if (!data.isVerified) {
        const isMailSentSuccessful = await saveAndSendVerficationToken(
          data._id.toString(),
          type,
          req.get("Origin")
        );
        if (!isMailSentSuccessful) {
          return res.status(200).send({
            message: `${capitalizeFirstLetter(
              type
            )} account not verified. We couldn't send the email. Please try again later. If this issue persists, contact the developer.`,
          });
        } else {
          return res.status(200).send({
            message: `${capitalizeFirstLetter(
              type
            )} account not verified. We've sent you an email, please verify your email to login`,
          });
        }
      }

      // Generate the access token and return it in the response object.
      return res.status(200).send({
        message: `${capitalizeFirstLetter(type)} login successful`,
        cookies: {
          // For admin, this will be "admin_access_token"
          [`${type}_access_token`]: generateAccessToken(type, data._id.toString()),
          ...(type === "seller" && { brandName: data.brandName }),
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

const verifyToken = async (req, res) => {
  try {
    const verificationToken = decodeURIComponent(req.params.token).toString();
    let type = req.params.type.toLowerCase();

    // Validate type
    if (!allowedTypes.includes(type)) {
      return res.status(400).send({ message: "Invalid account type" });
    }

    let Model = authModelSelector(type, res);
    if (!Model) return res.status(400).send({ message: "Invalid type" });

    let fieldsToSelect = `isVerified verificationTokenExpiry`;
    if (type === "seller") {
      fieldsToSelect += " brandName";
    }
    const data = await Model.findOne({
      verificationToken: verificationToken,
    }).select(fieldsToSelect);

    if (data?.isVerified)
      return res.status(409).send({ message: "Account already verified" });

    if (!data) {
      return res.status(404).send({ message: "Invalid token" });
    }

    const isTokenExpired = data.verificationTokenExpiry < Date.now();
    if (isTokenExpired) {
      return res.status(403).send({ message: "Token expired" });
    }

    await Model.findByIdAndUpdate(data._id, { isVerified: true });

    return res.status(200).send({
      message: "Account verified successfully",
      cookies: {
        [`${type}_access_token`]: generateAccessToken(type, data._id.toString()),
        ...(type === "seller" && { brandName: data.brandName }),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

module.exports = {
  signup,
  login,
  verifyToken,
};
