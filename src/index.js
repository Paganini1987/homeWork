import './style.sass';
var templateElement = require('./list.hbs'),
    results=document.querySelector('#list'),
    leftColumnArr=[],
    rightColumnArr=[],
    leftColumn=document.querySelector('#list'),
    rightColumn=document.querySelector('#list2');
    

function api(method, params) {
    return new Promise(function(resolve, reject) {
        VK.api(method, params, function(data) {
            if (data.error) {
                reject(new Error(data.error));
            } else {
                resolve(data.response);
            }
        });
    });
}

var promise=new Promise(function(resolve, reject) {
    VK.init({
        apiId: 6193803
    });

    VK.Auth.login(function(data) {
        if (data.session) {
            resolve(data);
        } else {
            reject(new Error('Не удалось авторизоваться!'));
        }
    });
}, 16);

function addItem(item, where) {
    where.appendChild(item);
    if (where===rightColumn) {
        addXButton(item);
    } else {
        addPlusButton(item);
    }
}

function removeItem(item, where) {
    where.removeChild(item);
}

function addXButton(item) {
    for (var i=0;i<item.children.length;i++) {
        if (item.children[i].id==='event_button') {
            item.children[i].classList.remove('fa-plus');
            item.children[i].classList.add('fa-times');
        }
    }
}

function addPlusButton(item) {
    for (var i=0;i<item.children.length;i++) {
        if (item.children[i].id==='event_button') {
            item.children[i].classList.remove('fa-times');
            item.children[i].classList.add('fa-plus');
        }
    }
}

function moveItem(...arg) {
    var e=arg[1];
    var listItem=arg[0];

    listItem.style.left = e.pageX - listItem.offsetWidth / 2 + 'px';
    listItem.style.top = e.pageY - listItem.offsetHeight / 2 + 'px';
}

function addListeners() {
    leftColumn.addEventListener('click', function(e) {
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, leftColumn);
            addItem(e.target.parentNode, rightColumn);
        }
    });

    rightColumn.addEventListener('click', function(e) {
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, rightColumn);
            addItem(e.target.parentNode, leftColumn);
        }
    });

    document.addEventListener('mousedown', function(e) {
        if (!e.target.classList.contains('wrap_item')) {
            return null;
        }
        var item=e.target;
        var move=moveItem.bind(null, item);

        item.style.width=item.clientWidth+'px';
        item.style.height=item.clientHeight+'px';
        item.style.position='absolute';
       
        move(e);

        document.body.appendChild(item);

        item.style.zIndex=1000;

        document.addEventListener('mousemove', move);

        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', move);
        });
    });
}

promise
    .then(function() {
        return api('friends.get', { count: 10, v: 5.68, fields: 'first_name, last_name, photo_100, city' });
    })
    .then(function(data) {
        var template = templateElement({ list: data.items });

        results.innerHTML = template;
    })
    .then(function() {
        addListeners();
    })
    .catch(function(e) {
        alert(e.message);
    });