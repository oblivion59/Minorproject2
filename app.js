const { app, BrowserWindow, ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');

var socket = require('socket.io-client')('http://192.168.0.161:5000');
var interval;

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 160,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.removeMenu();
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on("start-share", function(event , arg){

    var uuid = uuidv4();
    socket.emit("join-message", uuid);
    event.reply("uuid", uuid);

    // TODO: Take continuous sereenshots
    interval = setInterval(function(){
        screenshot().then((img) => {
            var imgStr = new Buffer(img).toString('base64'); // Converting image binary data to the base64 string

            var obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            // TODO: Broadcast to all other users
            socket.emit("screen-data", JSON.stringify(obj));
        })
    }, 100)
})

ipcMain.on("stop-share", function(event , arg){
    
    // TODO: Stop broadcasting & screenshot capturing
    clearInterval(interval);
})