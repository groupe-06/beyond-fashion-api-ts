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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.INFOBIP_API_KEY;
const baseUrl = process.env.INFOBIP_BASE_URL;
const sendSMS = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`${baseUrl}/sms/2/text/advanced`, {
            messages: [
                {
                    from: "InfoSMS",
                    destinations: [
                        {
                            to: phoneNumber
                        }
                    ],
                    text: message
                }
            ]
        }, {
            headers: {
                Authorization: `App ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SMS sent successfully:', response.data);
        console.log('Sending SMS with the following details:');
        console.log(`Phone Number: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log('API Key:', apiKey);
        console.log('Base URL:', baseUrl);
    }
    catch (error) {
        console.error('Error sending SMS:', error);
    }
});
exports.default = sendSMS;
