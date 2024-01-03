import dotenv from "dotenv"
import { connectDb } from "./db/db.connection.js";
import { app } from "./app.js";
dotenv.config({
    path:"./env"
}) 
// db connection
connectDb() 
.then((success)=>
{
 app.listen(process.env.PORT|| 8000,()=>
 {
    console.log(`Server is running at port ${process.env.PORT}`)
 }) 
})
.catch((err)=>
{
  console.log("MongoDb connection failed", err)  
})
