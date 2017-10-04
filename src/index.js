import './style.sass';

var myMap;
var clusterer;
var places=[];

function Place(adress, coords) {
    this.adress=adress;
    this.coords=coords;
    this.reviews=[];
}

Place.prototype.showForm=function(x, y) {
    var modal=document.querySelector('#modal');
    var close=document.querySelector('#close');
    var adress=document.querySelector('#adress');
    var reviews=document.querySelector('.reviews');
    var save=document.querySelector('#save');
    var thisObj=this;                               //Вопрос
    var savef = function(e) {
        e.preventDefault();
   
        var name=document.querySelector('#name').value;
        var place=document.querySelector('#place').value;
        var review=document.querySelector('#review').value;
        var date=new Date();
        var placeholder=document.querySelector('#placeholder');

        if (placeholder) {
            reviews.removeChild(placeholder);
        }
        
        reviews.innerHTML+=`<div><div><b>${name}</b> ${place} ${date.toLocaleString('ru')}</div><div>${review}</div></div>`;

        thisObj.reviews.push({
            name: name,
            place: place,
            review: review,
            date: date
        });

        addMarker();
    }

    close.addEventListener('click', ()=>{ 
        this.closeForm(modal) ;
        save.removeEventListener('click', savef);
    });
    save.addEventListener('click', savef);

    adress.innerText=this.adress;
    if (this.reviews.length===0) {
        reviews.innerHTML='<h4 id="placeholder">Отзывов пока нет...</h4>';
    } else {
        reviews.innerHTML='';
        this.reviews.forEach((item)=>{
            reviews.innerHTML+=`<div><div><b>${item.name}</b> ${item.place} ${item.date.toLocaleString('ru')}</div><div>${item.review}</div></div>`;
        });
    }

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

function geocoder(coords) {
    return ymaps.geocode(coords).then(function(result) {
        var points=result.geoObjects.toArray();

        if (points.length) {
            return points[0].getAddressLine();
        }
    });
}

function addMarker() {
    const placemarks = places.map(place => {
        return new ymaps.Placemark(place.coords, {
            balloonContentHeader: place.adress,
            balloonContentBody: place.reviews.join(', ')
        }, { preset: 'islands#blueCircleDotIcon' });
    });
    clusterer.removeAll(); //Очищаем все метки с карты
    clusterer.add(placemarks);
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
                if (places.some(place=>place.coords.join('')===coords.join(''))) {
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
        });
    })
    .catch(function(e) {
        console.error(e.message);
    });

