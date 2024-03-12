const { app, BrowserWindow, ipcMain } = require('electron/main'); //, Menu
// const { mainMenu } = require("./menu");
const path = require('path');

const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		// fullscreen: true,
		icon: path.join(__dirname, 'icon.png'),
		// autoHideMenuBar: true
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	win.loadFile('index.html');
	win.removeMenu();
	win.maximize();
	// Uncommenting the line below opens the dev tools
	win.webContents.openDevTools();
}

// Menu.setApplicationMenu(mainMenu);

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

ipcMain.handle("getDirname", () => __dirname);
ipcMain.handle("pathJoin", () => path.join());