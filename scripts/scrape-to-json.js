const fs = require('fs');

const request = require('request');

const config = require('./../config/config.json');

let objects = [];

let url = `http://api.thewalters.org/v1/collections/7/objects.json?pagesize=100&apikey=${
	config.api_key
}&page=`;

let index = 1;

const getPage = () => {
	request.get(url + index, (error, response, body) => {
		const jsonBody = JSON.parse(body);
		console.log(`Getting through ${index * 100}`);
		objects = objects.concat(jsonBody['Items']);
		fs.writeFile('objects.json', JSON.stringify(objects, null, 2), err => {
			console.log(err ? err : 'File written.');
			if (jsonBody.NextPage) {
				index++;
				setTimeout(getPage, 1000);
			}
		});
	});
};

getPage();
