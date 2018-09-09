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

const db = initFirebase();

// openfema database
function findPastDataByState(state, callback) {
    request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=state%20eq%20%27${state}%27`, function (error, response, body) {
        if (error) callback(error, []);
        callback(undefined, JSON.parse(body));
    });
}

function findDisaster(date, callback) {
    let data = [];
    request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=declarationDate%20gt%20%27${date}T04:00:00.000z%27`, function (error, response, body) {
        if (error) callback(error, []);

        JSON.parse(body).DisasterDeclarationsSummaries.forEach((disaster) => {
            if (disaster.incidentEndDate === undefined) {
                let markerInfo = {
                    title: disaster.title,
                    county: disaster.declaredCountyArea.split(" ")[0],
                    state: disaster.state,
                    type: disaster.incidentType
                };
                // console.log(disaster);
                data.push(markerInfo);
            }
        });
        callback(data);
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

function findNews(lat, lng, date, callback) {
    let news = [];
    const query = {latitude: lat, longitude: lng};
    const cities = nearbyCities(query);
    console.log(cities[0]);

    newsapi.v2.everything({
        q: `${cities[0].name}`, // Add different disasters here
        // sources: 'reuters,associated-press,abc-news,cnn,mscnbc,cnbc',
        from: date,
        language: 'en',
        sortBy: 'relevancy'
    }).then(response => {
        response.articles.forEach((article) => {
            if (article.title.includes(`${cities[0].name}`)) {
                newsArticle = {
                    title: article.title,
                    url: article.url,
                    img: article.urlToImage
                };

                news.push(newsArticle);
            }
        });
        callback(news);
    });
}


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
    let db = firebase.firestore();

    // Disable deprecated features
    db.settings({
        timestampsInSnapshots: true
    });

    return db;
}

function insertPastFirebase() {
    // https://gist.github.com/dsoverby1986/df89c1ed31f3b74b1b85c73bfae1d095
    let states = [
        { name: 'Alabama', abbrev: 'AL' },
        { name: 'Alaska', abbrev: 'AK' },
        { name: 'Arizona', abbrev: 'AZ' },
        { name: 'Arkansas', abbrev: 'AR' },
        { name: 'California', abbrev: 'CA' },
        { name: 'Colorado', abbrev: 'CO' },
        { name: 'Connecticut', abbrev: 'CT' },
        { name: 'Delaware', abbrev: 'DE' },
        { name: 'Florida', abbrev: 'FL' },
        { name: 'Georgia', abbrev: 'GA' },
        { name: 'Hawaii', abbrev: 'HI' },
        { name: 'Idaho', abbrev: 'ID' },
        { name: 'Illinois', abbrev: 'IL' },
        { name: 'Indiana', abbrev: 'IN' },
        { name: 'Iowa', abbrev: 'IA' },
        { name: 'Kansas', abbrev: 'KS' },
        { name: 'Kentucky', abbrev: 'KY' },
        { name: 'Louisiana', abbrev: 'LA' },
        { name: 'Maine', abbrev: 'ME' },
        { name: 'Maryland', abbrev: 'MD' },
        { name: 'Massachusetts', abbrev: 'MA' },
        { name: 'Michigan', abbrev: 'MI' },
        { name: 'Minnesota', abbrev: 'MN' },
        { name: 'Mississippi', abbrev: 'MS' },
        { name: 'Missouri', abbrev: 'MO' },
        { name: 'Montana', abbrev: 'MT' },
        { name: 'Nebraska', abbrev: 'NE' },
        { name: 'Nevada', abbrev: 'NV' },
        { name: 'New Hampshire', abbrev: 'NH' },
        { name: 'New Jersey', abbrev: 'NJ' },
        { name: 'New Mexico', abbrev: 'NM' },
        { name: 'New York', abbrev: 'NY' },
        { name: 'North Carolina', abbrev: 'NC' },
        { name: 'North Dakota', abbrev: 'ND' },
        { name: 'Ohio', abbrev: 'OH' },
        { name: 'Oklahoma', abbrev: 'OK' },
        { name: 'Oregon', abbrev: 'OR' },
        { name: 'Pennsylvania', abbrev: 'PA' },
        { name: 'Rhode Island', abbrev: 'RI' },
        { name: 'South Carolina', abbrev: 'SC' },
        { name: 'South Dakota', abbrev: 'SD' },
        { name: 'Tennessee', abbrev: 'TN' },
        { name: 'Texas', abbrev: 'TX' },
        { name: 'Utah', abbrev: 'UT' },
        { name: 'Vermont', abbrev: 'VT' },
        { name: 'Virginia', abbrev: 'VA' },
        { name: 'Washington', abbrev: 'WA' },
        { name: 'West Virginia', abbrev: 'WV' },
        { name: 'Wisconsin', abbrev: 'WI' },
        { name: 'Wyoming', abbrev: 'WY' }
    ];
    const initial = states.map(i => i.abbrev);
    const stateName = states.map(i => i.name);

    for (let i = 0; i < initial.length; i++) {
        db.collection('states').add({
            initial: initial[i],
            name: stateName[i],
        }).then(doc => {
            console.log("Stroed to: ", doc.id);
            findPastDataByState(initial[i], (err, body) => {
                if (err) throw err;
                let result = 0;
                for (let i = 0; i < body.DisasterDeclarationsSummaries.length; i++) {
                    result += body.DisasterDeclarationsSummaries[i].disasterNumber;
                }
                let docRef = db.collection('states').doc(doc.id);
                // wait for ~ 1min for one update per state
                docRef.set({ sum: result }, { merge: true })
                    .then(() => {console.log("Success");})
                    .catch(err => {console.log("Error: ", err);});;
            });
        }).catch(err => {console.log(err);});
    }
}

function fetchPast(callback) {
    let data = {}, total = 0;
    db.collection('states')
        .get()
        .then(query => {
            query.forEach(doc => {
                total += doc.data().sum;
                data[doc.data().name] = doc.data().sum;
                // // cannot query for that many documents
                // let docRef = db.collection('states').doc(doc.id);
                // docRef.collection('counties')
                //     .get()
                //     .then(querysnap => {
                //         querysnap.forEach(docsnap => {
                //             console.log(docsnap.data());
                //         });
                //     })
                //     .catch(err => { console.log(err); });
            });
            callback(null, data, total);
        })
        .catch(err => { callback(err, null, null); });
}


module.exports = () => {
    const router = express.Router();

    // only need to process once
    // insertPastFirebase();

    router.get('/', (req, res, next) => {
        // res.render('index');
        fetchPast((err, data, total) => {
            if (err) console.log(err);
            res.render('index', { data: data, total: total });
        });
    });

    router.post('/curdata', (req, res, next) => {
        findDisaster(req.body.date, (data) => {
            res.send(data);
        });
    });

    router.post('/news', (req, res, next) => {
        findNews(req.body.lat, req.body.lng, req.body.date, (data) => {
            res.send(data);
        });
    });

    return router;
};
