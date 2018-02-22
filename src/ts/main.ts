import { app, BrowserWindow, globalShortcut, ipcMain, Menu, MenuItem, Tray } from "electron";
import { autoUpdater } from "electron-updater";
import * as fs from "fs";
import * as path from "path";
import { Config } from "./config";
import { FilePathExecutionArgumentValidator } from "./execution-argument-validators/file-path-execution-argument-validator";
import { ExecutionService } from "./execution-service";
import { FilePathExecutor } from "./executors/file-path-executor";
import { Injector } from "./injector";
import { InputValidationService } from "./input-validation-service";
import { SearchEngine } from "./search-engine";

// tslint:disable-next-line:no-var-requires
const isDev = require("electron-is-dev");

let mainWindow: BrowserWindow;
let trayIcon: Tray;
const filePathExecutor = new FilePathExecutor();
const inputValidationService = new InputValidationService();
const executionService = new ExecutionService();

function createMainWindow(): void {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        backgroundColor: "#00000000",
        center: true,
        frame: false,
        height: Config.maxWindowHeight,
        resizable: false,
        show: false,
        skipTaskbar: true,
        width: Config.windowWith,
    });

    mainWindow.loadURL(`file://${__dirname}/../../main.html`);
    mainWindow.setSize(Config.windowWith, Config.minWindowHeight);

    mainWindow.on("close", quitApp);
    mainWindow.on("blur", hideMainWindow);

    createTrayIcon();
    registerGlobalShortCuts();

    if (!isDev) {
        checkForUpdates();
        setAutostartSettings();
    }
}

function createTrayIcon(): void {
    trayIcon = new Tray(Injector.getTrayIconPath(path.join(__dirname, "../../")));
    trayIcon.setToolTip("electronizr");
    trayIcon.setContextMenu(Menu.buildFromTemplate([
        {
            click: toggleWindow,
            label: "Show/Hide",
        },
        {
            click: quitApp,
            label: "Exit",
        },
    ]));
}

function registerGlobalShortCuts(): void {
    globalShortcut.register("alt+space", toggleWindow);
}

function checkForUpdates(): void {
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
}

function downloadUpdate(): void {
    autoUpdater.downloadUpdate();
    addUpdateStatusToTrayIcon("Downloading update...");
}

autoUpdater.on("update-available", (): void => {
    addUpdateStatusToTrayIcon("Download & install update", downloadUpdate);
});

autoUpdater.on("error", (): void => {
    addUpdateStatusToTrayIcon("Update check failed");
});

autoUpdater.on("update-not-available", (): void => {
    addUpdateStatusToTrayIcon("electronizr is up to date");
});

autoUpdater.on("update-downloaded", (): void => {
    autoUpdater.quitAndInstall();
});

function setAutostartSettings() {
    app.setLoginItemSettings({
        args: [],
        openAtLogin: Config.autoStartApp,
        path: process.execPath,
    });
}

function addUpdateStatusToTrayIcon(label: string, clickHandler?: any): void {
    const updateItem = clickHandler === undefined
        ? { label }
        : { label, click: clickHandler } as MenuItem;

    trayIcon.setContextMenu(Menu.buildFromTemplate([
        updateItem,
        {
            click: toggleWindow,
            label: "Show/Hide",
        },
        {
            click: quitApp,
            label: "Exit",
        },
    ]));
}

function toggleWindow(): void {
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow.show();
    }
}

function updateWindowSize(searchResultCount: number): void {
    const newWindowHeight = Config.calculateWindowHeight(searchResultCount);
    mainWindow.setSize(Config.windowWith, newWindowHeight);
}

function hideMainWindow(): void {
    if (mainWindow !== null && mainWindow !== undefined) {
        mainWindow.hide();
    }
}

function reloadApp(): void {
    mainWindow.reload();
}

function quitApp(): void {
    globalShortcut.unregisterAll();
    app.quit();
}

app.on("ready", createMainWindow);
app.on("window-all-closed", quitApp);
ipcMain.on("hide-window", hideMainWindow);
ipcMain.on("ezr:reload", reloadApp);
ipcMain.on("ezr:exit", quitApp);

ipcMain.on("get-search", (event: any, arg: string): void => {
    const userInput = arg;
    const result = inputValidationService.getSearchResult(userInput);
    updateWindowSize(result.length);
    event.sender.send("get-search-response", result);
});

ipcMain.on("execute", (event: any, arg: string): void => {
    const executionArgument = arg;
    executionService.execute(executionArgument);
});

ipcMain.on("open-file-location", (event: any, arg: string): void => {
    const filePath = arg;
    if (new FilePathExecutionArgumentValidator().isValidForExecution(filePath)) {
        filePathExecutor.openFileLocation(filePath);
    }
});

ipcMain.on("auto-complete", (event: any, arg: string[]): void => {
    const userInput = arg[0];
    let executionArgument = arg[1];
    const dirSeparator = Injector.getDirectorySeparator();

    if (new FilePathExecutionArgumentValidator().isValidForExecution(userInput)) {
        if (!executionArgument.endsWith(dirSeparator) && fs.lstatSync(executionArgument).isDirectory()) {
            executionArgument = `${executionArgument}${dirSeparator}`;
        }

        event.sender.send("auto-complete-response", executionArgument);
    }
});

ipcMain.on("get-search-icon", (event: any): void => {
    const iconManager = Injector.getIconManager();
    event.sender.send("get-search-icon-response", iconManager.getSearchIcon());
});

ipcMain.on("command-line-execution", (arg: string): void => {
    mainWindow.webContents.send("command-line-output", arg);
    updateWindowSize(Config.maxSearchResultCount);
});
