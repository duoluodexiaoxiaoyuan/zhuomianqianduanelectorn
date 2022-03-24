if (window && window.process && window.process.type === "renderer") {
  const { ipcRenderer } = require("electron");
  ipcRenderer.on("change-view", (event, url) => {
    window.location.href = url;
  });
}
