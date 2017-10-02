module.exports = function () {

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

    function init() {
        return new Promise(function(resolve, reject) {
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
    }

    return {
        api: api,
        init: init
    };
};

