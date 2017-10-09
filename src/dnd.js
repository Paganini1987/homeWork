var objMove={
    xStart: 0,
    yStart: 0,
    dragStart: false
};

function moveItem(...arg) {
    var e=arg[3];
    var modal=arg[0];
    var moveX = e.pageX - objMove.xStart;
    var moveY = e.pageY - objMove.yStart;

    e.preventDefault();

    if (!objMove.dragStart) {
        if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3 ) {   //Защита от ложных переносов
            return null;
        }

        objMove.dragStart=true;
    }

    modal.style.left = e.pageX - arg[1] + 'px';
    modal.style.top = e.pageY - arg[2] + 'px';
}


document.addEventListener('mousedown', function(e) {
    if (!e.target.classList.contains('header') && e.target.id!='adress') {
        return null;
    }
    var item=e.target.closest('#modal');
    var x=e.offsetX; //Позиция клика в элементе
    var y=e.offsetY;
    var move=moveItem.bind(null, item, x, y);
   
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

     
    });
});
