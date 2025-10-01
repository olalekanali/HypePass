const express = require("express");
const { protect } = require("../middlewares/Auth.middleware");
const { authorizeRoles } = require("../middlewares/Role.middleware");
const ticketController = require("../controllers/Ticket.controller");

const router = express.Router();

router.post("/create",  ticketController.createTicket);
router.get("/", protect, authorizeRoles("user", "admin"), ticketController.getTickets);
router.get("/:id", protect, authorizeRoles("user", "admin"), ticketController.getTicketById);
router.delete("/:id", protect, authorizeRoles("user", "admin"), ticketController.deleteTicket);

module.exports = router;