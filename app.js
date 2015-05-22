var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Epub = require("epub-gen");
var path = require('path');
var app     = express();

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/scrape', jsonParser, function(req, res){
	var url = 'https://en.wikipedia.org/wiki/Squirrel';
	//var url = req.body.url;
	//console.log(req.body);

	request(url, function(error, response, html){
		if(!error){

			var $ = cheerio.load(html);

			// EPub
			var file = Date.now() + ".epub";
			var options = {
					title: "test",
					author: "Me", // *Required, name of the author.
					cover: "http://lorempixel.com/output/abstract-h-c-768-1004-5.jpg",
					content: [
							{
									title: "Chapter 1", // Optional
									author: "author", // Optional
									data: "<h1>Learning JavaScript Design Patterns</h1>"
							},
							{
									title: "Chapter 2",
									data: "<h1>Monkies</h1>"
							}
					]
			};

			options.title = $('#firstHeading').text();
			options.publisher = $('#siteSub').text();
			options.cover = "http:" + $('.infobox img').first().attr('src');

			new Epub(options, "bin/" + file);

			res.render('scrape', { title: 'Scrape', message: 'Download your File', file: file});

		} else {

			res.render('scrape', { title: 'Scrape', message: 'OOPS something went wrong', file: ''});

		}
	})
})

// Download
app.get('/download/:id', function(req, res){
  var file = __dirname + '/bin/'+req.params.id;
  var filename = path.basename(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', 'application/epub+zip');

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
});

app.get('/', function(req, res){

	  res.render('index', { title: 'EPub Generator'});

})


app.set('view engine', 'jade');


app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
