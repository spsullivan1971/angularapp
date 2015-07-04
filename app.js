$(document).ready (function () {
    locations = new Array();
    if (localStorage.jsonLocations) {
        var locationsTmp = JSON.parse(localStorage.jsonLocations);
        for(var i = 0; i < locationsTmp.length; ++i) {
            var location = new Object();
            location.name = locationsTmp[i].name;
            location.pos = new google.maps.LatLng(locationsTmp[i].pos.jb, locationsTmp[i].pos.kb);
            locations.push(location);
        }
    }
    interaction();
});

function interaction() {
    $('#map').on('shown', function () {
        google.maps.event.trigger(map, 'resize');
    });
    bindInteraction('#top > h1', main);
    bindInteraction('#top > span', help);
    bindInteraction('#manual', help);
    bindInteraction('#set', setLocation);
    bindInteraction('#auto', getLocation);
    bindInteraction('#setLocation', addLocation);
    bindInteraction('#show', showLocations);
    bindInteraction('#car', addCar);
    bindInteraction('#home', addHome);
    bindInteraction('#bike', addBike);
    bindInteraction('#route', routes);
    bindInteraction('form', formClick);
    bindInteraction('#text', textDescr);
    bindInteraction('#del', delLoc);
    bindInteraction('#instructions', showInstructions);
    $('#graph2').on('shown', function () {
        google.maps.event.trigger(map, 'resize');
    });
}

function showInstructions() {
    $('#content').css('overflow-y', 'scroll');
    switchScreen('#instr');
}

function bindInteraction(element, fn){
    $(element).bind('touchEvent', function(event) {
        fn(event);
    });

    $(element).click(function(event) {
        fn(event);
    })
}

function formClick(event) {
    $(this).data('clicked',$(event.target))
}0

function help() {
    $('#error > h2').text('This functionality is not yet implemented.');
    switchScreen('#error');
}

function main() {
    switchScreen('#main');
    $('#content').css('overflow-y', 'hidden');
}

var text = false;
function textDescr() {
    $('#graph2').empty();
    if (text == false) {
        $('#map2 #text').text('Show Map')
        directionsDisplay.setPanel(document.getElementById("graph2"));
        text = true;
    } else {
        $('#map #text').text('Show Text Description');
        directionsDisplay.setMap(map);
        text = false;
    }
}

var directionDisplay;
var directionsService = new google.maps.DirectionsService();
function initialize() {
    $('#graph2').empty();
    directionsDisplay = new google.maps.DirectionsRenderer();
    var myOptions = {
        zoom: 10,
        center: currentPos,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById("graph2"),myOptions);
    directionsDisplay.setMap(map);
    var marker = new google.maps.Marker({
        position: currentPos,
        map: map,
        title:"My location"
    });
}

var currentPos;
function calculateRoute(event) {
    text =  false;
    var i = $(this).data('clicked').prev().text();
    var end = locations[i].pos;
    var request = {
        origin: currentPos,
        destination: end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            alert('error');
        }
    });

    switchScreen('#map2');
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function deleteLocation(event) {
    var i = $(this).data('clicked').prev().text();
    locations.remove(i);
    localStorage.jsonLocations = JSON.stringify(locations);
    delLoc();
}

function setCurrentPos(position) {
    currentPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
}

function delLoc() {
    printLocations('#delete');
}

function routes() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(setCurrentPos);
    }
    printLocations('#routes');
}

function printLocations(element) {
    if (locations.length > 0) {
        $(element+' ul').empty();
        for (var i = 0; i < locations.length; ++i) {
            $(element+' ul').append(
                '<li>' +
                    '<span class="hidden">'+i+'</span>' +
                    '<input type="submit" value="'+locations[i].name + '"/>'+
                    '</li>'
            )
        }
        switchScreen(element);
        initialize();
    } else {
        $('#error > h2').text('No location set!');
        switchScreen('#error');
    }
}
function addCar() {
    $('#locationName > input').val('MyCar');
    getLocation();
}

function addHome() {
    $('#locationName > input').val('MyHome');
    getLocation();
}

function addBike() {
    $('#locationName > input').val('MyBike');
    getLocation();
}

function setLocation() {
    $('#locationName > input').val('MyTagName');
    switchScreen('#choice');
}

function getLocation() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        $('#error > h2').text('Geolocation is not supported by this browser');
        switchScreen('#error');
    }
}

function switchScreen(element) {
    $('#content > *').css('display', 'none');
    $(element).css('display', 'block');
}

var marker;
function showPosition(position) {
    $('#map > h2').text('Drag the cursor to your position if needed.');
    switchScreen('#map');
    var latlon = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
      zoom: 14,
      center: latlon,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('graph'), mapOptions);
    marker = new google.maps.Marker({
        position: latlon,
        map: map,
        draggable: true,
        title: $('#locationName > input').val(),
        icon: 'http://bzub.heliohost.org/derby/images/mapMarker.png'
    });
}

var locations;
function addLocation() {
    var location = new Object();
    location.pos = marker.getPosition();//new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
    location.name = $('#locationName > input').val();
    locations.push(location);
    localStorage.jsonLocations = JSON.stringify(locations);
    alert('Location stored as: ' + location.name);
}

function showLocations() {
    if (locations.length > 0) {
        $('#map3 > h2').text('Your Locations');
//        var latlon = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
            zoom: 12,
            center: locations[0].pos,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

//        var infowindow = new google.maps.InfoWindow();
        var map = new google.maps.Map(document.getElementById('graph3'), mapOptions);
        var m;
        for (var i = 0; i < locations.length; ++i) {
            m = new google.maps.Marker({
                position: locations[i].pos,
                map: map,
                title: locations[i].name,
                icon: 'http://bzub.heliohost.org/derby/images/mapMarker.png'
            });
        }

        google.maps.event.trigger(map, 'resize');
        switchScreen('#map3');
    } else {
        $('#error > h2').text('No location set!');
        switchScreen('#error');
    }
}
