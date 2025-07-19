import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

// Custom error class for file upload errors
class FileUploadError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'FileUploadError';
    }
}

// Cloudinary upload function
const uploadImage = async (dataURI, folder, options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folder,
            ...options
        });
        return result;
    } catch (error) {
        logger.error('Cloudinary upload error:', error);
        throw new FileUploadError('Failed to upload image', 500);
    }
};

// Cloudinary delete function
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        logger.error('Cloudinary delete error:', error);
        throw new FileUploadError('Failed to delete image', 500);
    }
};

// Cloudinary get info function
const getImageInfo = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        logger.error('Cloudinary get info error:', error);
        throw new FileUploadError('Failed to get image info', 500);
    }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (imageUrl) => {
    try {
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        return publicId;
    } catch (error) {
        logger.error('Error extracting public ID:', error);
        throw new FileUploadError('Failed to extract public ID', 500);
    }
};

// File type configurations
const allowedMimeTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
};

const fileSizeLimits = {
    small: 1024 * 1024,      // 1MB
    medium: 5 * 1024 * 1024, // 5MB
    large: 10 * 1024 * 1024, // 10MB
    extraLarge: 50 * 1024 * 1024 // 50MB
};

// Create file filter function
function createFileFilter(allowedTypes) {
    return (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new FileUploadError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
        }
    };
}

// Create uploader function
export function createUploader(options = {}) {
    const {
        allowedTypes = allowedMimeTypes.image,
        fileSizeLimit = fileSizeLimits.medium,
        maxFiles = 1
    } = options;

    const fileFilter = createFileFilter(allowedTypes);

    return multer({
        storage: multer.memoryStorage(),
        fileFilter: fileFilter,
        limits: {
            fileSize: fileSizeLimit,
            files: maxFiles
        }
    });
}

// Pre-configured uploaders for common use cases
export const uploaders = {
    // Product images (single image)
    productImage: createUploader({
        allowedTypes: allowedMimeTypes.image,
        fileSizeLimit: fileSizeLimits.medium,
        maxFiles: 1
    }),

    // Product images (multiple images)
    productImages: createUploader({
        allowedTypes: allowedMimeTypes.image,
        fileSizeLimit: fileSizeLimits.medium,
        maxFiles: 10
    }),

    // User profile images
    profileImage: createUploader({
        allowedTypes: allowedMimeTypes.image,
        fileSizeLimit: fileSizeLimits.small,
        maxFiles: 1
    }),

    // Category images
    categoryImage: createUploader({
        allowedTypes: allowedMimeTypes.image,
        fileSizeLimit: fileSizeLimits.small,
        maxFiles: 1
    }),

    // Banner images
    bannerImage: createUploader({
        allowedTypes: allowedMimeTypes.image,
        fileSizeLimit: fileSizeLimits.large,
        maxFiles: 1
    }),

    // Documents (for orders, invoices, etc.)
    document: createUploader({
        allowedTypes: allowedMimeTypes.document,
        fileSizeLimit: fileSizeLimits.medium,
        maxFiles: 1
    }),

    // Videos (for product demos, etc.)
    video: createUploader({
        allowedTypes: allowedMimeTypes.video,
        fileSizeLimit: fileSizeLimits.extraLarge,
        maxFiles: 1
    })
};

// Middleware to handle file upload to Cloudinary
export const uploadToCloudinary = (folder = 'theshop') => {
    return async (req, res, next) => {
        try {
            if (!req.files && !req.file) {
                return next();
            }

            const files = req.files || [req.file];
            logger.info(`Uploading ${files.length} file(s) to Cloudinary folder: ${folder}`);
            
            const uploadPromises = files.map(async (file) => {
                logger.debug(`Processing file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
                
                // Convert buffer to base64 for cloudinary
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                
                const result = await uploadImage(dataURI, folder, {
                    public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    resource_type: 'auto'
                });
                
                logger.debug(`File uploaded successfully: ${result.public_id}`);
                return result;
            });

            const results = await Promise.all(uploadPromises);
            logger.info(`Successfully uploaded ${results.length} file(s) to Cloudinary`);
            
            // Attach upload results to request
            if (req.files) {
                req.uploadedFiles = results;
            } else {
                req.uploadedFile = results[0];
            }

            next();
        } catch (error) {
            logger.error('Error in uploadToCloudinary:', error);
            next(new FileUploadError(`Upload failed: ${error.message}`, 500));
        }
    };
};

// Error handling middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Please upload a smaller file.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Please upload fewer files.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected file field.'
            });
        }
    }
    
    if (err instanceof FileUploadError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }

    next(err);
};

// Utility function to delete file from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
    try {
        const publicId = extractPublicId(imageUrl);
        const result = await deleteImage(publicId);
        logger.info(`Successfully deleted file from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error('Error deleting file from Cloudinary:', error);
        throw new FileUploadError('Failed to delete file', 500);
    }
};

// Utility function to get file info from Cloudinary
export const getFileInfo = async (imageUrl) => {
    try {
        const publicId = extractPublicId(imageUrl);
        const result = await getImageInfo(publicId);
        return result;
    } catch (error) {
        logger.error('Error getting file info from Cloudinary:', error);
        throw new FileUploadError('Failed to get file info', 500);
    }
};

// Utility function to delete multiple files from Cloudinary
export const deleteMultipleFromCloudinary = async (imageUrls) => {
    try {
        const publicIds = imageUrls.map(url => extractPublicId(url));
        const result = await cloudinary.api.delete_resources(publicIds);
        logger.info(`Successfully deleted ${publicIds.length} files from Cloudinary`);
        return result;
    } catch (error) {
        logger.error('Error deleting multiple files from Cloudinary:', error);
        throw new FileUploadError('Failed to delete multiple files', 500);
    }
};

// Utility function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (imageUrl) => {
    try {
        return extractPublicId(imageUrl);
    } catch (error) {
        logger.error('Error extracting public ID from URL:', error);
        throw new FileUploadError('Failed to extract public ID', 500);
    }
};
