const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    visits: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stats', StatsSchema);
