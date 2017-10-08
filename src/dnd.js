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

function onDroppable(obj, x, y) {
    var a = obj.getBoundingClientRect();

    if ((x > a.left && x < a.left+obj.clientWidth) && (y > a.top && y < a.top+obj.clientHeight)) {
        return true;
    }
}

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

     

        if (elem.closest('.droppable')) {
           
        } else {
          
        }
    });
});
