import './style.sass';
var templateElement = require('./list.hbs'),
    columnArr=[],
    savedColumnArr=[],
    leftColumn=document.querySelector('#list'),
    rightColumn=document.querySelector('#list2'),
    save=document.querySelector('#save');

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
    var e=arg[3];
    var listItem=arg[0];

    listItem.style.left = e.pageX - arg[1] + 'px';
    listItem.style.top = e.pageY - arg[2] + 'px';
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

function changeColumn(item, column) {
    var id=item.children[3].innerText;

    columnArr.forEach(function(item) {
        if (item.id==id) {
            item.column=column;
        }
    });
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
    save.addEventListener('click', function() {
        localStorage.arr=JSON.stringify(columnArr);
    });
    leftColumn.addEventListener('click', function(e) {
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, leftColumn);
            addItem(e.target.parentNode, rightColumn);
            changeColumn(e.target.parentNode, 'right');
        }
    });

    rightColumn.addEventListener('click', function(e) {
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, rightColumn);
            addItem(e.target.parentNode, leftColumn);
            changeColumn(e.target.parentNode, 'left');
        }
    });

    document.addEventListener('mousedown', function(e) {
        if (!e.target.classList.contains('wrap_item')) {
            return null;
        }
        var item=e.target;
        var x=e.pageX-e.target.offsetLeft; //Позиция клика в элементе
        var y=e.pageY-e.target.offsetTop;

        var move=moveItem.bind(null, item, x, y);
        

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
                    
                    changeColumn(item, 'right');
                } else {
                    addPlusButton(item);

                    changeColumn(item, 'left');
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
        var leftArr=[];
        var rightArr=[];

        columnArr=data.items.map(function(item) {
            item.column='left';

            return  item;
        });
        savedColumnArr=JSON.parse(localStorage.arr);

        if (savedColumnArr) {
            savedColumnArr.forEach(function(item) {
                if (item.column==='right') {
                    rightArr.push(item);
                } else {
                    leftArr.push(item);
                }
            });
        }
        console.log(leftArr);
        
        var left = templateElement({ list: leftArr });
        var right = templateElement({ list: rightArr });

        leftColumn.innerHTML = left;
        rightColumn.innerHTML = right;
    })
    .then(function() {
        addListeners();
    })
    .catch(function(e) {
        alert(e.message);
    });