"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database = async () => {
    try {
        await mongoose_1.default.connect(`${process.env.MONGO}`);
        console.log('🚀 Database connected ');
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
exports.database = database;
