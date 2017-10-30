import './style.sass';
var model=require('./model');
var view=require('./view');

var socket=new WebSocket('ws://localhost:9090');
var input=document.querySelector('#input');
var send=document.querySelector('#sendButton');
var logout=document.querySelector('#logout');
var login=document.querySelector('#login');
var modal=document.querySelector('#modal');
var upload=document.querySelector('#upload');
var messageContainer=document.querySelector('#messageContainer');
var user_info_avatar=document.querySelector('#user_info_avatar');
var upload_button=document.querySelector('#upload_button');
var sessions=[];

function addMessage(messages, type) {
    if (messages.history instanceof Array) {
        messageContainer.innerHTML='';
        messages.history.forEach(message=> {
            view.render(message, type);            
        })
    } else {
        view.render(messages, type);
    }
}

socket.addEventListener('message', event=> {
    var message=JSON.parse(event.data);

    console.log(message);

    if (message.type==='service') {
        if (message.hash) {
            model.localSave({ sessionId: message.hash, name: message.body.name, nick: message.body.nick, photo: message.body.photo });
            view.userInfo();
        } 
        if (message.body.text) {
            addMessage(message, 'service');
        }
        if (message.history) {                  //При последующих авторизованных запусках отображаем историю
            addMessage(message);
            model.localSave({ name: message.body.name, nick: message.body.nick, photo: message.body.photo });
            view.userInfo();
        }

        view.sessionsController(message, sessions);
    
        return null;
    }

    if (message.type==='changePhoto') {
        view.changePhoto(document.body, message.body.nick, message.body.photo);
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
        //view.userInfo();
    } else {
        view.modalOnOff('on');
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
    model.localSave({ name: '', sessionId: '', photo: '' });
    document.location.reload(true);
})

login.addEventListener('click', ()=> {
    var name=document.querySelector('#login_name').value;
    var nick=document.querySelector('#login_nick').value;
    var pass=document.querySelector('#login_pass').value;

    if (model.checkForm(modal)==undefined) {
        model.sendMessage({ type: 'hello', password: pass, name: name, nick: nick }, socket);
        view.modalOnOff('off');
    }
})

upload.addEventListener('dragover', e=> {
    if (e.dataTransfer.items[0].kind=='file') {
        e.preventDefault();
    }
})

upload.addEventListener('drop', e=> {
    var file=e.dataTransfer.items[0];

    if (file.type !== 'image/jpeg') {
        alert ('Выберите jpeg файл');
    }

    if (file && file.kind == 'file') {
        var reader=new FileReader();
        var reader2=new FileReader();

        e.preventDefault();

        reader.addEventListener('loadend', ()=> {
            
            upload_button.addEventListener('click', function s(e) {
                socket.send(reader.result);

                upload_button.removeEventListener('click', s);
                view.uploadModalOnOff('off');
            })
        })
        reader2.addEventListener('loadend', e=> {
            upload.style.background='url('+e.target.result+')';
            upload.style.color='rgba(0,0,0,0)';
        })

        reader.readAsArrayBuffer(file.getAsFile());
        reader2.readAsDataURL(file.getAsFile());
    }
})

user_info_avatar.addEventListener('click', ()=> {
    view.uploadModalOnOff('on');
})

input.addEventListener('keyup', e=> {
    console.log(e);
    if (e.key==='Enter') {
        if (!input.value) {
            return null;
        }
        model.sendMessage({ type: 'message', sessionId: localStorage.sessionId, text: input.value }, socket);
        input.value='';
    }
})