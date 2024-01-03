import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

export const connectDb=async()=>
{
   try {
   let mongoDbinstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
   console.log(`\n MongoDB connected successfully !! ${
    mongoDbinstance.connection.host
   }`)
} catch (error) {
    console.log("MongoDB connection failed",error)
    process.exit(1)
   } 
}