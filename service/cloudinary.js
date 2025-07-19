import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";

export const initCloudinary = () => {
   cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   logger.info('Cloudinary configuration completed');
};


//==================================uploadImage================================================

export const uploadImage = async (filePath, folder = 'theshop', options = {}) => {
    try {
        const defaultOptions = {
            folder,
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
            ...options,
        };

        const result = await cloudinary.uploader.upload(filePath, defaultOptions);

        return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};
//==================================uploadMultipleImages================================================

export const uploadMultipleImages = async (files, folder = 'theshop/products') => {
    try {
        const uploadPromises = files.map((file, index) =>
            uploadImage(file.tempFilePath, folder, {
                public_id: `${Date.now()}_${index}`,
            })
        );

        return await Promise.all(uploadPromises);
    } catch (error) {
        throw new Error(`Multiple image upload failed: ${error.message}`);
    }
};

//==================================deleteImage================================================

export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Image deletion failed: ${error.message}`);
    }
};

//==================================deleteMultipleImages================================================

export const deleteMultipleImages = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        throw new Error(`Multiple image deletion failed: ${error.message}`);
    }
};

//==================================getOptimizedImageUrl================================================

export const getOptimizedImageUrl = (publicId, transformations = {}) => {
    const defaultTransformations = {
        quality: 'auto',
        fetch_format: 'auto',
        ...transformations,
    };

    return cloudinary.url(publicId, defaultTransformations);
};

//==================================extractPublicId================================================

export const extractPublicId = (url) => {
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        return publicId;
    } catch (error) {
        throw new Error(`Failed to extract public ID from URL: ${error.message}`);
    }
};

//==================================getImageInfo================================================

export const getImageInfo = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        throw new Error(`Failed to get image info: ${error.message}`);
    }
};


export default cloudinary; 