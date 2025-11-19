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
exports.createConversion = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const createConversion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fromUnitId, toUnitId } = req.body;
        // Validation des données
        if (!fromUnitId || !toUnitId) {
            return res.status(400).json({ message: 'Missing required fields: fromUnitId, toUnitId, or value.' });
        }
        // Vérifier si les unités existent
        const fromUnit = yield db_config_1.default.unit.findUnique({
            where: { id: fromUnitId }
        });
        const toUnit = yield db_config_1.default.unit.findUnique({
            where: { id: toUnitId }
        });
        if (!fromUnit || !toUnit) {
            return res.status(404).json({ message: 'One or both units not found.' });
        }
        // Vérifier si la conversion existe déjà
        const existingConversion = yield db_config_1.default.conversion.findFirst({
            where: {
                fromUnitId,
                toUnitId
            }
        });
        if (existingConversion) {
            return res.status(409).json({ message: 'Conversion between these units already exists.' });
        }
        let value = 0;
        if (fromUnit.name === toUnit.name) {
            value = 1;
        }
        else if (fromUnit.name === 'METRE' && toUnit.name === 'CENTIMETRE') {
            value = 100;
        }
        else if (fromUnit.name === 'CENTIMETRE' && toUnit.name === 'METRE') {
            value = 0.1;
        }
        else if (fromUnit.name === 'METRE' && toUnit.name === 'YARD') {
            value = 1.09;
        }
        else if (fromUnit.name === 'YARD' && toUnit.name === 'METRE') {
            value = 0.91;
        }
        // Créer la conversion
        const conversion = yield db_config_1.default.conversion.create({
            data: {
                fromUnitId,
                toUnitId,
                value
            }
        });
        return res.status(201).json({ message: 'Conversion created successfully.', conversion });
    }
    catch (error) {
        console.error('Error creating conversion:', error);
        return res.status(500).json({ message: 'An error occurred while creating the conversion.', error });
    }
});
exports.createConversion = createConversion;
