import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { attachmentsController } from '../controllers/attachments.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { config } from '../config';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type restrictions
    // const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // if (extname) {
    //   return cb(null, true);
    // } else {
    //   cb(new Error('Invalid file type'));
    // }
    cb(null, true);
  },
});

router.get('/task/:taskId', asyncHandler(attachmentsController.getByTaskId));
router.get('/:id', asyncHandler(attachmentsController.getById));
router.post('/', authMiddleware, upload.single('file'), asyncHandler(attachmentsController.upload));
router.delete('/:id', authMiddleware, asyncHandler(attachmentsController.delete));

export default router;
