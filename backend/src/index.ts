import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import projectsRouter from './routes/projects';
import activitiesRouter from './routes/activities';
import notesRouter from './routes/notes';
import attachmentsRouter from './routes/attachments';
import teamRouter from './routes/team';

const app = express();
const PORT = 3001;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api', activitiesRouter);
app.use('/api', notesRouter);
app.use('/api', attachmentsRouter);
app.use('/api/team', teamRouter);

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
