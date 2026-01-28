"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const swagger_1 = require("./docs/swagger");
const app = (0, express_1.default)();
app.get('/docs/swagger.json', (_req, res) => {
    res.json(swagger_1.swaggerDocument);
});
app.get('/docs/openapi.yaml', (_req, res) => {
    res.type('yaml').sendFile(swagger_1.swaggerPath);
});
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerDocument));
app.use(express_1.default.json());
app.use('/post', postRoutes_1.default);
app.use('/comment', commentRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/auth', authRoutes_1.default);
app.get('/', (_req, res) => {
    res.send('API is running');
});
exports.default = app;
