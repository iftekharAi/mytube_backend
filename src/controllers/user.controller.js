import {asyncHandler} from '../utils/asyncHandler.js'
import  {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {uploadFileInCloudinary} from "../utils/fileUpload.js"

//  method for generating Access and refresh token

const generateAccessAndRefreshToken=async(userId)=>
{
    try {

        let user =await User.findById(userId);
       
        let accessToken=await user.generateAccessToken()
        let refreshToken= await user.generateRefreshToken();
        // console.log(accessToken,refreshToken)
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,error?.message||"Something went wrong while generating tokens")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
//    get user details from client (req.body)
const {fullName,email,username,password}=req.body
// validation not empty
if(
    [fullName,email,username,password].some((data,i)=>
    {
       return data.trim()==="" 
    })
)
{
    throw new ApiError(400,"All fields are required")
}
// email validation
// username exist or not
let userExist = await User.findOne({
    $or:[{email},{username}]
})
if(userExist)
{
    throw new ApiError(409,"User already exists")
}
// check avatar and coverimage images (avatar is required)
let avatarLocalPath;
if(req.files &&  Array.isArray(req.files.avatar)&& req.files.avatar.length>0)
{
    avatarLocalPath= req.files.avatar[0].path
}
// const coverImageLocalPath=req.files?.avatar[0]?.path;
let coverImageLocalPath;
if(req.files &&  Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0)
{
   coverImageLocalPath= req.files.coverImage[0].path
}
if(!avatarLocalPath)
{
    throw new ApiError(400,"Avatar image is required")
}
// upload the file in cloudinary
const avatarUrl=await uploadFileInCloudinary(avatarLocalPath)
console.log(avatarUrl)
const coverImageUrl=await uploadFileInCloudinary(coverImageLocalPath)
console.log(coverImageUrl)
 if(!avatarUrl) throw new ApiError(400,"Avatar image is required")
// create user obejct for entering data in mongoDB

let user=await User.create({
    fullName,
    avatar:avatarUrl.url,
    coverImage:coverImageUrl?.url||"",
    email,
    username:username.toLowerCase(),
    password,

    
 })
 // remove password and refrsh token from response
 const createdUser=await User.findById(user._id)?.select(
    "-password -refreshToken"
 )
 // check the user creation
 if(!createdUser)
 {
    throw new ApiError(500,"something went wrong while registering user")
 }

 
return res.status(201).json(new ApiResponse(200,createdUser,"created user successfully"))



// return res
})


const logIn=asyncHandler(async(req,res)=>
{
    // get the value form user
    const {email,password,username}=req.body;
    // validate the user input
    if(!(username || !email)) throw new ApiError(400,"username or password is required")
    // find and check whether user is exist or not
    let user =await User.findOne({
        $or:[{email},{username}]
    })
    if(!user) throw new ApiError(401,"User Doesn't exist")
    // check password is correct or not

    let isCorrect=await user.isPasswordCorrect(password);
    if(!isCorrect) throw new ApiError(401,"incorrect username or password")
    

    // generate access and refresh token

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    
    // send the the tokens  to the user using cooking

    let loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // store the refresh and access token in the cookies
    const option={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json( new ApiResponse(201,{user:loggedInUser,
        accessToken,
        refreshToken
    
    },
    "Loged In Successfully"))
})

const logOutUser=asyncHandler(async(req,res)=>
{
  let user =req.user;
  await User.findByIdAndUpdate(user._id,{
    $set:{refreshToken:""}
  })
  const option={
    httpOnly:true,
    secure:true
}
return res.status(200)
.clearCookie("accessToken",option)
.clearCookie("refreshToken",option)
.json(new ApiResponse(200,{},"log out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>
{
const incRefreshToken=req.cookies.refreshToken|| req.body.refreshToken
 if(incRefreshToken) throw new ApiError(401,"Unauthorized request")
try {
     const decoddedToken= jwt.verify(incRefreshToken,process.env.REFRESH_TOEKN_SECRET)
     let userInfo=await User.findById(decoddedToken._id)
    
     if(userInfo) throw new ApiError(401,"Invalid token")
    
     if(incRefreshToken!==userInfo?.refreshToken)
     {
        throw new ApiError(401,"refresh token is expired or used")
     }
     const option={
        httpOnly:true,
        secure:true
    }
    
     let {accessToken,refreshToken}=await generateAccessAndRefreshToken(userInfo._id)
     res.status(200)
     .cookie("accessToken",accessToken,option)
     .cookie("refreshToken",refreshToken,option)
     .json(new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed"))
    
} catch (error) {
    throw new ApiError(401,error?.message||"something went wrong")
}
})

export {registerUser,logIn,logOutUser,refreshAccessToken}