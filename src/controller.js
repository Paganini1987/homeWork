var SHA256 = require("crypto-js/sha256");
var socket=new WebSocket('ws://localhost:9090');
var messageContainer=document.querySelector('#messageContainer');
var input=document.querySelector('#input');
var send=document.querySelector('#sendButton');
var sessionsContainer=document.querySelector('#sessionsContainer');
var sessions=[];

function sessionsController(message) {
    console.log(message);
    if (!sessions.some(session=> session.name===message.body.name) && message.status==='online') {
        sessions.push({ name: message.body.name });
    }
    if (message.status==='offline') {
        sessions=sessions.filter(session=> session.name!==message.body.name);
    }
    if (message.sessions) {
        sessions=message.sessions.map(session=> { return { name: session } });
    }

    sessionsContainer.innerHTML='';
    sessions.forEach(session=> {
        var li=document.createElement('LI');
        var div=document.createElement('DIV');

        li.id=session.name;
        div.innerText=session.name;
        li.appendChild(div);
        sessionsContainer.appendChild(li);
    })
}

function leftOrRight(message, wrap, type) {
    if (message.body.name===localStorage.name && type!=='service') {
        wrap.classList.add('left');
    } else {
        wrap.classList.add('right');
    }   
}

function render(message, type) {
    var li=document.createElement('LI');
    var div=document.createElement('DIV');
    
    leftOrRight(message, div, type);

    if (type==='service') {
        li.classList.add('bg-info');
    } else {
        li.classList.add('bg-primary');
    }
    if (type!=='service') {
        li.innerText=message.body.name+': '+message.body.text;
    } else {
        li.innerText=message.body.text;
    }
    
    messageContainer.appendChild(div).appendChild(li);
}

function addMessage(messages, type) {
    if (messages instanceof Array) {
        messages.forEach(message=> {
            render(message, type);            
        })
    } else {
        render(messages, type);
    }
}

socket.addEventListener('message', event=> {
    var message=JSON.parse(event.data);

    if (message.type==='service') {
        if (message.hash) {
            localStorage.sessionId=message.hash;
        } 
        if (message.body.text) {
            addMessage(message, 'service');
        }
        if (message.history) {                  //При последующих авторизованных запусках отображаем историю
            addMessage(message.history);
        }

        sessionsController(message);
    
        return null;
    }

    if (message.type==='message') {
        console.log(message)
        addMessage(message)

        return null;
    }
	
});

socket.addEventListener('error', function() {
  alert('Соединение закрыто или не может быть открыто');
});

socket.addEventListener('open', ()=> {
    if (localStorage.sessionId) {
        var request={
            type: 'hello',
            sessionId: localStorage.sessionId
        }
    } else {
        var name=prompt('Enter name');
        var pass=prompt('Enter password');

        localStorage.name=name;
        var request={
            type: 'hello',
            sessionId: '',
            password: pass,
            photo: '',
            body: {
                name: name
            }
        }
    }
    socket.send(JSON.stringify(request));  
});


send.addEventListener('click',()=> {
    var request={
        type: 'message',
        sessionId: localStorage.sessionId || '',
        body: {
            name: localStorage.name,
            text: input.value
        }
    }
    
	socket.send(JSON.stringify(request));
});

