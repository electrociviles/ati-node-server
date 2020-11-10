var mongoose = require("mongoose")
var config = require('../config')

mongoose.Promise = global.Promise


if (process.env.NODE_ENV == 'production') {
    mongoose.connect(config.db.url, {
        'auth': { 'authSource': 'admin' },
        'user': config.db.user,
        'pass': config.db.pass,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}
else {
    mongoose.connect(config.db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    mongoose.set('useFindAndModify', false)
}

const messageSchema = new mongoose.Schema({
    message: String,
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'person', autopopulate: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'person', autopopulate: true },
    date: { type: Date, default: Date.now() }
})
messageSchema.plugin(require('mongoose-autopopulate'))
const Message = mongoose.model('message', messageSchema)

const personSchema = new mongoose.Schema({
    businessName: String,
    names: String,
    surnames: String,
    documentNumber: String,
    checkDigit: Number,
    salary: Number,
    dateOfBirth: Date,
    email: String,
    address: String,
    username: String,
    password: String,
    photo: String,
    connected: { type: Boolean, default: false },
    socket: String,
    position: [],
    phoneId: String,
    latitude: Number,
    longitude: Number,
})
const Person = mongoose.model('person', personSchema)

const serviceSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    status: String,
    date: { type: Date, default: Date.now() },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'person' },
    packs_service: [{ type: mongoose.Schema.Types.ObjectId, ref: 'packs_service' }],
    typeService: Number,
    technical: { type: mongoose.Schema.Types.ObjectId, ref: 'person' },
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'person' },
    description: String,
    acceptCustomer: String,
    startTime: { type: Date },
    endTime: { type: Date },
    hours: Number
})
const Service = mongoose.model('service', serviceSchema)

var schemas =
{
    Message,
    Person,
    Service,


}
module.exports = schemas