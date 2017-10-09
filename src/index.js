import './style.sass';
var dnd=require('./dnd.js');

var myMap;
var clusterer;
var places=[];
var newPlace;
var modal=document.querySelector('#modal');
var close=document.querySelector('#close');
var adress=document.querySelector('#adress');
var reviews=document.querySelector('.reviews');
var save=document.querySelector('#save');
var form=document.querySelector('.review');

function Place(adress, coords) {
    this.adress=adress;
    this.coords=coords;
    this.form='';
    this.points=[];
}

Place.prototype.showForm=function(x, y) {
    var that=this; 
    
    this.form=modal;

    var savef = function(e) {

        e.preventDefault();
   
        var name=document.querySelector('#name').value;
        var place=document.querySelector('#place').value;
        var date=new Date();
        var placeholder=document.querySelector('#placeholder');
        var review=document.querySelector('#review').value;

        if (placeholder) {
            reviews.removeChild(placeholder);
        }
        
        reviews.innerHTML+=`<div><div><b>${name}</b> ${place} ${date.toLocaleString('ru')}</div><div>${review}</div></div>`;

        that.points.push({
            name: name,
            coords: that.coords,
            adress: that.adress,
            place: place,
            review: review,
            date: date
        });
        
        resetForm(form);
        addMarker();
    };
    resetForm(form);

    close.addEventListener('click', function closef() { 
        that.closeForm() ;
        save.removeEventListener('click', savef);
        close.removeEventListener('click', closef);
    });

    save.addEventListener('click', savef);

    adress.innerText=adressTrimm(this.adress);

    if (this.points.length===0) {
        reviews.innerHTML='<h4 id="placeholder">Отзывов пока нет...</h4>';
    } else {
        reviews.innerHTML='';
        this.points.forEach((item)=>{
            reviews.innerHTML+=`<div><div><b>${item.name}</b> ${item.place} ${item.date.toLocaleString('ru')}</div><div>${item.review}</div></div>`;
        });
    }

    modal.style.top=y+'px';
    modal.style.left=x+'px';
    modal.style.display='block';

};

Place.prototype.closeForm=function() {
    this.form.style.display='none';
    if (this.points.length===0) {
        places.pop(this);
    }
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
    var points=[];

    places.forEach((place)=>{
        place.points.forEach((point)=>{
            points.push(point);
        });
    });

    const placemarks = points.map(point => {
        return new ymaps.Placemark(point.coords, {
            balloonContentHeader: point.place,
            balloonContentBody: '<a data-coords="'+point.coords+'" id="showFormFromBalloon">'+point.adress+'</a><div>'+point.review+'</div>',
            balloonContentFooter: '<div id="balloonDate">'+point.date.toLocaleString('ru')+'</div>'
        }, { preset: 'islands#blueCircleDotIcon' });
    });
    clusterer.removeAll(); //Очищаем все метки с карты
    clusterer.add(placemarks);
}

function resetForm(form) {
    for (var i=0; i<form.children.length; i++) {
        if (form.children[i].tagName==='INPUT' || form.children[i].tagName==='TEXTAREA') {
            form.children[i].value='';
        }
    }
}

function adressTrimm(adress){
    if (adress.length>45) {
        return adress.slice(0, 45)+'. . .';
    } else {
        return adress;
    }
}

document.addEventListener('click', (e)=>{
    if (e.target.id==='showFormFromBalloon') {
        places.forEach(place=>{
            if (place.coords.join(',')===e.target.dataset.coords) {
                clusterer.balloon.close(this);
                place.showForm(e.pageX, e.pageY);
            }
        });
    }
});

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
        myMap.geoObjects.events.add('click', function (e) {
            var object = e.get('target');
            var coords = object.geometry.getCoordinates();

            if (object instanceof ymaps.Placemark) {
                e.preventDefault();
  
                places.forEach(place=>{
                    if (place.coords.join('')===coords.join('')) {
                        place.showForm(e.pageX, e.pageY);
                    }
                });
            }       
        });
        myMap.events.add('click', function (e) {
            if (modal.style.display==='block') {
                var event=new Event('click');

                close.dispatchEvent(event);
                e.preventDefault();
                return null;
            }
            var coords = e.get('coords');
            var [pageX, pageY] = e.get('pagePixels');

            geocoder(coords).then(function(adress) {
                if (!places.some(place=>place.coords.join('')===coords.join(''))) {
                    newPlace=new Place(adress, coords);
                    newPlace.showForm(pageX, pageY);
                    places.push(newPlace);
                }                   
            });
        });
    })
    .catch(function(e) {
        console.error(e.message);
    });

