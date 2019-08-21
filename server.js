const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

const apiKey = '****';
const client_id = '****';
const client_secret = '****';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;

  var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
  var options = {
       url: api_url,
       form: {'source':'ko', 'target':'en', 'text':city},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
      let transCity = JSON.parse(body)
      let url = `http://api.openweathermap.org/data/2.5/weather?q=${transCity.message.result.translatedText}&units=imperial&appid=${apiKey}`

      request(url, function (err, response, body) {
        if(err){
          res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
          let weather = JSON.parse(body)
          if(weather.main == undefined){
            res.render('index', {weather: null, error: 'Error, please try again'});
          } else {
            let tempC = ((weather.main.temp - 32) / 1.8).toFixed(1)
            let weatherText = `It's ${tempC}° in ${city}!`;
            res.render('index', {weather: weatherText, error: null});
          }
        }
      });

    } else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
    }
  });
})

app.listen(8080, function () {
  console.log('Weather app listening on port 8080!')
})
