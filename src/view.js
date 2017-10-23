module.exports = {
    userInfo() {
        var user_info_name=document.querySelector('#user_info_name');

        if (localStorage.name) {
            user_info_name.innerText=localStorage.name;
        }
    },
    sessionsController(message, sessions) { // Добавлет или удаляет пользователей из списка
        var sessionsContainer=document.querySelector('#sessionsContainer');
        var length=document.querySelector('#length');

        if (message.sessions) {
            sessions=message.sessions.map(session=> { return { name: session } });
        }

        console.log(sessions);
        sessionsContainer.innerHTML='';
        length.innerText=sessions.length;
        sessions.sort();
        sessions.forEach(session=> {
            var li=document.createElement('LI');
            var div=document.createElement('DIV');
    
            li.id=session.name;
            div.innerText=session.name;
            li.appendChild(div);
            sessionsContainer.appendChild(li);
        })
    },
    render(message, type) { // Отображение сообщений в чате
        var messageContainer=document.querySelector('#messageContainer');
        var li=document.createElement('LI');
        var div=document.createElement('DIV');
        var div2=document.createElement('DIV');
        var name=document.createElement('DIV');
        var text=document.createElement('DIV');
        var img=document.createElement('IMG');

        this.leftOrRight(message, li, type);
    
        if (type==='service') {
            div.classList.add('bg-info');
        } else {
            div.classList.add('bg-primary');
        }
        if (type!=='service') {
            img.setAttribute('src', message.photo || '/img/noavatar.png');
            name.classList.add('user_name');
            name.innerText=message.body.name;
            text.classList.add('user_message');
            text.innerText=message.body.text;
            div2.appendChild(name);
            div2.appendChild(text);
            div.appendChild(img);
            div.appendChild(div2);
        } else {
            div.innerText=message.body.text;
        }
        
        messageContainer.appendChild(li).appendChild(div);
    },
    leftOrRight(message, wrap, type) { // Свои-чужие сообщения, отображаютсяя справа или слева
        if (message.body.name===localStorage.name && type!=='service') {
            wrap.classList.add('left');
        } else {
            wrap.classList.add('right');
        }   
    },
    interfceOnOFF(flag) {
        var main_container=document.querySelector('#main_container');

        if (flag==='on') {
            main_container.classList.remove('bw');
        } else {
            main_container.classList.add('bw');
        }
    }
    
}