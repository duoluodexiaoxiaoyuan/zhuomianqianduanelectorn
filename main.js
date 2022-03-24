const {
  app,
  BrowserWindow,
  Notification,
  Menu,
  MenuItem,
  Tray,
  dialog,
} = require("electron");
const path = require("path");

let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // 表示会预加载preload.js文件
      // preload: path.join(__dirname, "preload.js"),
      preload: path.join(__dirname, "a.js"),
    },
  });

  mainWindow.loadFile("index.html");
};

const NOTIFICATION_TITLE = "Basic Notification";
const NOTIFICATION_BODY = "Notification from the Main process";
// 这个通知是在主进城里面渲染的
function showNotification() {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
}
let tray = null;
function displayTray() {
  tray = new Tray("2.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      role: "minimize",
      label: "最小化",
      click: () => {
        mainWindow.minimize();
      },
    },
    {
      role: "togglefullscreen",
      label: "全屏",
      click: () => {
        mainWindow.setFullScreen(mainWindow.isFullScreen() !== true);
      },
    },
    {
      label: "退出",
      role: "quit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip(app.name);
  tray.setContextMenu(contextMenu);
  tray.on("right-click", () => {
    tray.popUpContextMenu(contextMenu);
  });
  // 左键点击
  tray.on("click", (e, bounds) => {
    mainWindow.show();
  });
}
// 显示对话框
function displayDialog() {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "png", "gif"] },
        { name: "Movies", extensions: ["mkv", "avi", "mp4"] },
        { name: "Custom File Type", extensions: ["as"] },
        { name: "All Files", extensions: ["*"] },
      ],
    })
    .then((result) => {
      if (result.canceled) {
        console.log("Dialog was canceled");
      } else {
        const file = result.filePaths[0];
        mainWindow.loadURL(`file://${file}`);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// 显示确认对话框
function displayConfirmDialog() {
  dialog
    .showMessageBox(mainWindow, {
      type: "warning",
      title: "退出" + app.name,
      defaultId: 0,
      cancelId: 1,
      icon: "2.png",
      message: "确定要退出嘛",
      buttons: ["退出", "取消"],
    })
    .then((res) => {
      if (res.response === 0) {
        app.exit(); //exit()直接关闭客户端，不会执行quit();
      } else {
        console.log(res.response);
      }
    });
}

app.whenReady().then(() => {
  createWindow();
  displayTray();
  // displayDialog();
  displayConfirmDialog();
  showNotification();
  const menu = new Menu();
  menu.append(new MenuItem({ label: "复制", role: "copy" }));
  menu.append(new MenuItem({ label: "粘贴", role: "paste" }));
  menu.append(new MenuItem({ label: "刷新", role: "reload" }));
  menu.append(new MenuItem({ label: "全选", role: "selectall" }));
  menu.append(new MenuItem({ label: "剪切", role: "cut" }));
  menu.append(new MenuItem({ label: "删除", role: "delete" }));
  menu.append(new MenuItem({ label: "撤销", role: "undo" }));
  menu.append(new MenuItem({ label: "重做", role: "redo" }));
  mainWindow.webContents.on("context-menu", (e, params) => {
    // 这是确定点击右键弹出的位置
    menu.popup({ window: mainWindow, x: params.x, y: params.y });
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const isMac = process.platform === "darwin";
const sendMenuEvent = async (url) => {
  mainWindow.webContents.send("change-view", url);
};
const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "文件",
    submenu: [isMac ? { role: "close" } : { role: "quit", label: "退出" }],
  },
  // { role: 'editMenu' }
  {
    label: "编辑",
    submenu: [
      { role: "undo", label: "撤销" },
      { role: "redo", label: "重做" },
      { type: "separator" },
      { role: "cut", label: "剪切" },
      { role: "copy", label: "复制" },
      { role: "paste", label: "粘贴" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete", label: "删除" },
            { role: "selectAll", label: "全选" },
            { type: "separator" },
            {
              label: "搜索",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [
            { role: "delete", label: "删除" },
            { type: "separator" },
            { role: "selectAll", label: "全选" },
          ]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "视图",
    submenu: [
      { role: "reload", label: "重新加载" },
      { role: "forceReload", label: "强制重新加载" },
      { role: "toggleDevTools", label: "调试工具" },
      { type: "separator" },
      { role: "resetZoom", label: "重置窗口" },
      { role: "zoomIn", label: "放大" },
      { role: "zoomOut", label: "缩小" },
      { type: "separator" },
      { role: "togglefullscreen", label: "全屏" },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: "窗口",
    submenu: [
      { role: "minimize", label: "最小化" },
      { role: "zoom", label: "缩放" },
      ...(isMac
        ? [
            { type: "separator" },
            { role: "front", label: "前置" },
            { type: "separator" },
            { role: "window", label: "窗口" },
          ]
        : [{ role: "close", label: "退出" }]),
    ],
  },
  {
    role: "help",
    label: "帮助",
    submenu: [
      {
        label: "API文档",
        click: async () => {
          // 在工具内部打开
          sendMenuEvent("https://electronjs.org");
        },
      },
      {
        label: "learn more",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://www.baidu.com");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
