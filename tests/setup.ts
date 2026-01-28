import mongoose from 'mongoose';
import net from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

const findFreePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        return reject(new Error('Failed to resolve a free port'));
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });

beforeAll(async () => {
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

  const port = process.env.TEST_MONGO_PORT
    ? Number(process.env.TEST_MONGO_PORT)
    : await findFreePort();
  mongoServer = new MongoMemoryServer({
    instance: {
      ip: '127.0.0.1',
      port
    }
  });
  await mongoServer.start(true);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
