"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storySchema = void 0;
const vine_1 = __importDefault(require("@vinejs/vine"));
const CustomErrorReport_1 = require("./CustomErrorReport");
vine_1.default.errorReporter = () => new CustomErrorReport_1.CustomErrorReporter();
exports.storySchema = vine_1.default.object({
    content: vine_1.default.string(),
    //expiresAt: vine.date(),
});
