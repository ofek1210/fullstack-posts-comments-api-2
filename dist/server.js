"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const requiredEnvVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`${key} is not configured. Set it in your environment (.env).`);
    }
});
(0, db_1.default)();
const PORT = 3000;
app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
