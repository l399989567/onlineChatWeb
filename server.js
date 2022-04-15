// "socket.io": "^2.1.1"
const express = require("express");
const app = express();
// 创建服务器
const server = require("http").createServer(app);
// 创建服务器
const io = require("socket.io").listen(server).sockets;

// 获得页面 - xiang
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

let connectedUser = []; // 用于存储所有的 userName

let isCreateUser = false;

// Socket.io connect
io.on("connection", socket => {
    // 链接
    console.log('a user connected');
    updateUserName();

    // 存储用户输入的用户名
    let userName = '';

    // 登录 Login
    socket.on('login', (name, callback) => {
        if (name.trim().length === 0) {
            return;
        }// 掐头去尾，判断名字输入是否为空
        else if (connectedUser.indexOf(name) > -1) {
            socket.emit('sameName');
            isCreateUser = false;
            return;
        }// 是否重名
        else {
            callback(true); // 回传用于执行页面切换
            isCreateUser = true;
            userName = name;
            // 添加用户名
            connectedUser.push(userName);
            // console.log(connectedUser);
            updateUserName();
        }
    });

    // 接受聊天消息
    socket.on('chat message', msg => {
        if (msg.trim().length === 0) {
            return;
        }
        else {
            // console.log(msg);
            // 输出消息
            io.emit('output message', {
                name: userName,
                msg: msg
            });
        }
    });

    // 断开链接--刷新页面
    socket.on("disconnect", () => {
        if (isCreateUser === true) {
            console.log('user disconnected');
            // 删除用户名
            connectedUser.splice(connectedUser.indexOf(userName), 1);
            // console.log(connectedUser);
            updateUserName();
        }
    });

    function updateUserName() {
        io.emit('loadUser', connectedUser);
    }
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server running on port ${port}`));