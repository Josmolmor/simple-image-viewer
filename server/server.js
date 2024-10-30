require('dotenv').config();
const express = require("express");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Cors related code
const cors = require("cors");

app.use(cors({
    origin: [process.env.CLIENT_HOST] // Replace with any allowed origin; 5173 is default for Vite
}));

const uploadsDirectoryName = process.env.UPLOADS_DIRECTORY_NAME || 'uploads';
// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDirectoryName)) {
    fs.mkdirSync(uploadsDirectoryName);
}

// multer related code
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the directory to store images
        cb(null, `${uploadsDirectoryName}/`);
    },
    filename: (req, file, cb) => {
        // Set filename with original name and a timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Only accept images
        if (['image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG image files are allowed!'), false);
        }
    }
});

// Upload new image to the "uploads" folder
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file retrieved' });
    }
    res.json({
        message: 'Image uploaded successfully',
        filePath: `/${uploadsDirectoryName}/${req.file.filename}`
    });
});

// Make the 'uploads' directory public
app.use(`/${uploadsDirectoryName}`, express.static('uploads'));

// Get all
app.get('/list-uploads', (req, res) => {
    const directoryPath = path.join(__dirname, uploadsDirectoryName);

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading the uploads directory:', err);
            return res.status(500).json({ message: 'Error reading uploads directory' });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
        const fileUrls = imageFiles.map(file => `/${uploadsDirectoryName}/${file}`);
        res.json({
            message: 'Images fetched successfully',
            fileUrls
        });
    });
});

// Get individual image
app.get(`/${uploadsDirectoryName}/:filename`, (req, res) => {
    const filePath = path.join(__dirname, uploadsDirectoryName, req.params.filename);
    // Check if the file exists within the 'uploads' directory
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'File not found' });
        }

        // If file exists, send it
        res.sendFile(filePath);
    });
})

// Delete
app.delete(`/${uploadsDirectoryName}/:filename`, (req, res) => {
    const filePath = path.join(__dirname, uploadsDirectoryName, req.params.filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).json({ message: 'Error deleting file' });
        }
        res.json({ message: 'File deleted successfully' });
    })
});

const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})