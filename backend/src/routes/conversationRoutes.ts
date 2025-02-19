import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import { createConversation, getConversation, getConversationsDM, sendMessage } from "../controllers/conversationController";

const router = express.Router();

// Get the most recent conversations for dms - determined by updatedByDate
router.get("/dm", protectRoute, getConversationsDM);

router.get("/:conversationId", protectRoute, getConversation);

router.post("/:userId", protectRoute, createConversation);

router.post("/message/:conversationId", protectRoute, sendMessage);



// Get the most recent conversations for group - determined by updatedBy date

// Get the most recent conversations for friend - determined by updatedByDate

// GET - get the details of a conversation asociated with a converesation ID

// CREATE a new conversation (between two people)

// POST - send a message in a conversation



export default router;