	var request = require('request');
	var parseString = require('xml2js').parseString;
	var AWS = require('aws-sdk');

	var express = require('express')
	var app = express()

	AWS.config.update({
	  region: "us-west-1"
	});
	'use strict';

	module.exports.hello = (event, context, callback) => {
	  const response = {
	    statusCode: 200,
			headers{
				"Access-Control-Allow-Origin" : "*"
			},
	    body: JSON.stringify({
	      message: 'Wait time has been updated!'
	    }),
	  };

	  fetchlocations();
	  callback(null, response);
	};

	module.exports.onScan = (event, context, callback) => {
	  onScan(event.pathParameters.name, callback);
	};



	var docClient = new AWS.DynamoDB.DocumentClient();
	var table = "cs499-busdb";

function fetchlocations() {
  request('https://rqato4w151.execute-api.us-west-1.amazonaws.com/dev/info', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // console.log(body);
        parseString(body, function (err, result) {
          // console.dir(result.rss.channel[0].item);
          var items = result.rss.channel[0].item;
          for(var i = 0; i < items.length; i++) {
            console.log(items[i].title[0], items[i].description[0]);
            putItem(items[i].title[0], items[i].description[0]);
          }
        });
      }
    })
}

	function putItem(id, logo, lat, lng) {
		var params = {
		    TableName:table,
		    Item:{
		        "id": id,
		        "timestamp": Date.now(),
		        "logo": logo,
						"lat": lat,
						"lng": lng,

		    }
		};

		console.log("Adding a new item...");
		docClient.put(params, function(err, data) {
		    if (err) {
		        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		    } else {
		        console.log("Added item:", JSON.stringify(data, null, 2));
		    }
		});
	}


function onScan(err, data){


 if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
				if (callback) {
					const responseErr = {
						statusCode: 500,
						body: JSON.stringify({'err' : err}),
					};
					callback(null, responseErr);
				}
    } else {
	        console.log("Scan succeeded.");
        data.Items.forEach(function(bus) {
           console.log(bus);
        });

				if (callback) {
					const responseOk = {
						statusCode: 200,
						body: JSON.stringify(data.Items),
					};
					callback(null, responseOk);
				}
        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }]
    }

}
