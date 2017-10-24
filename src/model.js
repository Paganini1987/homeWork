module.exports = {
    localSave (data) {
        for (var prop in data) {
            localStorage[prop]=data[prop];
        }
    },
    sendMessage (obj, socket) {
        var message={
            type: obj.type || '',
            hash: obj.hash || '',
            sessionId: obj.sessionId || '',
            password: obj.password || '',
            photo: obj.photo || '',
            history: obj.history || '',
            sessions: obj.sessions || '',
            status: obj.status || 'online',
            body: {
                text: obj.text || '',
                name: obj.name || '',
                nick: obj.nick || '',
            }
        }

        socket.send(JSON.stringify(message));
    },
    checkForm(form) {
        var inputs=form.children;

        for (var i=0; i<inputs.length; i++) {
            if (inputs[i].tagName==='INPUT') {
                if (inputs[i].value==='') {
                    inputs[i].style.border='1px solid #d9534f';

                    return false;
                } else {
                    inputs[i].style.border='1px solid #5cb85c';
                }
            } else {
                this.checkForm(inputs[i]);
            }
        }
    }
}