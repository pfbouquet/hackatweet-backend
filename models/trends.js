const mongoose = require('mongoose')

const TrendSchema = mongoose.Schema({
    name:String,
    kicks:[{type:mongoose.Types.ObjectId, ref:'kicks'}]
})

const Trend = mongoose.model('trends', TrendSchema)

module.exports = Trend