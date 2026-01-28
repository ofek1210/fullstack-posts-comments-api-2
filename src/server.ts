import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const requiredEnvVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not configured. Set it in your environment (.env).`);
  }
});

connectDB();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
