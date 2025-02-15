"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversionController_1 = require("../controllers/conversionController");
const router = (0, express_1.Router)();
router.post('/create', conversionController_1.createConversion);
exports.default = router;
