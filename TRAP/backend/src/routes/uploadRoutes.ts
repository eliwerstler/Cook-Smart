import { Router, Request, Response } from 'express';
import { upload, uploadToCloudinary } from '../config/cloudinary';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/upload/image
 * Upload a single image to Cloudinary
 */
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const folder = (req.body.folder as string) || 'drinks';
      const imageUrl = await uploadToCloudinary(req.file.buffer, folder);

      res.json({
        success: true,
        url: imageUrl,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  }
);

export default router;
