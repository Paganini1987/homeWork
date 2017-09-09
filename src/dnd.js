/** Со звездочкой */
/**
 * Создать страницу с кнопкой
 * При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией
 * Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 * Запрощено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');

/**
 * Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 * Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 * Функция НЕ должна добавлять элемент на страницу
 *
 * @return {Element}
 */
function createDiv() {
    var div=document.createElement('div');
    var randomColor=function() {
        var arr=[];
        for (var i=0;i<3;i++) {
            arr.push(Math.floor(Math.random()*256));
        }
        return arr.join(',');
    };

    div.classList.add('draggable-div');
    div.style.width=Math.floor(Math.random()*100+100)+'px';
    div.style.height=Math.floor(Math.random()*100+100)+'px';
    div.style.top=Math.floor(Math.random()*500+100)+'px';
    div.style.left=Math.floor(Math.random()*500+100)+'px';
    div.style.backgroundColor='rgb('+randomColor()+')';
    div.style.zIndex=1;

    return div;
}
/**
 * Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop
 *
 * @param {Element} target
 */
function addListeners(target) {
    var container=target.parentNode;
    var handler=function (...arg) {
        var e=arg[2];

        if (e.target.tagName==='DIV') {
            e.preventDefault();

            e.target.style.left=(e.pageX-arg[0])+'px';
            e.target.style.top=(e.pageY-arg[1])+'px';

            e.target.style.zIndex=1000;
        }
    };

    container.addEventListener('mousedown', function(e) {
        var x=e.offsetX;
        var y=e.offsetY;
        var move=handler.bind(null, x, y);

        container.addEventListener('mousemove', move);

        container.addEventListener('mouseup', function(e) {
            container.removeEventListener('mousemove', move);
            e.target.style.zIndex=1;
        });
    });
}

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function() {
    // создать новый div
    let div = createDiv();

    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации d&d
    addListeners(div);
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

export {
    createDiv
};
