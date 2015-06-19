var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Epub = require("epub-gen");
var path = require('path');
var ContentParse = require('./modules/contentparser.js');
var app     = express();

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/scrape', jsonParser, function(req, res){
	//var url = 'https://en.wikipedia.org/wiki/Squirrel';
	console.log(req.query.url);
	var url = req.query.url;

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			// EPub
			var file = Date.now() + ".epub";
			var options = {
					title: "",
					author: "Me", // *Required, name of the author.
					cover: "http://lorempixel.com/output/abstract-h-c-768-1004-5.jpg",
					content: [
							{
									title: "Chapter 1", // Optional
									data: 'monkies'
							}
					],
					css: "p{margin-bottom:20px}"
			};

			options.title = $('#firstHeading').text();
			options.publisher = $('#siteSub').text();
			options.cover = "http:" + $('#mw-content-text img').first().attr('src');
			//options.cover = "http://upload.wikimedia.org/wikipedia/commons/thumb/1/14/The_Moonshine_Man_of_Kentucky_Harper%27s_Weekly_1877.jpg/290px-The_Moonshine_Man_of_Kentucky_Harper%27s_Weekly_1877.jpg"
			options.content[0].data = $('#mw-content-text').html();

			var count = -1;

			$('h2,table,p').each(function(i, element){

				if ( $(this)[0].name == 'h2' ) {
					count++;
					console.log(count);

					var title = $(this).text();
					options.content[count] = {};
					options.content[count].title = title.replace('[edit]', '').replace('\n','').replace('\r', '');
					options.content[count].data = '';
				} else {
					if (count > -1) {
						var content = new ContentParse($(this).html());
						options.content[count].data += content._html;
					}
				}
			});

			console.log(options);

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
