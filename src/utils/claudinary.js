import {v2 as claudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRETE
});


const uploadOnCloudinary = async (localFilePath) => {
        try {
           if(!localFilePath) return null
           //Uplaod the file on Claoudinary
           const response = await claudinary.uploader.upload
           (localFilePath, {
            resource_type: "auto"
           }) 

           //file has been uploaded successfully
           console.log("file is uploaded on cloudinary");
           response.url();
           return response;
        } 
        catch(error) {
           fs.unlinkSync(localFilePath)   //remove the local temporary file as the upload operation got failed
           return null;
        }
}

export {uploadOnCloudinary}