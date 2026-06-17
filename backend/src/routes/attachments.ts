import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({ storage });

// GET /activities/:activityId/attachments — list attachments for an activity
router.get('/activities/:activityId/attachments', async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) return res.status(400).json({ error: 'Invalid activity id' });

    const attachments = await prisma.attachment.findMany({
      where: { activityId, noteId: null },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(attachments);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch attachments', details: String(err) });
  }
});

// POST /upload/activity/:activityId — multipart upload, field "file"
router.post('/upload/activity/:activityId', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) return res.status(400).json({ error: 'Invalid activity id' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        activityId,
      },
    });
    return res.status(201).json(attachment);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload attachment', details: String(err) });
  }
});

// POST /upload/note/:noteId — multipart upload, field "file"
router.post('/upload/note/:noteId', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const noteId = parseInt(req.params.noteId, 10);
    if (isNaN(noteId)) return res.status(400).json({ error: 'Invalid note id' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        noteId,
      },
    });
    return res.status(201).json(attachment);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload attachment', details: String(err) });
  }
});

// GET /attachments/:id/download — stream file with Content-Disposition header
router.get('/attachments/:id/download', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid attachment id' });

    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.join(uploadsDir, attachment.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Length', attachment.size);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return;
  } catch (err) {
    return res.status(500).json({ error: 'Failed to download attachment', details: String(err) });
  }
});

// DELETE /attachments/:id — delete file from disk and DB
router.delete('/attachments/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid attachment id' });

    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.join(uploadsDir, attachment.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.attachment.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Attachment not found' });
    return res.status(500).json({ error: 'Failed to delete attachment', details: String(err) });
  }
});

export default router;
