import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import { swaggerDocument, swaggerPath } from './docs/swagger';

const app = express();

app.get('/docs/swagger.json', (_req, res) => {
  res.json(swaggerDocument);
});
app.get('/docs/openapi.yaml', (_req, res) => {
  res.type('yaml').sendFile(swaggerPath);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('API is running');
});

export default app;
