//const SocketIOFileUploadServer = require("socketio-file-upload");

var socket = io();
//var uploader = new SocketIOFileUpload(socket); // file upload
//uploader.listenOnInput(document.getElementById('siofu_input'));

const msgBox = document.getElementById('messageBox');
const messages_div = document.getElementById('messages');
const usersList = document.getElementById('usersList');
const fileInput = document.querySelector('input');

messages_div.scrollTop = messages_div.scrollHeight;

msgBox.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        socket.emit('chat_message_event', msgBox.value);
        e.preventDefault();
        msgBox.value = '';
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result
            .replace('data', '')
            .replace(/^.+,/, '');

        console.log(base64String);
        socket.emit('file_upload', base64String);
    };
    reader.readAsDataURL(file);
});

socket.on('chat_message', function(msgInfo){
    var newMsg_div = document.createElement('div');
    newMsg_div.style.cssText += 'margin-top: 10px; background-color: #474747; border-radius: 10px; width: 100%;'
    messages_div.appendChild(newMsg_div);

    var newMsg_username = document.createElement('a');
    newMsg_username.style.cssText += 'color: #d9d9d9; font-size: 25px; text-decoration: none; margin-left: 2%;';
    newMsg_div.appendChild(newMsg_username);

    var breakLine = document.createElement('br');
    newMsg_div.appendChild(breakLine);

    var newMsg_content = document.createElement('p');
    newMsg_content.style.cssText += 'color: #bfbdbd; word-wrap: break-word; white-space: pre-line; overflow-wrap: break-word; -ms-word-break: break-word; margin-left: 3%; margin-right: 3%;';
    newMsg_div.appendChild(newMsg_content);

    newMsg_username.textContent = msgInfo.sentBy;
    newMsg_content.textContent = msgInfo.content;
    messages_div.scrollTop = messages_div.scrollHeight;
});

socket.on('file_upload', function(msgInfo){ //msgInfo included base64 for file (image)
    var newMsg_div = document.createElement('div');
    newMsg_div.style.cssText += 'margin-top: 10px; background-color: #474747; border-radius: 10px; width: 100%;'
    messages_div.appendChild(newMsg_div);

    var newMsg_username = document.createElement('a');
    newMsg_username.style.cssText += 'color: #d9d9d9; font-size: 25px; text-decoration: none; margin-left: 2%;';
    newMsg_div.appendChild(newMsg_username);

    var breakLine = document.createElement('br');
    newMsg_div.appendChild(breakLine);

    var newMsg_content = document.createElement('img');
    newMsg_content.style.cssText += 'color: #bfbdbd; word-wrap: break-word; white-space: pre-line; overflow-wrap: break-word; -ms-word-break: break-word; margin-left: 3%; margin-right: 3%;';
    newMsg_div.appendChild(newMsg_content);

    newMsg_username.textContent = msgInfo.sentBy;
    newMsg_content.src = msgInfo.content;
    messages_div.scrollTop = messages_div.scrollHeight;
});

socket.on('refresh_members_add', function(username){
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var a = document.createElement('a');
    usersList.appendChild(tr);
    tr.appendChild(td);
    td.appendChild(a);
    a.style.cssText += 'color: #d9d9d9; text-decoration: none;';
    a.textContent = username;
});

socket.on('refresh_members_remove', function(username){
    for(var i = 0, row; row = usersList.rows[i]; i++){
        if(row.textContent === username){
            row.remove();
        }
    }
});