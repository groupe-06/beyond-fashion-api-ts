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
exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getAllRoles = exports.createRole = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: 'Missing required field: name' });
        }
        const existingRole = yield db_config_1.default.role.findFirst({
            where: { name },
        });
        if (existingRole) {
            return res.status(400).json({ message: 'Role with name ' + name + ' already exists' });
        }
        const role = yield db_config_1.default.role.create({
            data: { name },
        });
        res.status(201).json({ message: 'Role created successfully', role });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create role', error });
    }
});
exports.createRole = createRole;
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield db_config_1.default.role.findMany();
        res.json({ message: 'Roles fetched successfully', roles });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch roles', error });
    }
});
exports.getAllRoles = getAllRoles;
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const role = yield db_config_1.default.role.findUnique({
            where: { id: Number(id) },
        });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json({ message: 'Role fetched successfully', role });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch role', error });
    }
});
exports.getRoleById = getRoleById;
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const role = yield db_config_1.default.role.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json({ message: 'Role updated successfully', role });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update role', error });
    }
});
exports.updateRole = updateRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield db_config_1.default.role.delete({
            where: { id: Number(id) },
        });
        res.status(204).json({ message: 'Role deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete role', error });
    }
});
exports.deleteRole = deleteRole;
