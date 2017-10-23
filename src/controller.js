import './style.sass';
var model=require('./model');
var view=require('./view');

var SHA256 = require('crypto-js/sha256');
var socket=new WebSocket('ws://localhost:9090');
var input=document.querySelector('#input');
var send=document.querySelector('#sendButton');
var logout=document.querySelector('#logout');
var login=document.querySelector('#login');
var modal=document.querySelector('#modal');
var sessions=[];

function addMessage(messages, type) {
    if (messages instanceof Array) {
        messages.forEach(message=> {
            view.render(message, type);            
        })
    } else {
        view.render(messages, type);
    }
}

socket.addEventListener('message', event=> {
    var message=JSON.parse(event.data);

    if (message.type==='service') {
        if (message.hash) {
            model.localSave({ sessionId: message.hash });
        } 
        if (message.body.text) {
            addMessage(message, 'service');
        }
        if (message.history) {                  //При последующих авторизованных запусках отображаем историю
            addMessage(message.history);
        }

        view.sessionsController(message, sessions);
    
        return null;
    }

    if (message.type==='message') {
        addMessage(message);

        return null;
    }
});

socket.addEventListener('error', function() {
    alert('Соединение закрыто или не может быть открыто');
});

socket.addEventListener('open', ()=> {
    if (localStorage.sessionId) {
        model.sendMessage({ type: 'hello', sessionId: localStorage.sessionId }, socket);
        view.userInfo();
    } else {
        modal.style.display='block';
        
    } 
});

send.addEventListener('click', ()=> {
    if (!input.value) {
        return null;
    }
    model.sendMessage({ type: 'message', sessionId: localStorage.sessionId, text: input.value }, socket);
    input.value='';
});

logout.addEventListener('click', ()=> {
    model.localSave({ name: '', sessionId: '' });
    document.location.reload(true);
})

login.addEventListener('click', ()=> {
    var name=document.querySelector('#login_name').value;
    var nick=document.querySelector('#login_nick').value;
    var pass=document.querySelector('#login_pass').value;

    model.sendMessage({ type: 'hello', password: pass, name: name }, socket);
    model.localSave({ name: name });
    view.userInfo();
    modal.style.display='none';
    
})