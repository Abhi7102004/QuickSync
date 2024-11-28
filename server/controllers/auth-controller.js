const UserModel = require("../models/user-model");
const jwt = require("jsonwebtoken");
const { createJWTToken } = require("../utils/createJWToken");
let maxAge = 30 * 24 * 60 * 60 * 1000;
const userTokenName = process.env.TOKEN_NAME;
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill the details",
        success: false,
      });
    }
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists, please try logging in",
        success: false,
      });
    }
    user = await UserModel.create({ email, password });
    const token = createJWTToken(user?._id);
    res.cookie(userTokenName, token, {
      secure: true,
      sameSite: "None",
      maxAge: maxAge,
    });
    // console.log(token)
    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        defaultProfile: user.defaultProfile,
      },
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill the details",
        success: false,
      });
    }
    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found,Please Register",
        success: false,
      });
    }

    const checkPass = await user.comparePassword(password);
    // console.log(checkPass)
    if (!checkPass) {
      return res.status(400).json({
        message: "Incorrect Password",
        success: false,
      });
    }
    const token = createJWTToken(user._id);
    res.cookie(userTokenName, token, {
      secure: true,
      sameSite: "None",
      maxAge: maxAge,
    });
    res.status(200).json({
      user: {
        _id: user?._id,
        email: user?.email || null,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        image: user?.image || null,
        defaultProfile: user?.defaultProfile || null,
      },
      message: `${user?.firstName + user?.lastName} enjoy the ChatApp`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
const userInfo = async (req, res) => {
  try {
    // console.log(req.userId);
    let user = await UserModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName || color < 0) {
      return res.status(400).json({
        message: "First Name,Last name and color is required",
        success: false,
      });
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
      user: {
        id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        color: userData.color,
        defaultProfile: userData.defaultProfile,
      },
      message: "Profile Updated Successfully",
      success: true,
    });
  } catch (err) {
    console.log(err.message);
  }
};
const updateProfileImage = async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return res
        .status(400)
        .json({ message: "No file provided", success: false });
    }
    const userId = req.userId;
    const { imageUrl } = req.body;
    const userData = await UserModel.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    res.status(200).json({
      image: userData.image,
      success: true,
      message: "Profile Image Updated",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await UserModel.findById(userId);
    if (!userData)
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    userData.image = null;
    await userData.save();
    res
      .status(200)
      .json({ message: "Profile Image Deleted Successfully", success: true });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
const logout = async (req, res) => {
  try {
    res.cookie(userTokenName, "", {
      maxAge: 0,
      secure: true,
      sameSite: "None",
      httpOnly: true,
    });
    return res.status(200).json({
      message:"Logout Successfull",
      success:true,
    });
  } catch (err) {
    return res.status(500).json({
      message:"Internal Server Error",
      success:false
    });
  }
};

module.exports.signup = signup;
module.exports.login = login;
module.exports.userInfo = userInfo;
module.exports.updateProfile = updateProfile;
module.exports.updateProfileImage = updateProfileImage;
module.exports.deleteProfileImage = deleteProfileImage;
module.exports.logout = logout;
