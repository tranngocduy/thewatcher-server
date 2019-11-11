const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const request = require('request');
const cheerio = require('cheerio');
const schedule = require('node-schedule');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let token = null;
const time = '*/30 * * * * *';
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

app.post('/registerToken', (req, res) => {
  const newToken = req.body.token;
  if (newToken && newToken.length > 0) {
    if (!token || (newToken && (token !== newToken))) {
      token = newToken;
      res.send('Thành công');
    }
  } else {
    res.send('Có lỗi xảy ra');
  }
});

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
    }
  });
}

app.listen(3000, () => {
  schedule.scheduleJob(time, function (fireDate) {
    crawlData();
  });
});