import { app } from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[StatIntel Backend] Running on http://localhost:${PORT}`);
  console.log(`[StatIntel Backend] Health check: http://localhost:${PORT}/api/health`);
});
