import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /projects/:projectId/activities — include assignee, count of notes and attachments
router.get('/projects/:projectId/activities', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) return res.status(400).json({ error: 'Invalid project id' });

    const activities = await prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        assignee: true,
        _count: {
          select: { notes: true, attachments: true },
        },
      },
    });
    return res.json(activities);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch activities', details: String(err) });
  }
});

// POST /projects/:projectId/activities — {code, title, assigneeId, deadline, status}
router.post('/projects/:projectId/activities', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) return res.status(400).json({ error: 'Invalid project id' });

    const { code, title, assigneeId, deadline, status } = req.body as {
      code: string;
      title: string;
      assigneeId?: number | null;
      deadline?: string | null;
      status?: string;
    };

    if (!code || code.trim() === '') return res.status(400).json({ error: 'Activity code is required' });
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Activity title is required' });

    const activity = await prisma.activity.create({
      data: {
        code: code.trim(),
        title: title.trim(),
        projectId,
        assigneeId: assigneeId ?? null,
        deadline: deadline ? new Date(deadline) : null,
        status: status ?? 'todo',
      },
      include: {
        assignee: true,
        _count: {
          select: { notes: true, attachments: true },
        },
      },
    });
    return res.status(201).json(activity);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create activity', details: String(err) });
  }
});

// PUT /activities/:id — update activity
router.put('/activities/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid activity id' });

    const { code, title, assigneeId, deadline, status } = req.body as {
      code?: string;
      title?: string;
      assigneeId?: number | null;
      deadline?: string | null;
      status?: string;
    };

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: code.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ?? null }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(status !== undefined && { status }),
      },
      include: {
        assignee: true,
        _count: {
          select: { notes: true, attachments: true },
        },
      },
    });
    return res.json(activity);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Activity not found' });
    return res.status(500).json({ error: 'Failed to update activity', details: String(err) });
  }
});

// DELETE /activities/:id — delete activity
router.delete('/activities/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid activity id' });
    await prisma.activity.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Activity not found' });
    return res.status(500).json({ error: 'Failed to delete activity', details: String(err) });
  }
});

export default router;
