require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var config = require('./config')
var cors = require('cors')
const socketIO = require('socket.io');
var app = express();
var fn = require('./utils/fn')
var schemas = require('./models/schemas');
var cron = require('node-cron')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
  origin: config.origins,
  credentials: true
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log(config)


var jwt_decode = require('jwt-decode');
const { json } = require('express');

let procesos = {
  getPosition:
  {
    'status': true,
    'times': '*/5 * * * *'
    //'times': '1,10,20,30,40,50 * * * * *' 
  },
  validateTimeService:
  {
    'status': true,
    'times': '15,30,45,59 * * * * *'
  }
}

const server = http.Server(app);
const io = socketIO(server)
var nsp = io.of(config.namespace)

nsp.on('connection', function (socket) {
  console.log(`Connected ${socket.id} ` + new Date())
  if (socket.handshake.query.token !== "null" || socket.handshake.headers.token !== "null") {
    let user = jwt_decode(socket.handshake.query.token ? socket.handshake.query.token : socket.handshake.headers.token)
    socket.join(user.id)
    console.log('--------------------------------------')
    console.log('Cliente connected : ' + socket.id)
    console.log(user)
    // console.log(user)
    console.log('--------------------------------------\n')
  }


  // let user = jwt_decode(socket.handshake.headers.token);
  // console.log( 'socket.handshake.headers', socket.handshake.headers ) 
  // console.log( 'user', user ) 
  // connectUser( user ,socket.id )

  // setTimeout(() => {
  //   console.log('Obteniendo posicion')
  //   socket.emit('onLocation', {'name': 'Nelson Torres'})

  // }, 5000);

  socket.on('onCreateService', function (data) {
    console.log('data', data)
    io.sockets.emit('onCreatedService', {
      data
    })

  })
  socket.on('msg', function (data) {
    console.log('msg', data)

  })

  socket.on('onMessage', function (data) {
    let user = jwt_decode(data.token);

    console.log('\n\n')
    //console.log( 'msg', data )
    console.log('user', user)


    const message = new schemas.Message({
      message: data.message,
      from: user.id,
      to: data.to
    })

    console.log('to:::::', data.to)
    console.log('me:::::', data.message)
    console.log('so:::::', data.socket)



    schemas.Person.findById(data.to, (error, person) => {
      socket.broadcast.to(person.socket).emit('onMessage', data.message)
    })
    //io.to(`${data.to}`).emit('onMessage', data.message )
    message.save()

  })

  socket.on('onPosition', function (data) {
    let user = jwt_decode(socket.handshake.headers.token);
    console.log('user', user)
    console.log(data)
    data.date = new Date()

    schemas.Person.updateOne({ "_id": user.id },
      {
        $set: { "position": data }
      },
      {
        multi: true
      },
      function (err, docs) {
        if (err)
          console.log(err);
        else {
        }
      });
  })

  socket.on('disconnect', function () {

    // let user = jwt_decode(socket.handshake.headers.token)
    // //io.sockets.emit('onDisconnect', user )
    // disconnectUser( user )
    console.log(`Disconnect ${socket.id}`)
    //connectUser( user )
  })
})

connectUser = (user, socketId) => {
  console.log(' ********* connectUser ******** ')
  console.log(user.id)
  console.log(socketId)

  schemas.Person.updateOne({ _id: user.id }, {
    'connected': true,
    'socket': socketId

  }).exec()
}
disconnectUser = user => {

  schemas.Person.updateOne({ _id: user.id }, {
    'connected': false,
    'socket': ''
  }).exec()
}

cron.schedule(procesos.getPosition.times, function () {
  console.log('getPosition', new Date())
  //io.sockets.emit('onLocation', {'name': 'Nelson Torres'})

})
cron.schedule(procesos.validateTimeService.times, function () {
  console.log('validateTimeService', new Date())

  schemas.Service.find({ status: 'started' }, { startTime: 1, endTime: 1, hours: 1 })
    .populate({ path: 'customer', select: { token: 1 } })
    .populate({ path: 'engineer', select: { token: 1 } })
    .populate({ path: 'technical', select: { token: 1 } })
    .exec(function (error, data) {
      // console.log(data)
      data.forEach(element => {

        if (element.startTime) {
          let currentMinutes = diff_minutes(new Date(), element.startTime)
          let totalMinutes = element.hours * 60
          console.log('totalMinutes', totalMinutes)
          console.log('minutes', currentMinutes)
          console.log('remaining', totalMinutes - currentMinutes)
          if ((totalMinutes - currentMinutes) == 10) {

            let tmpCustomer = JSON.stringify(element.customer)
            let customer = JSON.parse(tmpCustomer)

            let tmpTechnical = JSON.stringify(element.technical)
            let technical = JSON.parse(tmpTechnical)

            let tmpEngineer = JSON.stringify(element.engineer)
            let engineer = JSON.parse(tmpEngineer)

            let usrEnterpricePosition = technical
            if (engineer != null)
              usrEnterpricePosition = engineer

            let data = {
              "click_action": "FLUTTER_NOTIFICATION_CLICK",
              "info": {
                'event': 'timeOutService'
              }
            }

            console.log(usrEnterpricePosition.token)
            console.log(customer.token)
            fn.sendNotification(usrEnterpricePosition.token, 'Notificación', 'El servicio esta por finalizar', data)
            fn.sendNotification(customer.token, 'Notificación', 'El servicio esta por finalizar', data)
          }

        }

      });
    })
  //io.sockets.emit('onLocation', {'name': 'Nelson Torres'})

})

function diff_minutes(dt2, dt1) {

  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));

}



server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

module.exports = app;
