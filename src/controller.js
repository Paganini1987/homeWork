var SHA256 = require("crypto-js/sha256");

var socket=new WebSocket('ws://localhost:9090');
var messageContainer=document.querySelector('#messageContainer');
var input=document.querySelector('#input');
var send=document.querySelector('#sendButton');

socket.addEventListener('message', event=> {
    var message=JSON.parse(event.data);

    if (message.type==='service') {
        if (message.hash) {
            localStorage.hash=message.hash;
        } 
        if (message.body.text) {
            console.log(message.body.text);
        }
    
        return null;
    }

    if (message.type==='message') {
        var li=document.createElement('LI');

        li.classList.add('bg-info');
        li.innerText=message.body.text;
        messageContainer.appendChild(li);

        return null;
    }
	
});

socket.addEventListener('error', function() {
  alert('Соединение закрыто или не может быть открыто');
});

socket.addEventListener('open', ()=> {
    if (localStorage.hash) {
        var request={
            type: 'hello',
            sessionId: localStorage.hash
        }
    } else {
        var name=prompt('Enter name');
        var pass=prompt('Enter password');

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
        sessionId: localStorage.hash || '',
        body: {
            text: input.value
        }
    }
    
	socket.send(JSON.stringify(request));
});

