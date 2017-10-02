import './style.sass';

var vk=require('./vk_init.js')();
var myMap;
var clusterer;

function init() {
    return new Promise(function(resolve) {
        ymaps.ready(resolve);
    });
}

function geocode(friend) {
    return ymaps.geocode(friend.adress).then(result => {
        const points = result.geoObjects.toArray();

        if (points.length) {
            return {
                fio: friend.fio,
                photo: friend.photo,
                adress: points[0].geometry.getCoordinates()
            };
        }
    });
}

function userCoord() {
    return new Promise(function(resolve) {
        navigator.geolocation.getCurrentPosition(function(geo) {resolve(geo)});
    });
}


init()
    .then(function() {
        return vk.init();
    })
    .then(function() {
        return userCoord();  //Определяем координаты пользователя для определения центра карты
    })
    .then(function(coords) {
        var coord=[];
        coord[0]=coords.coords.latitude,
        coord[1]=coords.coords.longitude;
        myMap=new ymaps.Map('map', {
            center: coord,
            zoom: 7
        });

        clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonPanelMaxMapArea: 0,
            clusterBalloonPagerSize: 15,
            clusterDisableClickZoom: true,
            openBalloonOnClick: true
        });

        myMap.geoObjects.add(clusterer);
    })
    .then(function() {
        return vk.api('friends.get', { count: 150, v: 5.68, fields: 'country, city, first_name, last_name, photo_100' });
    })
    .then(function(data) {
        var friends=data.items
            .filter(friend => friend.country && friend.country.title)
            .map(friend => {
                var adress=friend.country.title+' ';

                if (friend.city) {
                    adress+=friend.city.title;
                }

                return {
                    fio: friend.first_name+' '+friend.last_name,
                    adress: adress,
                    photo: friend.photo_100
                };
            })
            .map(friend => geocode(friend));           

        return Promise.all(friends);
    })
    .then(function(coords) {
        const placemarks = coords.map(friend => {
            return new ymaps.Placemark(friend.adress, {
                balloonContentHeader: friend.fio,
                balloonContentBody: '<img class="ballon_body" src='+friend.photo+'>'
            }, { preset: 'islands#blueHomeCircleIcon' })
        });

        clusterer.add(placemarks);
    })
    // .catch(function(e) {
    //     console.error(e.message);
    // });

