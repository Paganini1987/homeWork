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
                name: obj.name || ''
            }
        }

        socket.send(JSON.stringify(message));
    }
}