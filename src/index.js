import './style.sass';
var templateElement = require('./list.hbs');
var results=document.querySelector('#list');

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

promise
    .then(function() {
        return api('friends.get', { count: 10, v: 5.68, fields: 'first_name, last_name, photo_100, city' });
    })
    .then(function(data) {
        var template = templateElement({ list: data.items });

        results.innerHTML = template;
    })
    .catch(function(e) {
        alert(e.message);
    });