import {Router} from "express";
import { createMessage, getMessages } from "../controllers/messageController";
import { getToken } from "../middlewares/authMiddlewares";

const router = Router();

router.post("/new", getToken, createMessage);
router.get("/connected-user", getToken, getMessages);
router.delete("/delete/:id", getToken, getMessages);

export default router;