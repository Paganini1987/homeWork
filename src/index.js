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

function isMatching(full, chunk) {
    if (chunk && full) {
        return full.toUpperCase().includes(chunk.toUpperCase());
    } else if (chunk==='') {
        return true;
    }
}

function filter(list, input) {
    for (var i=0; i<list.length;i++) {
        if (isMatching(list[i].children[1].innerText, input)) {
            list[i].style.display='flex';
        } else {
            list[i].style.display='none';
        }
    }
}

function addListeners() {
    document.addEventListener('keyup', function(e) {
        if (e.target.tagName!=='INPUT') {
            return null;
        }

        var inputText=e.target.value;
        
        console.log(e);
        if (e.target.closest('.left_column')) {
            filter(leftColumn.children, inputText);
        }

        if (e.target.closest('.right_column')) {
            filter(rightColumn.children, inputText);
        }

    });
    leftColumn.addEventListener('click', function(e) {
        console.log(e);
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, leftColumn);
            addItem(e.target.parentNode, rightColumn);
        }
    });

    rightColumn.addEventListener('click', function(e) {
        console.log(e);
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

        console.log(e);

        item.style.width=item.clientWidth+'px';
        item.style.height=item.clientHeight+'px';
        item.style.position='absolute';
       
        move(e);

        document.body.appendChild(item);

        item.style.zIndex=1000;

        document.addEventListener('mousemove', move);

        item.addEventListener('mouseup', function mouseUp(e) { //имя функции для того, чтобы потом удалить обработчик
            document.removeEventListener('mousemove', move);
            item.removeEventListener('mouseup', mouseUp);

            item.style.display='none';
            var elem=document.elementFromPoint(e.clientX, e.clientY);

            item.style.display='flex';

            if (elem.closest('.droppable')) {
                elem.closest('.droppable').appendChild(item);
                item.style.position='';
                item.style.top='';
                item.style.left='';
                item.style.width='';

                if (elem.closest('.droppable').id==='list2') {
                    addXButton(item);
                } else {
                    addPlusButton(item);
                }
            }
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