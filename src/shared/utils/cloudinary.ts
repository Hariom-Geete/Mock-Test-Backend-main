import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// .env me inko add karna mat bhoolna
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "brainmock_profiles",
    });
    fs.unlinkSync(localFilePath); // Upload hone ke baad local file delete kar do
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Error aaye toh bhi delete karo
    }
    return null;
  }
};