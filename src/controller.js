import './style.sass';
var model=require('./model');
var view=require('./view');

var SHA256 = require('crypto-js/sha256');
var socket=new WebSocket('ws://localhost:9090');
var input=document.querySelector('#input');
var send=document.querySelector('#sendButton');
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
    } else {
        var name=prompt('Enter name');
        var pass=prompt('Enter password');

        model.localSave({ name: name });
        model.sendMessage({ type: 'hello', password: pass, name: name }, socket);
    } 
});

send.addEventListener('click', ()=> {
    if (!input.value) {
        return null;
    }
    model.sendMessage({ type: 'message', sessionId: localStorage.sessionId, name: localStorage.name, text: input.value }, socket);
    input.value='';
});

