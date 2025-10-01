const Ticket = require('../models/Ticket.model');
const Event = require('../models/Event.model');

// Create a new ticket
exports.createTicket = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid ticket quantity' });
        }

        if (event.availableTickets < quantity) {
            return res.status(400).json({ error: 'Not enough tickets available' });
        }

        const totalPrice = event.price * quantity;

        const ticket = new Ticket({
            event: eventId,
            buyer: req.user._id,
            quantity,
            totalPrice,
            status: 'confirmed'
        });

        event.availableTickets -= quantity;

        await event.save();
        await ticket.save();

        res.status(201).json({
            ticketId: ticket._id,
            totalPrice: ticket.totalPrice,
            event: ticket.event,
            quantity: ticket.quantity,
            status: ticket.status
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all tickets for buyer or admin with pagination and filters
exports.getTickets = async (req, res) => {
    try {
        let { page = 1, limit = 10, status, event, title } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const filter = {};

        if (status) filter.status = status;

        if (req.user.role === 'buyer') {
            filter.buyer = req.user._id;
        }

        if (event && title) {
            const matchingEvents = await Event.find({
                _id: event,
                title: new RegExp(title, 'i')
            }).select('_id');
            filter.event = { $in: matchingEvents.map(e => e._id) };
        } else if (title) {
            const matchingEvents = await Event.find({ title: new RegExp(title, 'i') }).select('_id');
            filter.event = { $in: matchingEvents.map(e => e._id) };
        } else if (event) {
            filter.event = event;
        }

        const tickets = await Ticket.find(filter)
            .populate('event')
            .populate('buyer')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1 });

        const total = await Ticket.countDocuments(filter);

        res.status(200).json({
            tickets,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get a specific ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId).populate('event').populate('buyer');

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (req.user.role === 'buyer' && ticket.buyer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Cancel a ticket (soft delete + restore availability)
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket doesn't exist" });
        }

        if (ticket.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized! Only ticket holders or admins can cancel tickets.' });
        }

        if (ticket.status === 'cancelled') {
            return res.status(400).json({ message: 'Ticket is already cancelled.' });
        }

        // Update ticket status
        ticket.status = 'cancelled';
        await ticket.save();

        // Restore available tickets for the event
        const event = await Event.findById(ticket.event);
        if (event) {
            event.availableTickets += ticket.quantity;
            await event.save();
        }

        res.status(200).json({ message: 'Ticket cancelled successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};