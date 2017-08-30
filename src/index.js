/* ДЗ 2 - работа с исключениями и отладчиком */

/*
 Задача 1:
 Функция принимает массив и фильтрующую фукнцию и должна вернуть true или false
 Функция должна вернуть true только если fn вернула true для всех элементов массива
 Необходимо выбрасывать исключение в случаях:
 - array не массив или пустой массив (с текстом "empty array")
 - fn не является функцией (с текстом "fn is not a function")
 Зарпещено использовать встроенные методы для работы с массивами
 */
function isAllTrue(array, fn) {
    if (!(array instanceof Array) || array.length===0) {
        throw new Error('empty array');
    }
    if (typeof fn !== 'function') {
        throw new Error('fn is not a function');
    }
    for (var i=0;i<array.length;i++) {
        if (!fn(array[i])) {
            return false;
        }
    }

    return true;
}

/*
 Задача 2:
 Функция принимает массив и фильтрующую фукнцию и должна вернуть true или false
 Функция должна вернуть true если fn вернула true хотя бы для одного из элементов массива
 Необходимо выбрасывать исключение в случаях:
 - array не массив или пустой массив (с текстом "empty array")
 - fn не является функцией (с текстом "fn is not a function")
 Зарпещено использовать встроенные методы для работы с массивами
 */
function isSomeTrue(array, fn) {
    if (!(array instanceof Array) || array.length===0) {
        throw new Error('empty array');
    }
    if (typeof fn !== 'function') {
        throw new Error('fn is not a function');
    }
    for (var i=0; i<array.length;i++) {
        if (fn(array[i])) {
            return true;
        }
    }

    return false;
}

/*
 Задача 3:
 Функция принимает заранее неизветсное количество аргументов, первым из которых является функция fn
 Функция должна поочередно запустить fn для каждого переданного аргумента (кроме самой fn)
 Функция должна вернуть массив аргументов, для которых fn выбросила исключение
 Необходимо выбрасывать исключение в случаях:
 - fn не является функцией (с текстом "fn is not a function")
 */
function returnBadArguments(fn) {
    var arrayOfArguments=[];
    var fn_=arguments[0];

    if (typeof fn_ !== 'function') {
        throw new Error('fn is not a function');
    }
    for (var i=1;i<arguments.length;i++) {
        try {
            fn_(arguments[i]);
        } catch (e) {
            arrayOfArguments.push(arguments[i]);
        }
    }

    return arrayOfArguments;
}

/*
 Задача 4:
 Функция имеет параметр number (по умолчанию - 0)
 Функция должна вернуть объект, у которого должно быть несколько методов:
 - sum - складывает number с переданными аргументами
 - dif - вычитает из number переданные аргументы
 - div - делит number на первый аргумент. Результат делится на следующий аргумент (если передан) и так далее
 - mul - умножает number на первый аргумент. Результат умножается на следующий аргумент (если передан) и так далее

 Количество передаваемых в методы аргументов заранее неизвестно
 Необходимо выбрасывать исключение в случаях:
 - number не является числом (с текстом "number is not a number")
 - какой-либо из аргументов div является нулем (с текстом "division by 0")
 */
function calculator(n) {
    if (isNaN(n) && n) {
        throw new Error('number is not a number');
    }
    var calc={
            number: n || 0,
            sum: function() {
                var sumOfArguments=0;

                for (var i=0;i<arguments.length;i++) {
                    sumOfArguments+=arguments[i];
                }

                return this.number+sumOfArguments;
            },
            dif: function() {
                var sumOfArguments=0;

                for (var i=0;i<arguments.length;i++) {
                    sumOfArguments+=arguments[i];
                }

                return this.number-sumOfArguments;
            },
            div: function() {
                for (var i=0;i<arguments.length;i++) {
                    if (arguments[i]===0) {
                         throw new Error('division by 0');
                    }
                }
        
                for (var i=0;i<arguments.length;i++) {
                    this.number=this.number/arguments[i];
                }

                return this.number;
            },
            mul: function() {
                for (var i=0;i<arguments.length;i++) {
                    this.number=this.number*arguments[i];
                }

                return this.number;
            }
        };

    return calc;
}

export {
    isAllTrue,
    isSomeTrue,
    returnBadArguments,
    calculator
};
