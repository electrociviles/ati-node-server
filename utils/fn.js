exports.sendNotification = (id, _title, _body, _data) => {

    var FCM = require('fcm-node');
    var serverKey = 'AAAA_f0biIE:APA91bEbpCRaYEGV-t9scYujRbgPnUSjCwEhSkgyzoFiXtFpV8Mdj_fuPBP4A3qNkF7Vn1KPHh9Iw5uhqbFZbEazhFCaN2oRfg_3MGOFrR7WRG5wQJKQYRxSRyw9fcoSWfUqKsCUbB0X'; //put your server key here
    var fcm = new FCM(serverKey);
    var message =
    {
        to: id,
        //registration_ids: registration_ids,
        notification:
        {
            title: _title,
            body: _body
        },
        data: _data
        // data: {
        //     "Comida": "Comida desde postman mm"
        // }   
    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log(':::::::::::::::::::::response:::::::::::::::::::::::::::::::::::::')
            console.log(response)
            console.log(':::::::::::::::::::::error:::::::::::::::::::::::::::::::::::::')
            console.log(err);
            console.log(':::::::::::::::::::::error:::::::::::::::::::::::::::::::::::::')
        }
        else {
            console.log("Successfully sent with response: ", response);
        }
    });

}
