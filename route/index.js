// Created by Yuxi Luo, July 2018

const express = require('express');
const request = require('request');

const fetch = require('node-fetch');
const phq = require('predicthq');
let client = new phq.Client({access_token: "BsTZYhJxF0jBXE9GG7a0e7zM4JyNq9", fetch: fetch});
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bbc2f161eef842538b561fe4256186a0');
const nearbyCities = require("nearby-cities");

const firebase = require('firebase');
require("firebase/firestore");

// fetch data
function findPastData(state, county) {
    request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=state%20eq%20%27${state}%27%20and%20declaredCountyArea%20eq%20%27${county}%20(County)%27`, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.
    });
}

function findPastDataByState(state) {
    request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=state%20eq%20%27${state}%27`, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', JSON.parse(body)); // Print the HTML for the Google homepage.
    });
}

// findPastDataByState('NE');

function findRecentData(radius, lat, lng, endDate, startDate) {
    client.events.search({category: 'disasters, severe-weather', within: `${radius}km@${lat},${lng}`,
        'end.lte': endDate, 'start.gte': startDate})
        .then((results)=>{
            for (let event of results) {
                console.log(event.title);
            }
        });
}

// findRecentData(20, '39.9526,-75.1652', '2018-09-08', '2018-09-01');

function findDisaster(radius, lat, lng,  activeDate, callback) {
    let data = [];
    client.events.search({category: 'disasters, severe-weather', within: `${radius}km@${lat},${lng}`, 'active.gte': activeDate})
        .then((results)=>{
            for (let event of results) {
                console.log(JSON.stringify(event.labels));
                let markerInfo = {
                    title: event.title,
                    desc: event.description,
                    lat: event.location[1],
                    lng: event.location[0],
                    type: event.labels[0]
                };

                data.push(markerInfo);
            }
            // console.log(data);
            callback(data);
        });
}

function findNews(lat, lng) { // still kinda messed up, not sure why :((((((((
    const query = {latitude: lat, longitude: lng};
    const cities = nearbyCities(query);

    newsapi.v2.everything({
        q: `${cities[0]}`, // Add different disasters here
        // sources: 'reuters,associated-press,abc-news,cnn,mscnbc,cnbc',
        from: '2018-09-01',
        to: '2018-09-08',
        language: 'en',
        sortBy: 'relevancy'
    }).then(response => {
        response.articles.forEach((article) => {
            if (article.title.includes(`${city}`)) {
                console.log(article.title);
            }
        });

    });
}

findNews("Australia");
// firebase

function initFirebase () {
    firebase.initializeApp({
        apiKey: "AIzaSyBUYLldiIyrOQUwT8AYplBt35Utt7-QMLg",
        authDomain: "pennapps-resiliency.firebaseapp.com",
        databaseURL: "https://pennapps-resiliency.firebaseio.com",
        projectId: "pennapps-resiliency",
        storageBucket: "pennapps-resiliency.appspot.com",
        messagingSenderId: "527178300982"
    });

    // Initialize Cloud Firestore through Firebase
    var db = firebase.firestore();

    // Disable deprecated features
    db.settings({
        timestampsInSnapshots: true
    });

    // db.collection("users").add({
    //     first: "Ada",
    //     last: "Lovelace",
    //     born: 1815
    // }).then(function(docRef) {
    //     console.log("Document written with ID: ", docRef.id);
    // }).catch(function(error) {
    //     console.error("Error adding document: ", error);
    // });
    //
    // db.collection("users").get().then((querySnapshot) => {
    //     querySnapshot.forEach((doc) => {
    //         console.log(`${doc.id} => ${doc.data()}`);
    //     });
    // });
}

module.exports = () => {
    const router = express.Router();

    initFirebase();

    router.get('/', (req, res, next) => {
        res.render('index');
    });

    router.post('/curdata', (req, res, next) => {
        findDisaster(req.body.radius, req.body.lat, req.body.lng, req.body.date, (data) => {
            res.send(data);
        });
    });

    return router;
};
