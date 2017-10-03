import './style.sass';

var myMap;
var clusterer;
var places=[];

function Place(adress, coords) {
    this.adress=adress;
    this.coords=coords;
    this.reviews=[];
}

// Place.prototype.geocoder=function(coords) {
//     return ymaps.geocode(coords).then(result=>{
//         var points=result.geoObjects.toArray();

//         if (points.length) {
//             this.adress = points[0].getAddressLine();
//         }
//     });
// };

Place.prototype.addText=function(review) {
    this.reviews.push(review);
};

Place.prototype.showForm=function(x, y) {
    var modal=document.querySelector('#modal');
    var close=document.querySelector('#close');
    var adress=document.querySelector('#adress');

    close.addEventListener('click', ()=>{ this.closeForm(modal) });

    adress.innerText=this.adress;
    modal.style.top=y+'px';
    modal.style.left=x+'px';
    modal.style.display='block';

    var reviews=this.reviews;

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

function geocoder(coords) {
    return ymaps.geocode(coords).then(function(result) {
        var points=result.geoObjects.toArray();

        if (points.length) {
            return points[0].getAddressLine();
        }
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
            
            geocoder(coords).then(function(adress) {
                if (places.some(place=>place.adress===adress)) {
                    places.forEach(place=>{
                        if (place.adress===adress) {
                            place.showForm(pageX, pageY);
                        }
                    });
                } else {
                    var newPlace=new Place(adress, coords);

                    newPlace.showForm(pageX, pageY);
                    places.push(newPlace);
                }                   
            });
           console.log(places);
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

