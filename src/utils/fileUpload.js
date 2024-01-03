
import fs from "fs"
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

const uploadFileInCloudinary=async(localPath)=>
{
    try {
       if(!localPath) return null;
    //    upload the fule in cloudinary 
  let response=await  cloudinary.uploader.upload(localPath,{
        resource_type:"auto"
    })
    // file has been uploaded successfully
   //  console.log("file uploaded cloudinary",response.url)
   fs.unlinkSync(localPath)
    return response;
    } catch (error) {
      if(localPath)fs.unlinkSync(localPath) 
       
       return null;
    }
}
export {uploadFileInCloudinary}
