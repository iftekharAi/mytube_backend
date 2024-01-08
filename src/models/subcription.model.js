import mongoose, { Schema } from "mongoose";

 const subcription =new mongoose.Schema({
  subcriber:{
    type:mongoose.Schema.Types.ObjectId, //one who is subcribing
    ref:"User"
  },
  chennal:{
    type:mongoose.Schema.Types.ObjectId, //who is the chennal 
    ref:"User"
  }
},{timestamps:true})

export const subcriptions= mongoose.model("Subscription",subcription)