var WSS=require('ws').Server;
var fs=require('fs');
var crypto=require('crypto');
var server=new WSS({ port: 9090 });
var connections=[];
var sessions=[];
var connectionNames=[];

/*
message={
	type: [hello, typing, message, service],
    hash: '',
	sessionId: 'string',
    password: 'string',
    photo: 'string',
	body: {
		text: 'string',
        name: 'srring'
        nick: 'string'
	}
}

session={
    sessionId: 'string',
    password: 'string',
    name: 'string',
    photo: 'string',
    messages: [{},{},...]
}
*/
function closeConnection(sessionId) {
    sessions.forEach(session=> {
        if (session.sessionId===sessionId) {
            connections.forEach(connection=> {
                connectionNames=connections.map(connection=> connection.name);
                sendResponse({ type: 'service', text: 'Пользователь '+session.name+' вышел из сети.', status: 'offline', name: session.name, sessions: connectionNames }, connection);
            })
        }
    })
}

function openConnection(sessionId) {
    sessions.forEach(session=> {
        if (session.sessionId===sessionId) {
            connections.forEach(connection=> {
                connectionNames=connections.map(connection=> connection.name);
                sendResponse({ type: 'service', sessions: connectionNames }, connection);
                if (connection.sessionId!==sessionId) { 
                    sendResponse({ type: 'service', text: 'Пользователь '+session.name+' в сети.', name: session.name, sessions: connectionNames }, connection);
                }
            })
        }
    })
}

function sendResponse(obj, socket) {
    var response={
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

    socket.send(JSON.stringify(response), error => {
        if (error) {
            connections = connections.filter(current => {
                return current !== socket;
            });

            closeConnection(socket.sessionId);
            console.log('close connection');
        }
    });
}

function sessionExist(message, socket) {
    var exist=false;

    sessions.forEach(session=> {
        if (session.nick===message.body.nick) {
            if (session.password===message.password) {
                sendResponse({ type: 'service', hash: session.sessionId, text: 'Вы вошли под ником '+session.nick, history: session.messages, name: session.name }, socket);

                socket.sessionId=session.sessionId; //Запоминаем в сокете Id сессии.
                socket.name=session.name;
                socket.nick=session.nick;

                exist=true;

                return null;
            } else {
                
                sendResponse({ type: 'service', hash: '', text: 'Не верный пароль' }, socket);
                exist=true;

                return null;
            }
        }
    })

    return exist;
}

function newSession(message, socket) {
    var session={};
    const secret = 'abc'+Math.random();
    const hash = crypto.createHmac('sha256', secret)
                 .update(message.body.name)
                 .digest('hex');

    session.sessionId=hash;
    session.name=message.body.name;
    session.nick=message.body.nick;
    session.photo=message.photo;
    session.password=message.password;
    session.messages=[];
    sessions.push(session);

    socket.sessionId=hash; //Запоминаем в сокете Id сессии.
    socket.name=message.body.name;
    socket.nick=message.body.nick;

    sendResponse({ type: 'service', hash: hash, text: 'Вы зарегистрированы под ником '+message.body.nick, name: message.body.name, nick: message.body.nick }, socket);
}

function session(message, socket) {

    if (message.sessionId) {
        if (sessions.some(session=> session.sessionId===message.sessionId)) {
            sessions.forEach(session=> {
                if (session.sessionId===message.sessionId) {
                    sendResponse({ type: 'service', history: session.messages, name: session.name }, socket);

                    socket.sessionId=message.sessionId; //Запоминаем в сокете Id сессии.
                    socket.name=session.name;
                    socket.nick=session.nick;

                    return null;
                }
            })
        } else {
            sendResponse({ type: 'service', text: 'Сессия с таким идентификатором не найдена на сервере' }, socket);
        }
    } else {
        if (!sessionExist(message, socket)) {
            newSession(message, socket);
        }  
    }
}

server.on('connection', socket=> {
    connections.push(socket);

    socket.on('message', message=> {
        var message=JSON.parse(message);

        if (message.type==='hello') {
            session(message, socket);
            openConnection(socket.sessionId);
        }

        if (message.type==='message') {
            if (sessions.some(session=> session.sessionId===message.sessionId)) {
                //Запись сообщения во все существующие сессии
                sessions.forEach(session=> {
                    session.messages.push({
                        photo: '',
                        body: {
                            name: socket.name,
                            text: message.body.text
                        }
                    });
                })
                //***********************************************
                connections.forEach(connection=> {
                    sendResponse({ type: 'message', text: message.body.text, name: socket.name }, connection);
                })
            } else {
                sendResponse({ type: 'service', text: 'не верный sessionId' }, socket);
            }
            
        }
	})


    socket.on('close', () => {
        connections = connections.filter(current => {
            return current !== socket;
        });

        closeConnection(socket.sessionId);
        console.log('close connection id: '+socket.sessionId);

    });
})

/*
message={
    type: [hello, typing, message, service],
    hash: '',
    sessionId: 'string',
    password: 'string',
    photo: 'string',
    body: {
        text: 'string',
        name: 'srring'
    }
}
*/