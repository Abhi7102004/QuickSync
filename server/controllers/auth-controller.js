const UserModel = require("../models/user-model");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const { jwtToken } = require("../utils/createJWToken");
let maxAge = 30 * 24 * 60 * 60 * 1000;
const signup = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).send("Username or Password is incorrect");
    }
    let user = await UserModel.create({ email, password });
    const token = jwtToken(user._id);
    res.cookie("jwtToken", token, {
      secure: true,
      sameSite: "None",
      maxAge: maxAge,
    });
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        defaultProfile: user.defaultProfile,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
};
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Username or Password is incorrect");
    }
    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found,Please Register");
    }
    const checkPass = await user.comparePassword(password);
    console.log(checkPass);
    if (!checkPass) {
      return res.status(400).send("Incorrect Password");
    }
    const token = jwtToken(user._id);
    res.cookie("jwtToken", token, {
      secure: true,
      sameSite: "None",
      maxAge: maxAge,
    });
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        defaultProfile: user.defaultProfile,
      },
    });
  } catch (error) {
    // console.log(error.message)
    return res.status(500).send("Internal Server Error");
  }
};
const userInfo = async (req, res) => {
  try {
    console.log(req.userId);
    let user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName || color < 0) {
      return res.status(400).send("First Name,Last name and color is required");
    }
    const userData = await UserModel.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        defaultProfile: true,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      id: userData._id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      color: userData.color,
      defaultProfile: userData.defaultProfile,
    });
  } catch (err) {
    console.log(err.message);
  }
};
const updateProfileImage = async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return res.status(400).json({ message: "No file provided" });
    }
    const userId = req.userId;
    const { imageUrl } = req.body;
    // console.log(imageUrl)
    const userData = await UserModel.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ image: userData.image });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await UserModel.findById(userId);
    if (!userData) return res.status(404).send("User not found");
    userData.image = null;
    await userData.save();
    res.status(200).json({ message: "Profile Image Deleted Successfully" });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
const logout = async (req, res) => {
  try {
    res.cookie("jwtToken", "", {
      maxAge: 0,
      secure: true,
      sameSite: "None",
      httpOnly: true,
    });
    return res.status(200).send("Your account deleted Successfully");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

module.exports.signup = signup;
module.exports.login = login;
module.exports.userInfo = userInfo;
module.exports.updateProfile = updateProfile;
module.exports.updateProfileImage = updateProfileImage;
module.exports.deleteProfileImage = deleteProfileImage;
module.exports.logout = logout;
