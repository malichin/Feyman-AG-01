import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET / — list team members
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return res.json(members);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch team members', details: String(err) });
  }
});

// POST / — {name, role}
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, role } = req.body as { name: string; role?: string };
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Team member name is required' });
    }
    const member = await prisma.teamMember.create({
      data: { name: name.trim(), role: role?.trim() },
    });
    return res.status(201).json(member);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create team member', details: String(err) });
  }
});

// PUT /:id — update team member
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid team member id' });

    const { name, role } = req.body as { name?: string; role?: string };
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(role !== undefined && { role: role.trim() }),
      },
    });
    return res.json(member);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Team member not found' });
    return res.status(500).json({ error: 'Failed to update team member', details: String(err) });
  }
});

// DELETE /:id — delete team member
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid team member id' });
    await prisma.teamMember.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Team member not found' });
    return res.status(500).json({ error: 'Failed to delete team member', details: String(err) });
  }
});

export default router;
