// load asynchronously

let map;
let lastLat = 0;
let lastLng = 0;
let today = new Date();
let curMarker = {};
let dd = today.getDate();
let mm = today.getMonth()+1; //January is 0!
let yyyy = today.getFullYear();

let disasters = {
    flood: {
        color: '#6ACBFF',
        radius: 7000
    }
};

if(dd < 10) {
    dd = '0' + dd;
}

if(mm < 10) {
    mm = '0' + mm;
}
const curDisasterUrl = "http://localhost:3000/curdata";
// const newsUrl = "http://localhost:3000/news";

let directionsService;
let directionsDisplay;

function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.397, lng: -80},
        zoom: 8
    });

    google.maps.event.addListener(map, "dragend", function () {
        let lat = map.data.map.center.lat();
        let lng = map.data.map.center.lng();

        if (lastLat === 0 && lastLng === 0 || calcCrow(lat, lng) >= 8) {
            lastLat = lat;
            lastLng = lng;

            let request = {
                radius: "20",
                lat: `${lat}`,
                lng: `${lng}`,
                date: `${yyyy}-${mm}-${dd}`
            };

            let xhr = new XMLHttpRequest();
            xhr.open('POST', curDisasterUrl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    JSON.parse(xhr.response).forEach((event) => {
                        addMarker(event.lat, event.lng, event.title, event.desc, event.type);
                    });
                }
            };
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(request));
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

function addMarker(lat, lng, title, desc, disaster) {
    let uluru = {lat, lng};
    let marker = new google.maps.Marker({
        position: uluru,
        title,
        map: map
    });

    let circle  = new google.maps.Circle({
        strokeColor: (disasters[disaster]  === undefined) ? '#8d8d8d' : disasters[disaster].color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: (disasters[disaster]  === undefined) ? '#8d8d8d' : disasters[disaster].color,
        fillOpacity: 0.1,
        map: map,
        center: uluru,
        radius: (disasters[disaster]  === undefined) ? 3000 : disasters[disaster].radius
    });

    marker.addListener('click', function() {
        let modal = $('#modal');
        // modal.find('.modal_title').text("TEST");
        $('#modal-title').text(title);
        $('#modal-body').text(desc);
        modal.modal();
        map.setCenter(uluru);
        map.setZoom(11);
        curMarker = uluru;
    })
}

function addCustomMarker() {
    let icons = {
        lightning: {
            icon: '/img/lightning2u.png'
        }
    };

    let image = {
        url: icons.lightning.icon,
        size: new google.maps.Size(50, 50),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32),
        scaledSize: new google.maps.Size(40, 40)
    };

    let uluru = {lat: 39.9526, lng: -75.1652};
    let marker = new google.maps.Marker({
        position: uluru,
        icon: image,
        title: "Lightning",
        map: map
    });

    marker.addListener('click', function() {
        alert("LIGHTNING");
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