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
exports.getMeasurementsbis = exports.getMeasurements = exports.deleteMeasurement = exports.updateMeasurement = exports.addMeasurement = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const addMeasurement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shoulder, chest, waist, hips, sleeveLength, neck, back, armhole, thigh, calf, bust, inseam } = req.body;
    const userId = req.userId;
    // Convertir les valeurs en Float ou null si elles sont non définies ou vides
    const toFloat = (value) => value ? parseFloat(value) : null;
    try {
        const user = yield db_config_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.gender === 'MALE') {
            const maleMeasurement = yield db_config_1.default.maleMeasurement.create({
                data: {
                    userId,
                    shoulder: toFloat(shoulder),
                    chest: toFloat(chest),
                    waist: toFloat(waist),
                    hips: toFloat(hips),
                    sleeveLength: toFloat(sleeveLength),
                    neck: toFloat(neck),
                    back: toFloat(back),
                    armhole: toFloat(armhole),
                    thigh: toFloat(thigh),
                    calf: toFloat(calf)
                }
            });
            return res.status(201).json(maleMeasurement);
        }
        else if (user.gender === 'FEMALE') {
            const femaleMeasurement = yield db_config_1.default.femaleMeasurement.create({
                data: {
                    userId,
                    shoulder: toFloat(shoulder),
                    chest: toFloat(chest),
                    waist: toFloat(waist),
                    hips: toFloat(hips),
                    bust: toFloat(bust),
                    inseam: toFloat(inseam),
                    thigh: toFloat(thigh)
                }
            });
            return res.status(201).json(femaleMeasurement);
        }
        else {
            return res.status(400).json({ message: 'Invalid gender' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
});
exports.addMeasurement = addMeasurement;
const updateMeasurement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const measurementId = req.params.id;
    try {
        const user = yield db_config_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Transformer les données reçues en float
        const data = Object.fromEntries(Object.entries(req.body).map(([key, value]) => [key, parseFloat(value)]));
        if (user.gender === 'MALE') {
            const updatedMaleMeasurement = yield db_config_1.default.maleMeasurement.update({
                where: { id: Number(measurementId) },
                data: Object.assign({}, data)
            });
            return res.status(200).json(updatedMaleMeasurement);
        }
        else if (user.gender === 'FEMALE') {
            const updatedFemaleMeasurement = yield db_config_1.default.femaleMeasurement.update({
                where: { id: Number(measurementId) },
                data: Object.assign({}, data)
            });
            return res.status(200).json(updatedFemaleMeasurement);
        }
        else {
            return res.status(400).json({ message: 'Invalid gender' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
});
exports.updateMeasurement = updateMeasurement;
const deleteMeasurement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const measurementId = req.params.id;
    try {
        const user = yield db_config_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.gender === 'MALE') {
            yield db_config_1.default.maleMeasurement.delete({ where: { id: Number(measurementId) } });
            return res.status(204).json({ message: 'Male measurement deleted' });
        }
        else if (user.gender === 'FEMALE') {
            yield db_config_1.default.femaleMeasurement.delete({ where: { id: Number(measurementId) } });
            return res.status(204).json({ message: 'Female measurement deleted' });
        }
        else {
            return res.status(400).json({ message: 'Invalid gender' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
});
exports.deleteMeasurement = deleteMeasurement;
const getMeasurements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const user = yield db_config_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.gender === 'MALE') {
            const data = yield db_config_1.default.maleMeasurement.findMany({ where: { userId } });
            return res.status(200).json({ message: 'Mesures récupérées avec succès', data });
        }
        else if (user.gender === 'FEMALE') {
            const data = yield db_config_1.default.femaleMeasurement.findMany({ where: { userId } });
            return res.status(200).json({ message: 'Mesures récupérées avec succès', data });
        }
        else {
            return res.status(400).json({ message: 'Invalid gender' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
});
exports.getMeasurements = getMeasurements;
const getMeasurementsbis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    console.log('Requested userId:', userId);
    if (!userId) {
        console.error('UserId is missing in the request params');
        return res.status(400).json({ error: 'UserId is required' });
    }
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        console.error('Invalid userId format:', userId);
        return res.status(400).json({ error: 'Invalid userId format' });
    }
    try {
        const user = yield db_config_1.default.user.findUnique({
            where: { id: parsedUserId },
            select: { id: true, gender: true }
        });
        console.log('User found:', user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let data;
        if (user.gender === 'MALE') {
            data = yield db_config_1.default.maleMeasurement.findMany({ where: { userId: user.id } });
        }
        else if (user.gender === 'FEMALE') {
            data = yield db_config_1.default.femaleMeasurement.findMany({ where: { userId: user.id } });
        }
        else {
            return res.status(400).json({ message: 'Invalid gender' });
        }
        console.log('Measurements found:', data);
        return res.status(200).json({ message: 'Mesures récupérées avec succès', data });
    }
    catch (error) {
        console.error('Error in getMeasurementsbis:', error);
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unknown error occurred' });
    }
});
exports.getMeasurementsbis = getMeasurementsbis;
