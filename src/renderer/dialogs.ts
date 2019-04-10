import { ipcRenderer } from "electron";
import { IpcChannels } from "../common/ipc-channels";

export function getFolderPath(): Promise<string> {
    return new Promise((resolve, reject) => {
        ipcRenderer.send(IpcChannels.folderPathRequested);
        ipcRenderer.once(IpcChannels.folderPathResult, (event: Electron.Event, folderPaths: string[]) => {
            if (folderPaths.length > 0) {
                resolve(folderPaths[0]);
            } else {
                reject("No folder selected");
            }
        });
    });
}

export function getFilePath(filters: Electron.FileFilter[]): Promise<string> {
    return new Promise((resolve, reject) => {
        ipcRenderer.send(IpcChannels.filePathRequested, filters);
        ipcRenderer.once(IpcChannels.filePathResult, (event: Electron.Event, filePaths: string[]) => {
            if (filePaths.length > 0) {
                resolve(filePaths[0]);
            } else {
                reject("No files selected");
            }
        });
    });
}

export function getFileAndFolderPaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        ipcRenderer.send(IpcChannels.folderAndFilePathsRequested);
        ipcRenderer.once(IpcChannels.folderAndFilePathsResult, (event: Electron.Event, foldersAndFiles: string[]) => {
            if (foldersAndFiles.length > 0) {
                resolve(foldersAndFiles);
            } else {
                reject("No files and folders selected");
            }
        });
    });
}