// load asynchronously

let map;
let lastLat = 0;
let lastLng = 0;
let today = new Date();
let curMarker = {};
let markers = {
    Hurricane: [],
    Flood: [],
    Fire: [],
    Tornado: [],
    Volcano: []
};
let dd = (today.getDate() < 10) ? '0'+today.getDate() : today.getDate();
let mm = (today.getMonth() < 10) ? '0'+ (today.getMonth() + 1) : today.getMonth() + 1; // January is 0!
let yyyy = today.getFullYear();

let disasters = {
    Flood: {
        // color: '#6ACBFF',
        // radius: 7000,
        icon: '/img/lightning2u.png'
    },
    Fire: {
        // color: '#ff312c',
        // radius: 8000,
        icon: '/img/firenew.png'
    },
    Hurricane: {
        // color: '#656565',
        // radius: 10000,
        icon: '/img/hurricaneclip.png'
    },
    Tornado: {
        // color: '#FFFFFF',
        // radius: 9000,
        icon: '/img/tornado.jpg'
    },
    Volcano: {
        // color: '#ff5523',
        // radius: 9500,
        icon: '/img/fire.jpg'
    }
};


const curDisasterUrl = "http://localhost:3000/curdata";
// const newsUrl = "http://localhost:3000/news";

let directionsService;
let directionsDisplay;

function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.5695040941581, lng: -93.81375094516613},
        zoom: 4,
    });

    // styling by the past data
    map.data.setStyle(styleFeature);
    loadMapShapes();


    curData.forEach((event) => {
        let xhr2 = new XMLHttpRequest();
        xhr2.open('GET', `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?components=administrative_area:${event.state}|administrative_area:${event.county}&key=AIzaSyC7ykUUPTmMCeAfmSTnbk0f0cHnYbojaII`, true);
        xhr2.onreadystatechange = function() {
            if (xhr2.readyState === 4 && xhr2.status === 200 && JSON.parse(xhr2.response).results[0]) {
                addMarker(JSON.parse(xhr2.response).results[0].geometry.location.lat,
                    JSON.parse(xhr2.response).results[0].geometry.location.lng,
                    event.title, event.type);
            }
        };
        xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr2.send();
    });

    // let xhr = new XMLHttpRequest();
    // xhr.open('POST', curDisasterUrl, true);
    // xhr.onreadystatechange = function() {
    //     if (xhr.readyState === 4 && xhr.status === 200) {
    //         JSON.parse(xhr.response).forEach((event) => {
    //
    //             let xhr2 = new XMLHttpRequest();
    //             xhr2.open('GET', `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?components=administrative_area:${event.state}|administrative_area:${event.county}&key=AIzaSyC7ykUUPTmMCeAfmSTnbk0f0cHnYbojaII`, true);
    //             xhr2.onreadystatechange = function() {
    //                 if (xhr2.readyState === 4 && xhr2.status === 200 && JSON.parse(xhr2.response).results[0]) {
    //                     addMarker(JSON.parse(xhr2.response).results[0].geometry.location.lat,
    //                         JSON.parse(xhr2.response).results[0].geometry.location.lng,
    //                         event.title, event.type);
    //                 }
    //             };
    //             xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //             xhr2.send();
    //         });
    //     }
    // };
    // xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // xhr.send(JSON.stringify(request));

    google.maps.event.addListener(map, "dragend", function () {
        let lat = map.data.map.center.lat();
        let lng = map.data.map.center.lng();
        if (lastLat === 0 && lastLng === 0 || calcCrow(lat, lng) >= 8) {
            lastLat = lat;
            lastLng = lng;
        }
    });
    directionsDisplay.setMap(map);
}

