const express = require("express");
const ticketController = require("../controllers/Ticket.controller");

const router = express.Router();

router.post("/create", ticketController.createTicket);
router.get("/", ticketController.getTickets);
router.get("/", ticketController.getTicketById);
router.delete("/:id", ticketController.deleteTicket);

export default router;