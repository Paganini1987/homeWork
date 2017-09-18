/**
 * ДЗ 7.2 - Создать редактор cookie с возможностью фильтрации
 *
 * На странице должна быть таблица со списком имеющихся cookie:
 * - имя
 * - значение
 * - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)
 *
 * На странице должна быть форма для добавления новой cookie:
 * - имя
 * - значение
 * - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)
 *
 * Если добавляется cookie с именем уже существующией cookie, то ее значение в браузере и таблице должно быть обновлено
 *
 * На странице должно быть текстовое поле для фильтрации cookie
 * В таблице должны быть только те cookie, в имени или значении которых есть введенное значение
 * Если в поле фильтра пусто, то должны выводиться все доступные cookie
 * Если дабавляемая cookie не соответсвуте фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 * Если добавляется cookie, с именем уже существующией cookie и ее новое значение не соответствует фильтру,
 * то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена
 *
 * Для более подробной информации можно изучить код тестов
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');

filterNameInput.addEventListener('keyup', function() {
    var filter=filterNameInput.value;

    addAllCookie();
    for (var i=0;i<listTable.children.length;i++) {
        var name = listTable.children[i].children[0].innerText,
            value = listTable.children[i].children[1].innerText;

        if (!include(name, filter) && !include(value, filter)) {
            listTable.children[i].parentNode.removeChild(listTable.children[i]);
            i--;
        }
    }

});

addButton.addEventListener('click', () => {
    var name=addNameInput.value,
        value=addValueInput.value;


    if (!name || !value) {
        alert('Нужно ввести имя и значение.');

        return null;
    }

    if (include(name, filterNameInput.value) || include(value, filterNameInput.value)) {
        if (cookieExist(name)) {
            cookieExist(name).children[1].innerText=value;
            document.cookie=name+'='+value;
        } else {
            addCookie(name, value);
            document.cookie=name+'='+value;
        } 
    } else {
        if (cookieExist(name)) {
            cookieExist(name).parentNode.removeChild(cookieExist(name)); //Если уже существует, но значение не соответсвует фильтру, добавляем только в браузер и удаляем из таблицы
            document.cookie=name+'='+value;
        } else {
            document.cookie=name+'='+value;  //Если не соответсвует фильтру, добавляем только в браузер
        } 
    }
   
});

addAllCookie();

function deleteCookie(e) {
    var string=e.target.parentNode.parentNode,
        container=string.parentNode,
        name=string.children[0].innerText,
        value=string.children[1].innerText;

        container.removeChild(string);
        document.cookie=name+'='+value+';expires='+new Date(2222);
}

function addCookie(name, value) {
    var tr=document.createElement('tr');

    listTable.appendChild(tr);
    for (var i=0;i<3;i++) {
        var td=document.createElement('td');
        
        if (i===0) td.innerText=name;
        if (i===1) td.innerText=value;
        if (i===2) {
            var button=document.createElement('button');

            button.innerText='Удалить';
            button.addEventListener('click', deleteCookie);
            td.appendChild(button);
        }
    
        tr.appendChild(td);
    }  
}

function cookieExist(name) {
    for (var i=0;i<listTable.children.length;i++) {
        if (listTable.children[i].children[0].innerText===name) {
            return listTable.children[i];
        }
    }

    return false;
}

function include(full, chunk) {
    if (full && chunk) {
        return full.toUpperCase().includes(chunk.toUpperCase());
    } else if (chunk === '') {
        return true;
    }
}

function addAllCookie() {
    var cookie=document.cookie.split('; ')
    
    listTable.innerText='';
    cookie.forEach(function(item) {
        var arr=item.split('=');

        addCookie(arr[0], arr[1]);
    })

    console.log(cookie);
}