function calcRoute() {
    let uluru = {};
    let xhr = new XMLHttpRequest();
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?location=${lastLat},${lastLng}&radius=1500&query=Red%20Cross&key=AIzaSyC7ykUUPTmMCeAfmSTnbk0f0cHnYbojaII`;
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            uluru.lat = JSON.parse(xhr.responseText).results[0].geometry.location.lat;
            uluru.lng = JSON.parse(xhr.responseText).results[0].geometry.location.lng;

            let request = {
                origin: {lat: curMarker.lat, lng: curMarker.lng},
                destination: uluru,
                travelMode: "DRIVING"
            };
            directionsService.route(request, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                }
            });
        }
    };
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();

}

function addMarker(lat, lng, title, disaster) {
    let uluru = {lat, lng};
    let marker;
    if (disasters[disaster].icon !== undefined) {
        let image = {
            url: disasters[disaster].icon,
            size: new google.maps.Size(50, 50),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 32),
            scaledSize: new google.maps.Size(40, 40)
        };

        marker = new google.maps.Marker({
            position: uluru,
            title,
            icon: image,
            map: map
        });
    } else {
         marker = new google.maps.Marker({
            position: uluru,
            title,
            map: map
        });
    }
    markers[disaster].push(marker);

    // marker = new google.maps.Marker({
    //     position: uluru,
    //     title,
    //     map: map
    // });
    // let circle  = new google.maps.Circle({
    //     strokeColor: (disasters[disaster]  === undefined) ? '#8d8d8d' : disasters[disaster].color,
    //     strokeOpacity: 0.8,
    //     strokeWeight: 2,
    //     fillColor: (disasters[disaster]  === undefined) ? '#8d8d8d' : disasters[disaster].color,
    //     fillOpacity: 0.1,
    //     map: map,
    //     center: uluru,
    //     radius: (disasters[disaster]  === undefined) ? 3000 : disasters[disaster].radius
    // });

    marker.addListener('click', function() {
        let modal = $('#modal');
        // modal.find('.modal_title').text("TEST");
        $('#modal-title').text(title);
        modal.modal();
        map.setCenter(uluru);
        map.setZoom(10);
        curMarker = uluru;

        let request = {
            topic: title,
            type: disaster
        };
        xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:3000/news');
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(xhr.responseText);
            }
        };
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(request));
    })
}

function calcCrow(lat1, lon1) {
    let lat2 = lastLat;
    let lon2 = lastLng;
    let R = 6371;
    let dLat = toRad(lat2 - lat1);
    let dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}


/** Loads the state boundary polygons from a GeoJSON source. */
function loadMapShapes() {
  // load US state outline polygons from a GeoJson file
  map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/states.js', { idPropertyName: 'STATE' });

  // wait for the request to complete by listening for the first feature to be
  // added
  google.maps.event.addListenerOnce(map.data, 'addfeature', function() {
    google.maps.event.trigger(document.getElementById('census-variable'),
        'change');
  });
}

function styleFeature(feature) {
    // console.log(severity);
    let severity = pastData[feature.f.NAME] / total * 25;
    if (isNaN(severity)) severity = 0;

    var high = [5, 69, 54];  // color of smallest datum
    var low = [151, 83, 34];   // color of largest datum

    var color = [];
    for (var i = 0; i < 3; i++) {
        // calculate an integer color based on the delta
        color[i] = (high[i] - low[i]) * severity + low[i];
    }
    var outlineWeight = 0.5, zIndex = 1;
    return {
        strokeWeight: outlineWeight,
        strokeColor: '#fff',
        zIndex: zIndex,
        fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
        fillOpacity: 0.75,
        visible: true
    };
}

function toggleIcons(disaster) {
    for (let i = 0; i < markers[disaster].length; i++) {
        let marker = markers[disaster][i];
        if (!marker.getVisible()) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    }
}
// /// gif
// function findGif(weatherType) { //doesn't work yet
//     var gifString = "http://api.giphy.com/v1/stickers/random?api_key=9NhVNvR04acYobvWGIGoiY5B9pla2JZV&tag=" + weatherType;
//     xhr.open("GET", gifString);
//     xhr.send();
//     xhr.onreadystatechange = function () {
//         if (this.readyState == 4 && this.status == 200) {
//             var data = xhr.responseText;
//             return data.data[0].images.downsized.url;//public url to gif < 2 MB
//         }
//     }
// }
