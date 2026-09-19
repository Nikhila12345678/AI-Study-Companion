import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from './env.js';

const storage = multer.diskStorage({
  destination: env.uploadDir,
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 }
});
