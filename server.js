const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

const apiKey = '****';
const clientId = '****';
const clientSecret = '****';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;

  function getCityWeather(cityName) {
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`

    request(url, function (err, response, body) {
      if(err){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let weather = JSON.parse(body)
        if(weather.main == undefined){
          res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
          let tempC = ((weather.main.temp - 32) / 1.8).toFixed(1)
          let weatherText = `It's ${tempC}°C in ${city}!`;
          res.render('index', {weather: weatherText, error: null});
        }
      }
    })
  }

  let patternEng = /[a-zA-Z]/;

  if(!patternEng.test(city)) {
    var apiUrl = 'https://openapi.naver.com/v1/papago/n2mt';
    var options = {
       url: apiUrl,
       form: {'source':'ko', 'target':'en', 'text':city},
       headers: {'X-Naver-Client-Id':clientId, 'X-Naver-Client-Secret': clientSecret}
    };
    request.post(options, function (err, response, body) {
      if(err){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let transCity = JSON.parse(body)
        if(transCity == undefined){
          res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
          getCityWeather(transCity.message.result.translatedText)
        }
      }
    })
  }else {
    getCityWeather(city)
  }
})

app.listen(8080, function () {
  console.log('Weather app listening on port 8080!')
})
