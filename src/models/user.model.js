import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema=new mongoose.Schema({
  username:{
    type:String,
    required:[true,"username is required"],
    unique:true,
    lowercase:true,
    trim:true,
    index:true
  },
  email:{
    type:String,
    required:[true,"email is required"],
    unique:true,
    lowercase:true,
    trim:true,
    
  },
  fullName:{
    type:String,
    required:[true,"fullName is required"],
    
    trim:true,
    index:true
    
  },
  avatar:{
     type:String, //claudnary url
    required:[true,"avatar is required"],
    
  },
  coverImage:{
     type:String, //claudnary url
   
    
  },
  watchHistory:[
    {type:mongoose.Schema.Types.ObjectId,
     ref:"Video"
    }
  ],
  password:{
    type:String,
    required:[true,"password is required"],
    trim:true

  },
  refreshToken:{
    type:String,

  }
},{timestamps:true})
// hookes for password encryptions
userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();
  this.password=await bcrypt.hash(this.password,10);
  next();
})

userSchema.methods.isPasswordCorrect= async function(password)
{
 return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function()
{
 
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },process.env.ACCESS_TOKEN_SECRET,{
       expiresIn :process.env.ACCESS_TOEKN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken=function()
{
  console.log(process.env.REFRESH_TOEKN_SECRET)
    return jwt.sign({
        _id:this._id,
        
    },process.env.REFRESH_TOEKN_SECRET,{
       expiresIn :process.env.REFRESH_TOEKN_EXPIRY
    })
}
export const User=mongoose.model("User",userSchema)