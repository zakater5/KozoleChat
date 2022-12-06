// Config //
var httpServer_Port = 3000; //Routed from port 80 using Nginx

// -> Database/s
const Promise = require('bluebird'); // For Async
const DB_Op = require('./SQL/dbOperator');
const Repo = require('./SQL/Repository');
const userManager = require('./SQL/userManager');
const LoggerClass = require('./Logger');

const db_op = new DB_Op('./Database.sqlite3');
const repo = new Repo(db_op);
const UserManager = new userManager();
const Logger = new LoggerClass();
repo.createUsersTable();
repo.createMessagesTable();

// -> Webserver
var siofu = require("socketio-file-upload"); // file upload
const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session'); //for storing a logged-in user's session
const http = require('http');
const { json } = require('express/lib/response');
const favicon = require('serve-favicon'); //for website favicon (the tab icon)
const { Console } = require('console');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    maxHttpBufferSize: 1e8 // 100 MB
});

// -> http-Endpoints
var getRequests = ['/', '/login', '/register', '/console', '/logout', '/yourscripts', '/newscript'];
var getRequests_misc = ['/WhatsMyIp', '/getScriptSource']; //getScriptSource (arg1 = script id) / not in use
var postRequests = ['/register', '/login', '/sendMessage'];

// -> WebServer-setup
app.use("/static", express.static('./static/')); //Serving the client js / css / image files from the server
app.use("/images", express.static('./images/'));
app.use(favicon(__dirname + '/rsLogo.ico')); //setting favicon
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(siofu.router); // file upload

const sessionMiddleware = sessions({
    secret: "thisTheSecretKeyeeeererdgfdgd44563df2",
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 24}, // 1 day
    resave: false //after maxAge is passed
})
app.use(sessionMiddleware);
app.use(cookieParser()); //so that the server can access the necessary options to save
app.set('view engine', 'pug'); //enabling pug - template middleware

// User-Account variables //
var allSessions = [];

// -> Request listeners
app.get(getRequests, (req, res) => {
    var session = req.session;

    if (session.userid){ //user loggen in
        if (req.path == '/'){
            repo.getAllMessages().then(function(responseObj){
                if (responseObj){
                    res.render('home', {sessionMessages: responseObj, onlineSessions: allSessions});
                }
            });
        }

    } else {
        if (req.path == '/'){
            res.render('index');
        }
        else if (req.path == '/login'){
            res.render('Login');
        }
        else if (req.path == '/register'){
            res.render('Register');
        }
    }
});

// POST - all //
app.post(postRequests, (req, res) => {
    var session = req.session;

    if (req.path == '/register'){
        var Email = req.body.email;
        var Username = req.body.username;
        var Password = req.body.password;
        var ConfirmPassword = req.body.confirmPassword;

        UserManager.registerNewUser(res, repo, Email, Username, Password, ConfirmPassword).then(function(responseObj){
            if(responseObj){
                if(responseObj.success == true){
                    req.session.userid = Username;
                    res.redirect('/');
                }
            }
        });
    }
    
    else if (req.path == '/login'){
        var Username = req.body.username;
        var Password = req.body.password;

        UserManager.loginUser(res, repo, Username, Password).then(function(responseObj){
            if(responseObj){
                if(responseObj.success == true){
                    req.session.userid = Username;
                    res.redirect('/');
                }
            }
        });
    }
});


// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// -> Socket.io handler
io.on('connection', (socket) => {
    var uploader = new siofu();
    uploader.dir = "./uploads/";
    uploader.listen(socket);

    console.log('User connected');
    var session = socket.request.session;

    if(session.userid){ //check if user is logged in
        allSessions.push(session.userid);
        io.emit('refresh_members_add', session.userid);

        socket.on('chat_message_event', (msg) => {
            repo.saveMessage(session.userid, msg);
            io.emit('chat_message', {sentBy: session.userid, content: msg});
            console.log(msg);
        });

        socket.on('file_upload', (msg) => {
            repo.saveMessage(session.userid, msg);
            io.emit('file_upload', {sentBy: session.userid, content: msg});
            console.log(msg);
        });
    
        socket.on('disconnect', () => {
            console.log('user disconnected');
            if(session.userid){ //check if user is logged in
                const index = allSessions.indexOf(session.userid);
                if (index > -1){// only splice array when item is found
                    allSessions.splice(index, 1);
                }
                io.emit('refresh_members_remove', session.userid);
            }
        });
    }
});

io.on('connect_error', (err) => {
    console.log(`connect_error : ${err.message}`);
});

// WebServer Listener/s
server.listen(httpServer_Port, "0.0.0.0", () => {
    console.log("Listening on port *:", httpServer_Port);
});