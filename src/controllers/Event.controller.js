const Event = require('../models/Event.model');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, venue, totalTickets, price} = req.body;
        // Validate input
        if (!title || !description || !date || !venue || !totalTickets || !price) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Create event using the input data
        const event = await Event.create({ title, description, date, venue, totalTickets, availableTickets: totalTickets, price, createdBy: req.user.id });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Read all events with pagination and search by title filtering
exports.getEvents = async (req, res) => {
    try {
        let { page = 1, limit = 10, date, venue, title } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const filter = {};
        if (date) {
            filter.date = date;
        }
        if (venue) {
            filter.venue = venue;
        }
        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // Case-insensitive search
        }

        const events = await Event.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ date: 1 }); // Sort by date ascending
        const total = await Event.countDocuments(filter);

        res.status(200).json({
            events,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Read a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Update an event by ID by an admin or the event creator
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is the event creator or an admin
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized! Only event creators or admins can update events.' });
        }

        const { title, description, date, venue, totalTickets, price } = req.body;
        // Update event fields if provided
        if (title) event.title = title;
        if (description) event.description = description;
        if (date) event.date = date;
        if (venue) event.venue = venue;
        if (price) event.price = price;

        // Adjust availableTickets if totalTickets changed
        if (totalTickets !== event.totalTickets) {
            event.availableTickets = totalTickets - (event.totalTickets - event.availableTickets);
        }

        await event.save();
        res.status(200).json(event);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete an event by ID by an admin or the event creator
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Check if the user is the event creator or an admin
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized! Only event creators or admins can delete events.' });
        }

        await event.remove();
        res.status(204).json({ message: 'Event deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
