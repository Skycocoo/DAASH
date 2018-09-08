// load asynchronously

let map;
let lastLat = 0;
let lastLng = 0;
let url = "http://localhost:3000/curdata";

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });

    google.maps.event.addListener(map, "dragend", function () {
        let lat = map.data.map.center.lat();
        let lng = map.data.map.center.lng();
        console.log(lat, lng);

        if (lastLat === 0 && lastLng === 0 || calcCrow(lat, lng, lastLat, lastLng) >= 5) {
            lastLat = lat;
            lastLng = lng;

            let request = {
                radius: "10",
                lat: `${lat}`,
                lng: `${lng}`,
                date: "2018-09-01"
            };

            let xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200)
                    console.log(xhr.responseText);
            };
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(request));
            // findCurrentData(10, lat, lng, '2018-09-01', (res) => {
            //     console.log(res);
            // });
        }
    });



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

function calcCrow(lat1, lon1, lat2, lon2) {
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