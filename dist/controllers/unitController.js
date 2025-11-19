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
exports.createUnit = void 0;
const db_config_1 = __importDefault(require("../database/db.config")); // Assurez-vous que c'est la bonne instance Prisma
const createUnit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: 'Missing required field: name' });
        }
        const existingUnit = yield db_config_1.default.unit.findFirst({
            where: { name },
        });
        if (existingUnit) {
            return res.status(400).json({ message: 'Unit with name ' + name + ' already exists' });
        }
        const newUnit = yield db_config_1.default.unit.create({
            data: {
                name,
            },
        });
        return res.status(201).json(newUnit);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: `Erreur lors de la création de l'unité : ${error.message}` });
        }
        else {
            return res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.createUnit = createUnit;
