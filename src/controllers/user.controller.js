import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";

import {ApiResponse} from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});


    return { accessToken, refreshToken };
} catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
}
}
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists: username or email
    //check for images, check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    //return res


    const{fullname,email,username,password}=req.body
    console.log(req.body);


    //1st way
    // if (fullname === "" ){
    //     throw new ApiError(400, "Fullname is required");
    // } 
    // if (email === "" ){
    //     throw new ApiError(400, "Email is required");
    // }
    // if (username === "" ){
    //     throw new ApiError(400, "Username is required");
    // }
    // if (password === "" ){
    //     throw new ApiError(400, "Password is required");
    // }

    //2nd way 
    if(
        [fullname,email,username,password].some((field) => field?.trim() === "")
    )
    {
        throw new ApiError(400, "All fields are required");
    }

     const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with the same username or email already exists");
    }

const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)


   if (!avatar){
    throw new ApiError(400, "Failed to upload avatar image");
   }
    
   const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password
    })

   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if(!createdUser){
    throw new ApiError(500, "Failed to create user");
   }

   return res.status(201).json(new ApiResponse(true, "User registered successfully", createdUser));


});

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //username or email 
    //find the user
    //password check
    //generate access token and refresh token
    //send cookies and response

    const{email, username, password} = req.body;
    if(!username || !email){
        throw new ApiError(400, "Username or email is required");
    }

   const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {// cookie editable only by the server and not accessible via client-side JavaScript, and secure means it will only be sent over HTTPS connections.
        httpOnly: true,
        secure : true
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        },"User logged in successfully")

    );

});


const logoutUser = asyncHandler(async (req, res) => {
   User.findByIdAndUpdate(req.user._id, 
    {
        $set:{
            refreshToken: undefined
        }
    },
    {
        new: true
    }
   )

   
    const options = {// cookie editable only by the server and not accessible via client-side JavaScript, and secure means it will only be sent over HTTPS connections.
        httpOnly: true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;


    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request");

    }

     try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    

      const user = await User.findById(decodedToken._id)
      if (!user){
        throw new ApiError(401, "Invalid refresh token");;
      }

      if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, " refresh token expired");
      }

      const option = {
        httpOnly: true,
        secure: true,
      }

      const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id);

      return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newrefreshToken, option)
        .json(new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed successfully"));
     }
     catch (error) {
        throw new ApiError(401, "Invalid refresh token");
     }

});

export {registerUser, loginUser , logoutUser, refreshAccessToken};