import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET / — list all projects with _count of activities
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { activities: true },
        },
      },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects', details: String(err) });
  }
});

// POST / — create project {name, description}
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as { name: string; description?: string };
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const project = await prisma.project.create({
      data: { name: name.trim(), description: description?.trim() },
    });
    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create project', details: String(err) });
  }
});

// PUT /:id — update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });
    const { name, description } = req.body as { name?: string; description?: string };
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
    });
    return res.json(project);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Project not found' });
    return res.status(500).json({ error: 'Failed to update project', details: String(err) });
  }
});

// DELETE /:id — delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });
    await prisma.project.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Project not found' });
    return res.status(500).json({ error: 'Failed to delete project', details: String(err) });
  }
});

export default router;
