"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLikes = exports.likeSong = exports.searchSongs = exports.getAllSongs = void 0;
const server_1 = require("@trpc/server");
const dotenv_1 = __importDefault(require("dotenv"));
const song_schema_1 = __importDefault(require("../schema/song.schema"));
const like_schema_1 = __importDefault(require("../schema/like.schema"));
dotenv_1.default.config();
const getAllSongs = async ({ limit, page, }) => {
    try {
        const startIndex = (page - 1) * limit;
        const totalQueryResult = await song_schema_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
        ]);
        const total = totalQueryResult.length > 0 ? totalQueryResult[0].totalCount : 0;
        const totalPages = Math.ceil(total / limit);
        const response = await song_schema_1.default.aggregate([
            { $sample: { size: total } },
            {
                $project: {
                    artist: 1,
                    title: 1,
                    link: 1,
                    artwork: 1,
                },
            },
        ]);
        const data = response.slice(startIndex, startIndex + limit);
        return {
            data,
            total,
            totalPages,
            currentPage: page,
        };
    }
    catch (error) {
        throw new server_1.TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        });
    }
};
exports.getAllSongs = getAllSongs;
const searchSongs = async ({ limit, page, searchText, }) => {
    try {
        const startIndex = (page - 1) * limit;
        const countQuery = song_schema_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: searchText, $options: 'i' } },
                        { artist: { $regex: searchText, $options: 'i' } }, // Case-insensitive artist search using regex
                    ],
                },
            },
            {
                $count: 'totalCount',
            },
        ]);
        const response = await song_schema_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: searchText, $options: 'i' } },
                        { artist: { $regex: searchText, $options: 'i' } }, // Case-insensitive artist search using regex
                    ],
                },
            },
            {
                $skip: startIndex,
            },
            {
                $limit: limit,
            },
        ]);
        const [totalCount, data] = await Promise.all([countQuery, response]);
        const total = totalCount.length > 0 ? totalCount[0].totalCount : 0;
        const totalPages = Math.ceil(total / limit);
        return {
            data: response,
            total,
            totalPages,
            currentPage: page,
        };
    }
    catch (error) {
        throw new server_1.TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        });
    }
};
exports.searchSongs = searchSongs;
const likeSong = async ({ id, userID, }) => {
    try {
        let liked = false;
        const results = await like_schema_1.default.findOne({
            songId: id,
            userId: userID,
        });
        if (results) {
            await like_schema_1.default.findOneAndDelete({
                songId: id,
                userId: userID,
            });
        }
        else {
            liked = true;
            await like_schema_1.default.create({
                songId: id,
                userId: userID,
            });
        }
        return {
            liked,
        };
    }
    catch (error) {
        throw new server_1.TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        });
    }
};
exports.likeSong = likeSong;
const getUserLikes = async ({ userID }) => {
    try {
        const results = await like_schema_1.default.find({
            userId: userID,
        });
    }
    catch (error) {
        throw new server_1.TRPCError({
            code: 'TIMEOUT',
            message: 'Cant get songs at this moment, please try again later',
        });
    }
};
exports.getUserLikes = getUserLikes;
