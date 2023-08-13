"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoute = exports.isAuthorizedProcedure = void 0;
const trpc_1 = require("../utils/trpc");
const zod_1 = require("zod");
const server_1 = require("@trpc/server");
const song_controller_1 = require("../controllers/song.controller");
const isAuthorized = trpc_1.trpc.middleware(({ ctx, next }) => {
    if (!ctx) {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    return next();
});
exports.isAuthorizedProcedure = trpc_1.trpc.procedure.use(isAuthorized);
exports.apiRoute = trpc_1.trpc.router({
    getSongs: exports.isAuthorizedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100),
        page: zod_1.z.number().min(1),
    }))
        .query(async (opts) => {
        const { input } = opts;
        const { limit, page } = input;
        if (!limit || !page) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'expects limit and page as input',
            });
        }
        const response = await (0, song_controller_1.getAllSongs)(input);
        return response;
    }),
    searchSongs: exports.isAuthorizedProcedure
        .input(zod_1.z.object({
        searchText: zod_1.z.string(),
        limit: zod_1.z.number(),
        page: zod_1.z.number(),
    }))
        .query(async (opts) => {
        const { input } = opts;
        const { limit, page, searchText } = input;
        if (!limit || !page || !searchText) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'expects limit and page as input',
            });
        }
        const response = await (0, song_controller_1.searchSongs)(input);
        return response;
    }),
    likeSong: exports.isAuthorizedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        userID: zod_1.z.string(),
    }))
        .mutation(async (opts) => {
        const { input } = opts;
        const { id, userID } = input;
        if (!id || !userID) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'expects id as input',
            });
        }
        const response = await (0, song_controller_1.likeSong)(input);
        return response;
    }),
    getUserLikes: exports.isAuthorizedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        userID: zod_1.z.string(),
    }))
        .query(async (opts) => {
        const { input } = opts;
        const { id, userID } = input;
        if (!id || !userID) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'expects id as input',
            });
        }
        const response = await (0, song_controller_1.likeSong)(input);
        return response;
    }),
    getSongLikes: exports.isAuthorizedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        userID: zod_1.z.string(),
    }))
        .query(async (opts) => {
        const { input } = opts;
        const { id, userID } = input;
        if (!id || !userID) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'expects id as input',
            });
        }
        const response = await (0, song_controller_1.likeSong)(input);
        return response;
    }),
});
