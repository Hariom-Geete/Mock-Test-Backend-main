import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// 1. Storage Configuration: File ko RAM (Memory) me hold karna
const storage = multer.memoryStorage();

// 2. File Filter (Security Check)
const fileFilter = (
    req: Request, 
    file: Express.Multer.File, 
    cb: FileFilterCallback
) => {
    // 🔥 UPDATE: Ab image ke sath-sath PDF bhi allowed hai
    if (
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'application/pdf' // 👈 PDF ka pass add kar diya
    ) {
        cb(null, true); // Accept file
    } else {
        // Error message update kar diya
        cb(new Error('Sirf images (JPEG, PNG, JPG) aur PDF allow hain bro!')); 
    }
};

// 3. Multer Export (The final middleware)
export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 🔥 10 MB max limit kar di (PDF ke liye safe zone)
    }
});