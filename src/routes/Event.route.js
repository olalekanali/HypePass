const express = require("express");
const { protect } = require("../middlewares/Auth.middleware");
const { authorizeRoles } = require("../middlewares/Role.middleware");
const eventController = require("../controllers/Event.controller");

const router = express.Router();

router.get("/", eventController.getEvents);
router.get("/:id", protect, authorizeRoles("user", "admin"), eventController.getEventById);
router.post("/create", protect, authorizeRoles("user", "admin"), eventController.createEvent);
router.put("/:id", protect, authorizeRoles("user", "admin"), eventController.updateEvent);
router.delete("/:id", protect, authorizeRoles("user", "admin"), eventController.deleteEvent);

module.exports = router;