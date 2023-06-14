const http = require('http');
const fs = require('fs');


const callback = (request, response) => {

	if (request.url === '/') {
		fs.readFile('./readFiles/index.txt', 'utf8', (err, data) => {
		    if (err) {
		      response.writeHead(500, { 'Content-Type': 'text/plain' });
		      response.end('Error reading the file');
		    } else {
		      response.writeHead(200, { 'Content-Type': 'text/plain' });
		      response.end(data);
		    }
  		});
	}

	if (request.url === '/html') {
		fs.readFile('./readFiles/index.html', 'utf8', (err, data) => {
		    if (err) {
		      response.writeHead(500, { 'Content-Type': 'text/html' });
		      response.end('Error reading the file');
		    } else {
		      response.writeHead(200, { 'Content-Type': 'text/html' });
		      response.end(data);
		    }
	  	});
	}

	if (request.url === '/js') {
		fs.readFile('./readFiles/index.js', 'utf8', (err, data) => {
		    if (err) {
		      response.writeHead(500, { 'Content-Type': 'application/javascript' });
		      response.end('Error reading the file');
		    } else {
		      response.writeHead(200, { 'Content-Type': 'application/javascript' });
		      response.end(data);
		    }
  		});
	}
	
} 

const server = http.createServer(callback)

server.listen(3333)