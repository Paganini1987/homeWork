var WSS=require('ws').Server;
var fs=require('fs');
var crypto=require('crypto');
var server=new WSS({ port: 9090 });
var connections=[];
var sessions=[];


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

session={
    sessionId: 'number',
    password: 'string',
    name: 'string',
    photo: 'string',
    messages: [{},{},...]
}
*/
function sendResponse(obj, socket) {
    var response={
                    type: obj.type || '',
                    hash: obj.hash || '',
                    sessionId: obj.sessionId || '',
                    password: obj.password || '',
                    photo: obj.photo || '',
                    history: obj.history || '',
                    body: {
                        text: obj.text || '',
                        name: obj.name || ''
                    }
                }

    socket.send(JSON.stringify(response), error => {
        if (error) {
            connections = connections.filter(current => {
                return current !== socket;
            });

            console.log('close connection');
        }
    });
}

function sessionExist(message, socket) {
    var exist=false;

    sessions.forEach(session=> {
        if (session.name===message.body.name) {
            if (session.password===message.password) {
                sendResponse({ type: 'service', hash: session.sessionId, history: session.messages }, socket);
                exist=true;

                return null;
            } else {
                
                sendResponse({ type: 'service', hash: '', text: 'Wrong password!' }, socket);
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
    session.photo=message.photo;
    session.password=message.password;
    session.messages=[];
    sessions.push(session);

    sendResponse({ type: 'service', hash: hash, text: 'Registration success!', text: 'Вы зарегистрированы под ником '+ message.body.name}, socket);
}

function session(message, socket) {

    if (message.sessionId) {
 
        sessions.forEach(session=> {
            if (session.sessionId===message.sessionId) {
                sendResponse({ type: 'service', history: session.messages }, socket);

                return null;
            }
        })
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
        }

        if (message.type==='message') {
            if (sessions.some(session=> session.sessionId===message.sessionId)) {
                //Запиь сообщения во все существующие сессии
                sessions.forEach(session=> {
                    session.messages.push({
                        photo: '',
                        body: {
                            name: message.body.name,
                            text: message.body.text
                        }
                    });
                })
                //***********************************************
                connections.forEach(connection=> {
                    sendResponse({ type: 'message', text: message.body.text, name: message.body.name }, connection);
                })
            } else {
                sendResponse({ type: 'service', text: 'wrong sessionId' }, socket);
            }
            
        }
	})


    socket.on('close', () => {
        connections = connections.filter(current => {
            return current !== socket;
        });

        console.log('close connection');
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