import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import chatRoute from "./src/api/chat.js";
import testOpenAIRoute from "./src/api/test-openai.js";
import employeesRouter from './routes/employees.js';
import skillsRouter from './routes/skills.js';
import taxonomyRouter from './routes/taxonomy.js';
import pathwaysRouter from './routes/pathways.js';
import leadershipRouter from './routes/leadership.js';
import authRouter from './src/api/auth.js';
import mentorRoutes from './routes/mentors.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api/auth", authRouter);

app.get("/", (_req, res) => {
  res.send(`<h1>PSA Backend</h1>
    <ul>
      <li>/health</li>
      <li>/api/test-openai</li>
      <li>POST /api/chat</li>
    </ul>`);
});

app.get("/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use("/api/chat", chatRoute);
app.use("/api/test-openai", testOpenAIRoute);

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/employees', employeesRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/taxonomy', taxonomyRouter);

app.use('/api/pathways', pathwaysRouter);

app.use('/api/leadership', leadershipRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

app.use('/api', mentorRoutes);