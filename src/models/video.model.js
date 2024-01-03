import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema=new mongoose.Schema({
 videoFile:{
    type:String,
    required:[true,"video is required"]
 }, 
 thumbnail:{
    type:String,
    required:[true,"thumbnail is required"]
 }, 
 title:{
    type:String,
    required:[true,"title is required"]
 }, 
 description:{
    type:String,
    
 }, 
 duration:{
    type:Number,
    
 }, 
 views:{
    type:Number,
    default:0
    
 }, 
 isPublished:{
    type:Boolean,
    default:true
    
 }, 
 owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
    
 }, 
},{timestamps:true})
videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)