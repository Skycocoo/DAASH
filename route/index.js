// Created by Yuxi Luo, July 2018

const express = require('express');
const fetch = require('node-fetch');
const phq = require('predicthq');
let client = new phq.Client({access_token: "BsTZYhJxF0jBXE9GG7a0e7zM4JyNq9", fetch: fetch});
const request = require('request');


function findPastData(state, county) {
    request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=state%20eq%20%27${state}%27%20and%20declaredCountyArea%20eq%20%27${county}%20(County)%27`, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.
    });
}

// findPastData('NE', 'Pawnee');

function findRecentData(radius, latlong, endDate, startDate) {
    client.events.search({category: 'disasters, severe-weather', within: `${radius}km@${latlong}`,
        'end.lte': endDate, 'start.gte': startDate})
        .then((results)=>{
            for (let event of results) {
                console.log(event.title);
            }
        });
}

// findRecentData(20, '39.9526,-75.1652', '2018-09-08', '2018-09-01');

function findCurrentData(radius, latlong, activeDate) {
    client.events.search({category: 'disasters, severe-weather', within: `${radius}km@${latlong}`, 'active.gte': activeDate})
        .then((results)=>{
            for (let event of results) {
                console.log(event.title);
            }
        });
}


module.exports = () => {
    const router = express.Router();

    const latlong = '39.9526,-75.1652';
    const radius = '20km';
    const date = '2018-09-01';



    router.get('/', (req, res, next) => {
        client.events.search({category: 'disasters, severe-weather', within: `${radius}@${latlong}`, 'active.gte': date})
            .then((results)=>{
                let data = [];
                for (let event of results) {
                    // console.log(event.title);
                    data.push(event.title);
                }
                res.render('index', {data: data});
            });
    });

    return router;
};
