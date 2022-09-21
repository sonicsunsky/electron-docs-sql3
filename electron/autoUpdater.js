const { BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const log = require("electron-log");

log.transports.file.level = "debug";
autoUpdater.logger = log;

const NODE_ENV = process.env.NODE_ENV;

console.log(NODE_ENV, __dirname);

if (NODE_ENV === "development") {
  autoUpdater.updateConfigPath = path.join(__dirname, "dev-app-update.yml");
}

module.exports = () => {
  let win = null;

  autoUpdater.autoDownload = false;

  autoUpdater.checkForUpdates();

  function sendStatusToWindow(msg) {
    console.log(msg);
    log.info(msg);
  }

  autoUpdater.on("checking-for-update", function () {
    sendStatusToWindow("Checking for update...");
  });

  autoUpdater.on("update-not-available", function (info) {
    sendStatusToWindow("Update not available.");
  });

  autoUpdater.on("update-available", function (info) {
    sendStatusToWindow("Update available.");
    // autoUpdater.downloadUpdate() ;
  });

  autoUpdater.on("error", function (err) {
    sendStatusToWindow("Error in auto-updater.");
  });

  function createWindow() {
    win = new BrowserWindow({
      width: 1366,
      height: 768,
      title: "人员文档管理系统",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // 渲染页面可以使用node api
        preload: path.join(__dirname, "preload.js"),
      },
    });

    win.loadURL(
      NODE_ENV === "development"
        ? "http://localhost:3001"
        : `file://${path.join(__dirname, "../dist/index.html")}`
    );

    // 打开开发工具
    if (NODE_ENV === "development") {
      win.webContents.openDevTools();
    }

    return win;
  }

  autoUpdater.on("download-progress", function (progressObj) {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message =
      log_message + " - Downloaded " + parseInt(progressObj.percent) + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    sendStatusToWindow(log_message);
  });

  autoUpdater.on("update-downloaded", function (info) {
    sendStatusToWindow("Update downloaded; will install in 1 seconds");

    dialog
      .showMessageBox({
        title: "下载完成",
        message: "最新版本已下载完成, 退出程序进行安装",
      })
      .then(() => {
        autoUpdater.quitAndInstall();
      });
  });

  // 我们需要主动触发一次更新检查
  ipcMain.on("checkForUpdate", () => {
    // 当我们收到渲染进程传来的消息，主进程就就进行一次更新检查
    autoUpdater.checkForUpdates();
  });

  return createWindow;
};
