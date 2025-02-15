"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTag = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const createTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { name } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Tag name is required.' });
        }
        const existingTag = yield db_config_1.default.tag.findFirst({
            where: { name: name },
        });
        if (existingTag) {
            return res.status(400).json({ message: 'Tag already exists.' });
        }
        const newTag = yield db_config_1.default.tag.create({
            data: {
                name,
            },
        });
        return res.status(201).json({ message: 'Tag created successfully', tag: newTag });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to create tag', error });
    }
});
exports.createTag = createTag;
