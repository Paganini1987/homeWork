/**
 * ДЗ 6.2 - Создать страницу с текстовым полем для фильтрации городов
 *
 * Страница должна предварительно загрузить список городов из
 * https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * и отсортировать в алфавитном порядке.
 *
 * При вводе в текстовое поле, под ним должен появляться список тех городов,
 * в названии которых, хотя бы частично, есть введенное значение.
 * Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.
 *
 * Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 * После окончания загрузки городов, надпись исчезает и появляется текстовое поле.
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 *
 * *** Часть со звездочкой ***
 * Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 * то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 * При клике на кнопку, процесс загруки повторяется заново
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
 * Функция должна загружать список городов из https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * И возвращать Promise, которой должен разрешиться массивом загруженных городов
 *
 * @return {Promise<Array<{name: string}>>}
 */
function loadTowns() {
    return new Promise(function(resolve, reject) {
        var xhr=new XMLHttpRequest();

        xhr.open('GET', 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json');
        xhr.responseType='json';
        xhr.addEventListener('load', function() {
            if (xhr.status<400) {
                var arr = xhr.response;

                arr.sort(function(a, b) {
                    if (a.name>b.name) { return 1; }
                    if (a.name<b.name) { return -1; }
                });

                resolve(arr);
            } else {
                reject(new Error('Не удалось загрузить города'));
            }
        });
        xhr.send();
    });
}


/**
 * Функция должна проверять встречается ли подстрока chunk в строке full
 * Проверка должна происходить без учета регистра символов
 *
 * @example
 * isMatching('Moscow', 'moscow') // true
 * isMatching('Moscow', 'mosc') // true
 * isMatching('Moscow', 'cow') // true
 * isMatching('Moscow', 'SCO') // true
 * isMatching('Moscow', 'Moscov') // false
 *
 * @return {boolean}
 */
function isMatching(full, chunk) {
    if (chunk && full) {
        return full.toUpperCase().includes(chunk.toUpperCase());
    }
}

let loadingBlock = homeworkContainer.querySelector('#loading-block');
let filterBlock = homeworkContainer.querySelector('#filter-block');
let filterInput = homeworkContainer.querySelector('#filter-input');
let filterResult = homeworkContainer.querySelector('#filter-result');
let townsPromise=loadTowns();
let cityArr=[];

townsPromise.then(success, err);

function success (arr) {
    loadingBlock.style.display='none';
    filterBlock.style.display='block';
    cityArr=arr;
}

function err (e) {
    var button=document.createElement('button');

    button.innerText='Повторить';
    button.style.margin='25px 0px';
    
    button.addEventListener('click', function() {
        homeworkContainer.removeChild(button);
        loadingBlock.innerText='Загрузка...';
        loadTowns().then(success, err);
    });

    loadingBlock.innerText=e.message;
    homeworkContainer.appendChild(button);   
}

filterInput.addEventListener('keyup', function(e) {
    var input=e.target.value;
    var list='';

    cityArr.forEach(function(item) {
        if (isMatching(item.name, input)) {
            list+=('<div>'+item.name+'</div>');
        }
    });

    filterResult.innerHTML=list;
});

export {
    loadTowns,
    isMatching
};
