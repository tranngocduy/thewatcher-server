const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const request = require('request');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const https = require('https');
const fs = require('fs');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const time = '*/1 * * * *';

let token = null;
let isSend = false;

function pushNotification(data) {
  axios({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: 'https://exp.host/--/api/v2/push/send',
    data: {
      "to": "" + token,
      ...data
    }
  })
}

function crawlData() {
  request("https://divineshop.vn/index.php?route=product/search&tag=garena", (error, response, body) => {
    if (error) {
      console.log('error')
    } else {
      $ = cheerio.load(body);
      const ds = $(body).find('.product-thumb');
      if (!!(ds.length !== 2) && !isSend) {
        isSend = true;
        const data = {
          "title": "Divineshop",
          "body": "Thay đổi khyến mãi sò !!!"
        }
        pushNotification(data);
      } else if (isSend) {
        isSend = false;
      }

      let contentTxt = "";
      if (fs.existsSync('log.txt')) {
        contentTxt = fs.readFileSync('log.txt', 'utf8');
        const list = contentTxt.split('<br />');
        const timeStart = list[0].split(' - ');
        const countTime = new Date() - new Date(timeStart[0]);
        if (countTime >= 864000000) {
          fs.unlinkSync('log.txt')
          contentTxt = "";
        }
      }

      const valueTxt = contentTxt + (contentTxt.length > 0 ? "\n<br />" : "") + new Date() + " - count : " + ds.length;

      fs.writeFile('log.txt', valueTxt, { encoding: 'utf8' }, function (err) {
        if (err)
          return console.log(err);
        console.log('Wrote Hello World in file helloworld.txt, just check it');
      });
    }
  });
}

app.post('/registerToken', (req, res) => {
  const newToken = req.body.token;
  if (newToken && newToken.length > 0) {
    if (!token || (newToken && (token !== newToken))) {
      token = newToken;
      res.send({ isSuccess: true, message: '' });
    } else {
      res.send({ isSuccess: false, message: 'Thiết bị đã dc đăng kí' });
    }
  } else {
    res.send({ isSuccess: false, message: '' });
  }
});

app.get('/', function (req, res) {
  let contentTxt = 'Đang kiểm tra ...';
  if (fs.existsSync('log.txt')) {
    contentTxt = fs.readFileSync('log.txt', 'utf8');
  }
  res.send('</div>' + contentTxt + '</div>');
});

app.listen(port, () => {
  schedule.scheduleJob(time, function () {
    crawlData();
  });
  setInterval(function () {
    https.get("https://thewatcher-server.herokuapp.com/");
  }, 600000); // every 5 minutes (300000)
});