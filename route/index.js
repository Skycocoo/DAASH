// Created by Yuxi Luo, July 2018

const express = require('express');
const fetch = require('node-fetch');
const phq = require('predicthq');
let client = new phq.Client({access_token: "BsTZYhJxF0jBXE9GG7a0e7zM4JyNq9", fetch: fetch});


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
