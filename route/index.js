// Created by Yuxi Luo, July 2018

const express = require('express');
const request = require('request');

const fetch = require('node-fetch');
const phq = require('predicthq');
let client = new phq.Client({access_token: "BsTZYhJxF0jBXE9GG7a0e7zM4JyNq9", fetch: fetch});
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bbc2f161eef842538b561fe4256186a0');

const firebase = require('firebase');
require("firebase/firestore");

// function findPastData(callback) {
//     request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries.json`, function (error, response, body) {
//         if (error) callback(error, []);
//         callback(undefined, JSON.parse(body));
//     });
// }

function findPastDataByState(state, callback) {
    request(`https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter=state%20eq%20%27${state}%27`, function (error, response, body) {
        if (error) callback(error, []);
        callback(undefined, JSON.parse(body));
    });
}

// findPastDataByState('NE');

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

function findNews(city) { // still kinda messed up, not sure why :((((((((
    newsapi.v2.everything({
        q: `${city} wildfire OR ${city} fire`, // Add different disasters here
        sources: 'reuters,associated-press,abc-news,cnn,mscnbc,cnbc',
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

// findNews("Seattle");

function findDisaster(latlong, radius, date) {
    client.events.search({category: 'disasters, severe-weather', within: `${radius}@${latlong}`, 'active.gte': date})
        .then((results)=>{
            let data = [];
            for (let event of results) {
                // console.log(event.title);
                data.push(event.title);
            }
            console.log(data)
            // res.render('index', {data: data});
        });
}

// findDisaster('39.9526,-75.1652', '20km', '2018-09-01');


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
    // var messageRef = db.collection('rooms').doc('roomA')
    //             .collection('messages').doc('message1');
}

function insertPastFirebase() {
    let db = initFirebase();

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

    for (let i = 0; i < 1; i++) {
        db.collection('states').add({
            name: initial[i],
        }).then(doc => {
            console.log("Stroed to: ", doc.id);
            findPastDataByState(initial[i], (err, body) => {
                if (err) throw err;
                let result = 0;

                for (let i = 0; i < body.DisasterDeclarationsSummaries.length; i++) {
                    if (body.DisasterDeclarationsSummaries[i].declaredCountyArea.length == 0) continue;
                    let name = body.DisasterDeclarationsSummaries[i].declaredCountyArea.split(" ");
                    name.splice(-1, 1);
                    name.join(" ");
                    result += body.DisasterDeclarationsSummaries[i].disasterNumber;
                    doc.collection('counties').add({
                        name: name[0],
                        num: body.DisasterDeclarationsSummaries[i].disasterNumber,
                        type: body.DisasterDeclarationsSummaries[i].incidentType,
                    });
                }
                console.log(result);
                let docRef = db.collection('states').doc(doc.id);
                // wait for ~ 1min for this update
                docRef.set({ sum: result }, { merge: true })
                    .then(() => {console.log("Success");})
                    .catch(err => {console.log("Error: ", err);});;
            });
        }).catch(err => {console.log(err);});
    }
}

module.exports = () => {
    const router = express.Router();

    insertPastFirebase();

    router.get('/', (req, res, next) => {
        res.render('index');
    });

    return router;
};
