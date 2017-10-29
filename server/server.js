var WSS=require('ws').Server;
var http=require('http');
var fs=require('fs');
var crypto=require('crypto');
var server=new WSS({ port: 9090 });
var connections=[];
var sessions=[];
var connectionNames=[];

/*
message={
	type: [hello, typing, message, service, changePhoto],
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
    nick: 'string',
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

function changePhoto(nick, photo) {
    connections.forEach(connection=> {
        sendResponse({ type: 'changePhoto', nick: nick, photo: photo }, connection);
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
                sendResponse({ type: 'service', hash: session.sessionId, text: 'Вы вошли под ником '+session.nick, photo: session.photo, history: session.messages, name: session.name }, socket);

                socket.sessionId=session.sessionId; //Запоминаем в сокете Id сессии.
                socket.name=session.name;
                socket.nick=session.nick;
                socket.photo=session.photo;

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
                    sendResponse({ type: 'service', photo: session.photo, history: session.messages, name: session.name }, socket);

                    socket.sessionId=message.sessionId; //Запоминаем в сокете Id сессии.
                    socket.name=session.name;
                    socket.nick=session.nick;
                    socket.photo=session.photo;
                    
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

    socket.on('message', m=> {
        var message;

        try {                                       //Ели не получается распарсить JSON, значит пришёл бинарный файл
            message=JSON.parse(m);
        } catch (err) {
            var date=new Date();
            var x=date.getTime();

            fs.writeFile('./avatars/'+socket.nick+x+'.jpg', m); //сохраняем аватар в файле с именем сессии
            socket.photo='http://localhost:8888/'+socket.nick+x+'.jpg';

            sessions.forEach(session=> {
                if (session.nick===socket.nick) {
                    session.photo='http://localhost:8888/'+socket.nick+x+'.jpg';
                }
            })

            changePhoto(socket.nick, socket.photo);

            return null;
        }

        if (message.type==='hello') {
            session(message, socket);
            openConnection(socket.sessionId);
        }

        if (message.type==='message') {
            if (sessions.some(session=> session.sessionId===message.sessionId)) {
                //Запись сообщения во все существующие сессии
                sessions.forEach(session=> {
                    session.messages.push({
                        body: {
                            name: socket.name,
                            nick: socket.nick,
                            text: message.body.text
                        }
                    });
                })
                //***********************************************
                connections.forEach(connection=> {
                    sendResponse({ type: 'message', photo: socket.photo, text: message.body.text, nick: socket.nick, name: socket.name }, connection);
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

//HTTP сервер для отдачи картинок

var httpServer=http.createServer((request, response)=> {
    var url=request.url;

    existFile('./avatars'+url)
        .then(()=>({ code: 200, path: './avatars' + url }))
        .catch(()=>({ code: 404, path: './avatars/noavatar.png' }))
        .then(data=> {
            if (data.path.includes('..')) {
                data.path='./avatars/noavatar.png';
                data.code=404;
            }
            console.log(data.path);
            return loadFile(data.path);
        })
        .then(photo=> {
            response.write(photo);
            response.end();
        })
});

function existFile(path) {
    return new Promise((resolve, reject)=> {
        fs.exists(path, result=> {
            if (result) {
                resolve();
            } else {
                reject();
            }
        })
    })
}

function loadFile(path) {
    return new Promise((resolve, reject)=> {
        fs.readFile(path, (error, response)=> {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        })
    })
}

httpServer.listen(8888);