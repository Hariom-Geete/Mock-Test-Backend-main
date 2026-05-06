import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// 1. Storage Configuration: File ko RAM (Memory) me hold karna
const storage = multer.memoryStorage();

// 2. File Filter (Security Check)
// Ye ensure karega ki user sirf image upload kare, PDF ya virus wali .exe file nahi
const fileFilter = (
    req: Request, 
    file: Express.Multer.File, 
    cb: FileFilterCallback
) => {
    // Check if the file type is an image
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Sirf images (JPEG, PNG, JPG) allow hain bro!')); // Reject file
    }
};

// 3. Multer Export (The final middleware)
export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max limit (server crash hone se bachane ke liye)
    }
});