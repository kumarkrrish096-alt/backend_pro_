import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) {
                throw new Error("Local file path is required");
            }
            // Upload the file to Cloudinary
            const result = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto", // Automatically detect the file type (image, video, etc.)

            });// Return the result, which includes the URL of the uploaded file
            console.log("Upload successful:", result.url);
            return result;
        } catch (error) {
            fs.unlinkSync(localFilePath); // Delete the local file after upload attempt (you can choose to do this in a finally block if you want to ensure it happens regardless of success or failure)
           return null; // Return null or handle the error as needed
        }
    }


    export { uploadOnCloudinary };