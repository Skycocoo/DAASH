// load asynchronously

let map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
    // testAddMarker();

    let icons = {
        lightning: {
            icon: '/img/lightning.png'
        }
    };

    // let uluru = {lat: 39.9526, lng: -75.1652};
    // let marker = new google.maps.Marker({
    //     position: uluru,
    //     icon: icons['lightning'].icon,
    //     title: "Lightning",
    //     map: map
    // });

}

function testAddMarker() {
    let uluru = {lat: 39.9526, lng: -75.1652};
    let marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
}