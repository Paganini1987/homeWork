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
    messages: []
}
*/
function sendResponse(obj, socket) {
    var response={
                    type: obj.type || '',
                    hash: obj.hash || '',
                    sessionId: obj.sessionId || '',
                    password: obj.password || '',
                    photo: obj.photo || '',
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
                sendResponse({ type: 'service', hash: session.sessionId, text: 'Welcom again '+session.name }, socket);
                exist=true;

                return null;
            } else {
                var response={
                    type: 'service',
                    hash: '',
                    body: {
                        text: 'Wrong password!'
                    }
                }
                
                socket.send(JSON.stringify(response));
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
    sessions.push(session);

    var response={
        type: 'service',
        hash: hash,
        body:{
            text: 'Registration success!'
        }
    }
    socket.send(JSON.stringify(response));
}

function session(message, socket) {

    if (message.sessionId) {
 
        sessions.forEach(session=> {
            console.log(session);
            if (session.sessionId===message.sessionId) {

                var response={
                    type: 'service',
                    body: {
                        text: 'Hello '+session.name
                    }
                }
                
                socket.send(JSON.stringify(response));

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