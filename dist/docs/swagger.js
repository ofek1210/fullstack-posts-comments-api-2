"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerPath = exports.swaggerDocument = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yamljs_1 = __importDefault(require("yamljs"));
const cwdPath = path_1.default.resolve(process.cwd(), 'openapi.yaml');
const fallbackPath = path_1.default.resolve(__dirname, '..', '..', 'openapi.yaml');
const swaggerPath = fs_1.default.existsSync(cwdPath) ? cwdPath : fallbackPath;
exports.swaggerPath = swaggerPath;
const swaggerDocument = yamljs_1.default.load(swaggerPath);
exports.swaggerDocument = swaggerDocument;
