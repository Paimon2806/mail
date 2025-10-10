import multer from "multer";

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
