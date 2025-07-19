import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { uploadImage, deleteImage, getImageInfo, extractPublicId } from '../service/cloudinary.js';

// Custom error class for file upload errors
class FileUploadError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'FileUploadError';
    }
}

// Allowed MIME types for different file categories
export const allowedMimeTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    video: ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']
};

// File size limits (in bytes)
export const fileSizeLimits = {
    small: 5 * 1024 * 1024,    // 5MB
    medium: 10 * 1024 * 1024,  // 10MB
    large: 20 * 1024 * 1024,   // 20MB
    extraLarge: 50 * 1024 * 1024 // 50MB
};

/**
 * Create file filter function
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {Function} File filter function
 */
function createFileFilter(allowedTypes) {
    return (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new FileUploadError(`Invalid file format. Allowed types: ${allowedTypes.join(', ')}`, 400), false);
        }
    };
}

/**
 * Create multer upload instance with memory storage
 * @param {Object} options - Upload configuration options
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {number} options.fileSizeLimit - File size limit in bytes
 * @param {number} options.maxFiles - Maximum number of files
 * @returns {multer.Multer} Multer instance
 */
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
            console.log("uploadToCloudinary middleware called");
            console.log("Folder:", folder);
            console.log("Files:", req.files);
            console.log("File:", req.file);
            
            if (!req.files && !req.file) {
                console.log("No files to upload");
                return next();
            }

            const files = req.files || [req.file];
            console.log("Files to upload:", files.length);
            
            const uploadPromises = files.map(async (file) => {
                console.log("Processing file:", file.originalname, file.mimetype, file.size);
                
                // Convert buffer to base64 for cloudinary
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                
                console.log("Uploading to Cloudinary...");
                const result = await uploadImage(dataURI, folder, {
                    public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    resource_type: 'auto'
                });
                console.log("Cloudinary upload result:", result);
                return result;
            });

            const results = await Promise.all(uploadPromises);
            console.log("All uploads completed:", results);
            
            // Attach upload results to request
            if (req.files) {
                req.uploadedFiles = results;
            } else {
                req.uploadedFile = results[0];
            }

            console.log("Upload results attached to request");
            next();
        } catch (error) {
            console.error("Error in uploadToCloudinary:", error);
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
        return result;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
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
        console.error('Error getting file info from Cloudinary:', error);
        throw new FileUploadError('Failed to get file info', 500);
    }
};

// Utility function to delete multiple files from Cloudinary
export const deleteMultipleFromCloudinary = async (imageUrls) => {
    try {
        const publicIds = imageUrls.map(url => extractPublicId(url));
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        console.error('Error deleting multiple files from Cloudinary:', error);
        throw new FileUploadError('Failed to delete multiple files', 500);
    }
};

// Utility function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (imageUrl) => {
    try {
        return extractPublicId(imageUrl);
    } catch (error) {
        console.error('Error extracting public ID from URL:', error);
        throw new FileUploadError('Failed to extract public ID', 500);
    }
};
