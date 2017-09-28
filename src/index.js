import './style.sass';
var templateElement = require('./list.hbs'),
    columnArr=[],
    leftColumn=document.querySelector('#list'),
    rightColumn=document.querySelector('#list2'),
    save=document.querySelector('#save'),
    inputLeft=document.querySelector('#inputLeft'),
    inputRight=document.querySelector('#inputRight'),
    objMove={
        xStart: 0,
        yStart: 0,
        dragStart: false
    };

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

function clearInputs() {
    inputRight.value='';
    inputLeft.value='';
    filter(leftColumn.children, '');
    filter(rightColumn.children, '');
}

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
    var moveX = e.pageX - objMove.xStart;
    var moveY = e.pageY - objMove.yStart;
    e.preventDefault();

    if (!objMove.dragStart) {
        if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3 ) {   //Защита от ложных переносов
            return null;
        }
        listItem.style.width=listItem.clientWidth+'px';
        listItem.style.height=listItem.clientHeight+'px';
        listItem.style.position='absolute';
        document.body.appendChild(listItem);
        listItem.style.zIndex=1000;

        objMove.dragStart=true;
        clearInputs();
    }

    listItem.style.left = e.pageX - arg[1] + 'px';
    listItem.style.top = e.pageY - arg[2] + 'px';

    if (onDroppable(leftColumn, e.pageX, e.pageY) || onDroppable(rightColumn, e.pageX, e.pageY)) {  //Если объект находится над областью
        listItem.style.boxShadow='3px 2px 3px 0px #d9d9d9';
        listItem.style.opacity='1';
    } else {
        listItem.style.opacity='0.3';
    }
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

function onDroppable(obj, x, y) {
    var a = obj.getBoundingClientRect();

    if ((x > a.left && x < a.left+obj.clientWidth) && (y > a.top && y < a.top+obj.clientHeight)) {
        return true;
    }
}

function addListeners() {
    document.addEventListener('keyup', function(e) {
        if (e.target.tagName!=='INPUT') {
            return null;
        }
        var inputText=e.target.value;
        
        if (e.target.closest('.left_column')) {
            filter(leftColumn.children, inputText);
        }

        if (e.target.closest('.right_column')) {
            filter(rightColumn.children, inputText);
        }

    });
    save.addEventListener('click', function() {
        localStorage.arr=JSON.stringify(columnArr);
        alert('Данные сохранены!');
    });
    leftColumn.addEventListener('click', function(e) {
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, leftColumn);
            addItem(e.target.parentNode, rightColumn);
            changeColumn(e.target.parentNode, 'right');
            clearInputs();
        }
    });

    rightColumn.addEventListener('click', function(e) {
        if (e.target.id==='event_button') {
            removeItem(e.target.parentNode, rightColumn);
            addItem(e.target.parentNode, leftColumn);
            changeColumn(e.target.parentNode, 'left');
            clearInputs();
        }
    });

    document.addEventListener('mousedown', function(e) {
        if (!e.target.classList.contains('wrap_item')) {
            return null;
        }
        var item=e.target;
        var x=e.offsetX; //Позиция клика в элементе
        var y=e.offsetY;
        var move=moveItem.bind(null, item, x, y);
        var source=item.parentNode;
        var itemReset = function(item) {
            item.style.boxShadow='none';
            item.style.opacity='1';
            item.style.position='';
            item.style.top='';
            item.style.left='';
            item.style.width='';
        };

        e.stopPropagation();
        objMove.xStart=e.pageX;  //Запоминаем начальные координаты курсора
        objMove.yStart=e.pageY;

        move(e);
       
        document.addEventListener('mousemove', move);

        item.addEventListener('mouseup', function mouseUp(e) { //имя функции для того, чтобы потом удалить обработчик
            document.removeEventListener('mousemove', move);
            item.removeEventListener('mouseup', mouseUp);
            
            if (!objMove.dragStart) {
                objMove.dragStart = false;
                return null;
            }

            objMove.dragStart = false;

            item.style.display='none';
            var elem=document.elementFromPoint(e.clientX, e.clientY);

            item.style.display='flex';

            if (elem.closest('.droppable')) {
                elem.closest('.droppable').appendChild(item);
                itemReset(item);

                if (elem.closest('.droppable').id==='list2') {
                    addXButton(item);
                    
                    changeColumn(item, 'right');
                } else {
                    addPlusButton(item);

                    changeColumn(item, 'left');
                }
            } else {
                source.appendChild(item); //Если перенесли не в колонку, то возвращаем элемент назад, откуда был взят
                itemReset(item);
            }
        });
    });
}

promise
    .then(function() {
        return api('friends.get', { v: 5.68, fields: 'first_name, last_name, photo_100' });
    })
    .then(function(data) {
        var leftArr=[];
        var rightArr=[];

        if (localStorage.arr) {
            columnArr=JSON.parse(localStorage.arr);
        } else {
            columnArr=data.items;
        }

        columnArr.forEach(function(item) {
            if (item.column==='right') {
                rightArr.push(item);
            } else {
                leftArr.push(item);
            }
        });
        
        var left = templateElement({ list: leftArr, icon: 'fa-plus' });
        var right = templateElement({ list: rightArr, icon: 'fa-times' });

        leftColumn.innerHTML = left;
        rightColumn.innerHTML = right;
    })
    .then(function() {
        addListeners();
    })
    .catch(function(e) {
        alert(e.message);
    });