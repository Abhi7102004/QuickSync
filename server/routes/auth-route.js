const express=require('express');
const {signup,login, userInfo,updateProfile, updateProfileImage, deleteProfileImage, logout} = require('../controllers/auth-controller');
const verifyToken = require('../middleware/auth-middleware');
const Router=express.Router();

Router.post('/signup',signup)
Router.post('/login',login)
Router.get('/user-info',verifyToken,userInfo)
Router.post('/update-profile',verifyToken,updateProfile)
Router.post('/update-profile-image',verifyToken,updateProfileImage)
Router.delete('/delete-profile-image',verifyToken,deleteProfileImage)
Router.post('/logout',logout)

module.exports=Router
