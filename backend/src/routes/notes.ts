import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /activities/:activityId/notes — include attachments
router.get('/activities/:activityId/notes', async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) return res.status(400).json({ error: 'Invalid activity id' });

    const notes = await prisma.note.findMany({
      where: { activityId },
      orderBy: { createdAt: 'asc' },
      include: { attachments: true },
    });
    return res.json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch notes', details: String(err) });
  }
});

// POST /activities/:activityId/notes — {content}
router.post('/activities/:activityId/notes', async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) return res.status(400).json({ error: 'Invalid activity id' });

    const { content } = req.body as { content: string };
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const note = await prisma.note.create({
      data: { activityId, content: content.trim() },
      include: { attachments: true },
    });
    return res.status(201).json(note);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create note', details: String(err) });
  }
});

// DELETE /notes/:id
router.delete('/notes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid note id' });
    await prisma.note.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Note not found' });
    return res.status(500).json({ error: 'Failed to delete note', details: String(err) });
  }
});

export default router;
