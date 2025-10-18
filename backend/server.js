import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import employeesRouter from './routes/employees.js';
import skillsRouter from './routes/skills.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/employees', employeesRouter);
app.use('/api/skills', skillsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
