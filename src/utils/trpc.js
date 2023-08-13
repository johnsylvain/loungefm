"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpc = exports.createContext = void 0;
const server_1 = require("@trpc/server");
const createContext = ({ req, res }) => ({
    req,
    res,
});
exports.createContext = createContext;
exports.trpc = server_1.initTRPC.context().create();
