var express = require('express');
var app = express();

var port = process.env.PORT || 3000;

app.listen(port);

app.get('/', function (res, req) {
  req.send(`The test page scans the QR code, but there's nothing here: D`);
})

app.get('/hr-qrcode', function (res, req) {
  try {
    req.sendFile(__dirname + '/index.html');
  } catch (error) {
    console.log('error', error)
  }
});