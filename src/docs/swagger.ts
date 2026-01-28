import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

const cwdPath = path.resolve(process.cwd(), 'openapi.yaml');
const fallbackPath = path.resolve(__dirname, '..', '..', 'openapi.yaml');
const swaggerPath = fs.existsSync(cwdPath) ? cwdPath : fallbackPath;
const swaggerDocument = YAML.load(swaggerPath);

export { swaggerDocument, swaggerPath };
