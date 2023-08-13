"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("@trpc/server/adapters/express");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const trpc_1 = require("./utils/trpc");
const database_1 = require("./utils/database");
const api_route_1 = require("./routes/api.route");
const trpc_panel_1 = require("trpc-panel");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/api', (0, express_2.createExpressMiddleware)({
    router: api_route_1.apiRoute,
    createContext: trpc_1.createContext,
}));
app.use('/panel', (_, res) => {
    return res.send((0, trpc_panel_1.renderTrpcPanel)(api_route_1.apiRoute, { url: 'http://localhost:8080/api' }));
});
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`);
    (0, database_1.database)();
});
