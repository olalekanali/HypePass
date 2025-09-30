const express = require("express");
const eventController = require("../controllers/Event.controller");

const router = express.Router();

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.post("/create", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;