module.exports = {
    userInfo() {
        var user_info_name=document.querySelector('#user_info_name');
        var avatar=document.querySelector('#user_info_avatar');

        if (localStorage.name) {
            user_info_name.innerText=localStorage.name;
        }
        if (localStorage.nick) {
            avatar.classList.add(localStorage.nick);
        }
        if (localStorage.photo) {
            avatar.setAttribute('src', localStorage.photo);
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
        var time=document.createElement('span');

        this.leftOrRight(message, li, type);
    
        if (type==='service') {
            div.classList.add('bg-info');
        } else {
            div.classList.add('bg-primary');
        }

        if (type!=='service') {
            img.setAttribute('src', message.body.photo || '/img/noavatar.png');
            img.classList.add(message.body.nick);
            time.innerText=message.body.time;
            name.classList.add('user_name');
            name.innerText=message.body.name;
            name.appendChild(time);
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
    modalOnOff(flag) {
        var main_container=document.querySelector('#main_container');
        var modal=document.querySelector('#modal');
        var wrap_modal=document.querySelector('.wrap_modal');

        if (flag==='on') {
            main_container.classList.add('bw');
            modal.classList.add('active');
            wrap_modal.classList.add('active');
        } else {
            main_container.classList.remove('bw');
            modal.classList.remove('active');
            wrap_modal.classList.remove('active');
        }
    },
    uploadModalOnOff(flag) {
        var modal=document.querySelector('#upload_modal');
        var cancel_button=document.querySelector('#cancel_button');
        var upload=document.querySelector('#upload');

        if (flag==='on') {
            modal.classList.add('active');
            upload.style.background='';
            upload.style.color='rgba(0,0,0,1)';
            cancel_button.addEventListener('click', ()=> {
                modal.classList.remove('active');
            })
            
        } else {
            modal.classList.remove('active');
        }
    },
    changePhoto(elem, elClass, src) {
        var elem=elem.children;
        
        for (var i=0; i<elem.length; i++) {
            if (elem[i].tagName==='IMG' && elem[i].classList.contains(elClass)) {
                elem[i].setAttribute('src', src);
            } else if (elem[i].children.length) {
                this.changePhoto(elem[i], elClass, src);
            }
        }
    }
    
}