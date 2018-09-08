// load asynchronously

let map;
let lastLat = 0;
let lastLng = 0;
let today = new Date();

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
let url = "http://localhost:3000/curdata";

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.397, lng: -80},
        zoom: 8
    });

    google.maps.event.addListener(map, "dragend", function () {
        let lat = map.data.map.center.lat();
        let lng = map.data.map.center.lng();

        if (lastLat === 0 && lastLng === 0 || calcCrow(lat, lng, lastLat, lastLng) >= 8) {
            lastLat = lat;
            lastLng = lng;

            let request = {
                radius: "20",
                lat: `${lat}`,
                lng: `${lng}`,
                date: `${yyyy}-${mm}-${dd}`
            };

            let xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    JSON.parse(xhr.response).forEach((event) => {
                        addMarker(event.lat, event.lng, event.title, event.desc, event.type);
                    });
                }
            };
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(request));
            // findCurrentData(10, lat, lng, '2018-09-01', (res) => {
            //     console.log(res);
            // });
        }
    });
    
}

function addMarker(lat, lng, title, desc, disaster) {
    console.log(disaster);
    let uluru = {lat, lng};
    let marker = new google.maps.Marker({
        position: uluru,
        title,
        map: map
    });

    let circle  = new google.maps.Circle({
        strokeColor: disasters[disaster].color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: disasters[disaster].color,
        fillOpacity: 0.1,
        map: map,
        center: uluru,
        radius: disasters[disaster].radius
    });

    marker.addListener('click', function() {
        let modal = $('#modal');
        // modal.find('.modal_title').text("TEST");
        $('#modal-title').text(title);
        $('#modal-body').text(desc);
        modal.modal();
        map.setCenter(uluru);
        map.setZoom(11);
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