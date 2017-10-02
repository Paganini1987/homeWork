import './style.sass';

var myMap;
var clusterer;
var places=[];

function Place(coords, name, place) {
    this.adress='';
    this.coords=coords;
    this.name=name;
    this.place=place;
    this.reviews=[];
}

Place.prototype.geocoder=function(coords) {
    return ymaps.geocode(coords).then(result=>{
        var points=result.geoObjects.toArray();

        if (points.length) {
            this.adress = points[0].getAddressLine();
        }
    });
};

Place.prototype.addText=function(review) {
    this.reviews.push(review);
};

Place.prototype.showForm=function(x, y) {
    var modal=document.querySelector('#modal');
    var close=document.querySelector('#close');

    close.addEventListener('click', ()=>{ this.closeForm(modal) });

    modal.style.top=y+'px';
    modal.style.left=x+'px';
    modal.style.display='block';
};

Place.prototype.closeForm=function(obj) {
    obj.style.display='none';
};

function init() {
    return new Promise(function(resolve) {
        ymaps.ready(resolve);
    });
}


function userCoord() {
    return new Promise(function(resolve) {
        navigator.geolocation.getCurrentPosition(function(geo) {resolve(geo)});
    });
}


init()
    .then(function() {
        return userCoord();  //Определяем координаты пользователя для определения центра карты
    })
    .then(function(coords) {
        var coord=[];

        coord[0]=coords.coords.latitude,
        coord[1]=coords.coords.longitude;
        myMap=new ymaps.Map('map', {
            center: coord,
            zoom: 12
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
        myMap.events.add('click', function (e) {
            var coords = e.get('coords');
            var [pageX, pageY] = e.get('pagePixels');
            var place=new Place(coords, 'place1', 'Mac');
  
            place.geocoder(coords);
            place.addText({ text: 'hello' });
            places.push(place);

            place.showForm(pageX, pageY);
            console.log(pageX, pageY);
        });
    });
    
    // .then(function(coords) {
    //     const placemarks = coords.map(friend => {
    //         return new ymaps.Placemark(friend.adress, {
    //             balloonContentHeader: friend.fio,
    //             balloonContentBody: '<img class="ballon_body" src='+friend.photo+'>'
    //         }, { preset: 'islands#blueHomeCircleIcon' })
    //     });

    //     clusterer.add(placemarks);
    // })
    // .catch(function(e) {
    //     console.error(e.message);
    // });

