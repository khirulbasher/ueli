import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { CommandLineExecutionArgumentValidator } from "./execution-argument-validators/command-line-execution-argument-validator";
import { ElectronizrCommandExecutionArgumentValidator } from "./execution-argument-validators/electronizr-command-execution-argument-validator";
import { FilePathExecutionArgumentValidator } from "./execution-argument-validators/file-path-execution-argument-validator";
import { WebSearchExecutionArgumentValidator } from "./execution-argument-validators/web-search-execution-argument-validator";
import { WebUrlExecutionArgumentValidator } from "./execution-argument-validators/web-url-execution-argument-validator";
import { CommandLineExecutor } from "./executors/command-line-executor";
import { ElectronizrCommandExecutor } from "./executors/electronizr-command-executor";
import { FilePathExecutor } from "./executors/file-path-executor";
import { WebSearchExecutor } from "./executors/web-search-executor";
import { WebUrlExecutor } from "./executors/web-url-executor";
import { InputValidationService } from "./input-validation-service";
import { WebSearch } from "./web-search";

// tslint:disable-next-line:no-var-requires
const pkg = require("../../package.json");
const version = pkg.version;
const appName = pkg.productName;
const defaultConfig = {
    autoStartApp: true,
    maxSearchResultCount: 8,
    rescanInterval: 30,
    searchOperatinSystemSettings: true,
    version,
    windowWith: 860,
};

const configFilePath = path.join(os.homedir(), "electronizr.config.json");
const config = loadConigFromConfigFile();

function loadConigFromConfigFile(): any {
    try {
        const fileContent = fs.readFileSync(configFilePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (parsed.version === undefined || !parsed.version.startsWith("3")) {
            writeDefaultConfigToConfigFile();
            return defaultConfig;
        } else {
            return parsed;
        }
    } catch (err) {
        writeDefaultConfigToConfigFile();
        return defaultConfig;
    }
}

function writeDefaultConfigToConfigFile(): void {
    const stringifiedConfig = JSON.stringify(defaultConfig);
    fs.writeFileSync(configFilePath, stringifiedConfig, "utf-8");
}

export class Config {
    public static readonly userInputHeight = 80;
    public static readonly searchResultHeight = 60;
    public static readonly configFilePath = configFilePath;

    public static readonly windowWith = config.windowWith === undefined
        ? defaultConfig.windowWith
        : config.windowWith;

    public static readonly maxSearchResultCount = config.maxSearchResultCount === undefined
        ? defaultConfig.maxSearchResultCount
        : config.maxSearchResultCount;

    public static readonly rescanInterval = config.rescanInterval === undefined
        ? defaultConfig.rescanInterval
        : config.rescanInterval;

    public static readonly minWindowHeight = Config.userInputHeight;
    public static readonly maxWindowHeight = Config.userInputHeight + (Config.maxSearchResultCount * Config.searchResultHeight);

    public static readonly autoStartApp = config.autoStartApp;

    public static readonly searchOperatinSystemSettings = config.searchOperatinSystemSettings;
    public static readonly searchWindows10Apps = config.searchWindows10Apps;

    public static readonly commandLinePrefix = ">";
    public static readonly electronizrCommandPrefix = "ezr:";
    public static readonly windowsSettingsPrefix = "win:";
    public static readonly webSearchSeparator = "?";

    public static readonly webSearches = [
        {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1">
                        <g id="surface1">
                            <path d="M 16.003906 14.0625 L 16.003906 18.265625 L 21.992188 18.265625 C 21.210938 20.8125 19.082031 22.636719 16.003906 22.636719 C 12.339844 22.636719 9.367188 19.664063 9.367188 16 C 9.367188 12.335938 12.335938 9.363281 16.003906 9.363281 C 17.652344 9.363281 19.15625 9.96875 20.316406 10.964844 L 23.410156 7.867188 C 21.457031 6.085938 18.855469 5 16.003906 5 C 9.925781 5 5 9.925781 5 16 C 5 22.074219 9.925781 27 16.003906 27 C 25.238281 27 27.277344 18.363281 26.371094 14.078125 Z "></path>
                        </g>
                    </svg>`,
            name: "Google",
            prefix: "g",
            url: "https://google.com/search?q=",
        } as WebSearch,
        {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1">
                    <g id="surface1">
                        <path d="M 2 5 L 2 27 L 30 27 L 30 5 Z M 4 7 L 28 7 L 28 20.90625 L 22.71875 15.59375 L 22 14.875 L 17.46875 19.40625 L 11.71875 13.59375 L 11 12.875 L 4 19.875 Z M 24 9 C 22.894531 9 22 9.894531 22 11 C 22 12.105469 22.894531 13 24 13 C 25.105469 13 26 12.105469 26 11 C 26 9.894531 25.105469 9 24 9 Z M 11 15.71875 L 20.1875 25 L 4 25 L 4 22.71875 Z M 22 17.71875 L 28 23.71875 L 28 25 L 23.03125 25 L 18.875 20.8125 Z "></path>
                    </g>
                </svg>`,
            name: "Google Images",
            prefix: "gi",
            url: "https://www.google.com/search?tbm=isch&q=",
        } as WebSearch,
        {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1">
                        <g id="surface1">
                            <path d="M 16 4 C 9.382813 4 4 9.382813 4 16 C 4 22.617188 9.382813 28 16 28 C 22.617188 28 28 22.617188 28 16 C 28 9.382813 22.617188 4 16 4 Z M 16 6 C 21.535156 6 26 10.464844 26 16 C 26 20.886719 22.527344 24.929688 17.90625 25.8125 C 17.859375 25.742188 17.835938 25.703125 17.78125 25.625 C 17.417969 25.109375 17.148438 24.6875 17 24.375 C 17.945313 24.757813 18.582031 24.9375 18.90625 24.9375 C 19.144531 24.9375 19.25 24.582031 19.25 23.84375 C 19.25 22.46875 19.125 21.78125 18.875 21.78125 C 18.503906 21.78125 17.8125 22.1875 16.75 23 C 16.75 22.792969 16.628906 22.6875 16.40625 22.71875 L 16.28125 22.71875 C 15.898438 21.699219 15.71875 20.800781 15.71875 20 C 15.71875 19.777344 15.734375 19.566406 15.78125 19.34375 C 17.140625 20.007813 18.234375 20.34375 19.0625 20.34375 C 19.519531 20.34375 20.199219 20.203125 21.125 19.9375 C 22.050781 19.671875 22.53125 19.375 22.53125 19.0625 C 22.53125 18.871094 22.40625 18.78125 22.15625 18.78125 C 21.773438 18.78125 21.191406 18.835938 20.46875 18.9375 C 19.746094 19.039063 19.195313 19.09375 18.8125 19.09375 C 18.414063 19.09375 17.980469 18.988281 17.5 18.78125 C 17.019531 18.574219 16.78125 18.292969 16.78125 17.9375 C 16.78125 17.863281 16.789063 17.816406 16.8125 17.78125 C 16.832031 17.746094 16.863281 17.726563 16.90625 17.71875 C 16.949219 17.710938 16.988281 17.710938 17.03125 17.71875 C 17.074219 17.726563 17.144531 17.710938 17.21875 17.71875 C 17.292969 17.726563 17.347656 17.75 17.40625 17.75 C 17.539063 17.75 17.746094 17.746094 18 17.78125 C 18.253906 17.816406 18.445313 17.84375 18.5625 17.84375 C 19.019531 17.84375 19.953125 17.570313 21.375 17.03125 C 22.792969 16.492188 23.5 16.078125 23.5 15.78125 C 23.5 15.605469 23.367188 15.480469 23.09375 15.40625 C 22.820313 15.332031 22.546875 15.3125 22.3125 15.3125 C 22.105469 15.3125 21.789063 15.359375 21.375 15.46875 C 20.960938 15.578125 20.519531 15.71875 20.03125 15.875 C 19.542969 16.03125 19.226563 16.113281 19.0625 16.15625 C 19.121094 15.859375 19.15625 15.648438 19.15625 15.46875 C 19.15625 14.773438 18.960938 13.957031 18.59375 13.03125 C 18.222656 12.105469 17.800781 11.410156 17.3125 10.96875 C 16.914063 10.613281 16.382813 10.382813 15.71875 10.25 C 15.304688 9.71875 14.660156 9.21875 13.78125 8.78125 C 12.902344 8.34375 12.117188 8.125 11.4375 8.125 C 11.304688 8.125 11.085938 8.167969 10.8125 8.21875 C 10.539063 8.269531 10.386719 8.296875 10.3125 8.3125 L 9.8125 9 L 9.9375 9.03125 C 10.042969 9.03125 10.222656 8.996094 10.4375 8.96875 C 10.652344 8.9375 10.800781 8.9375 10.90625 8.9375 C 11.410156 8.9375 11.972656 9.042969 12.625 9.25 C 12.210938 9.457031 11.84375 9.582031 11.53125 9.65625 C 11.5 9.671875 11.410156 9.695313 11.25 9.71875 C 11.089844 9.742188 10.953125 9.757813 10.84375 9.78125 C 10.734375 9.804688 10.628906 9.871094 10.53125 9.9375 C 10.433594 10.003906 10.40625 10.085938 10.40625 10.1875 C 11.234375 10.097656 11.835938 10.03125 12.25 10.03125 C 12.8125 10.03125 13.269531 10.085938 13.59375 10.1875 C 12.457031 10.320313 11.582031 10.726563 10.96875 11.375 C 10.355469 12.027344 10.03125 12.925781 10.03125 14.0625 C 10.03125 14.460938 10.066406 14.816406 10.125 15.15625 C 10.40625 16.929688 10.953125 19.574219 11.75 23.09375 C 11.96875 24.113281 12.085938 24.640625 12.21875 25.25 C 8.566406 23.761719 6 20.195313 6 16 C 6 10.464844 10.464844 6 16 6 Z M 17.40625 12.21875 C 17.777344 12.21875 18.039063 12.394531 18.1875 12.71875 C 17.890625 12.570313 17.628906 12.5 17.4375 12.5 C 17.007813 12.5 16.742188 12.589844 16.625 12.78125 C 16.683594 12.410156 16.949219 12.21875 17.40625 12.21875 Z M 12.34375 12.46875 C 12.625 12.46875 12.820313 12.589844 12.96875 12.78125 C 12.792969 12.707031 12.648438 12.65625 12.53125 12.65625 C 12.28125 12.65625 12.03125 12.761719 11.75 12.9375 C 11.46875 13.117188 11.328125 13.328125 11.34375 13.5625 C 11.300781 13.472656 11.28125 13.371094 11.28125 13.28125 C 11.28125 13.03125 11.394531 12.828125 11.625 12.6875 C 11.855469 12.546875 12.089844 12.46875 12.34375 12.46875 Z M 17.78125 13.84375 C 17.957031 13.84375 18.09375 13.9375 18.21875 14.0625 C 18.34375 14.1875 18.40625 14.324219 18.40625 14.5 C 18.40625 14.664063 18.34375 14.804688 18.21875 14.9375 C 18.09375 15.070313 17.960938 15.15625 17.78125 15.15625 C 17.617188 15.15625 17.476563 15.070313 17.34375 14.9375 C 17.210938 14.804688 17.125 14.664063 17.125 14.5 C 17.125 14.324219 17.210938 14.1875 17.34375 14.0625 C 17.476563 13.9375 17.617188 13.84375 17.78125 13.84375 Z M 18.0625 14.125 C 17.960938 14.125 17.90625 14.179688 17.90625 14.28125 C 17.90625 14.398438 17.957031 14.46875 18.0625 14.46875 C 18.179688 14.46875 18.25 14.398438 18.25 14.28125 C 18.25 14.175781 18.179688 14.125 18.0625 14.125 Z M 12.75 14.1875 C 12.941406 14.1875 13.125 14.28125 13.28125 14.4375 C 13.4375 14.59375 13.53125 14.746094 13.53125 14.9375 C 13.53125 15.128906 13.4375 15.3125 13.28125 15.46875 C 13.125 15.625 12.941406 15.6875 12.75 15.6875 C 12.558594 15.6875 12.40625 15.625 12.25 15.46875 C 12.09375 15.3125 12 15.128906 12 14.9375 C 12 14.746094 12.09375 14.59375 12.25 14.4375 C 12.40625 14.28125 12.558594 14.1875 12.75 14.1875 Z M 13.09375 14.5 C 12.960938 14.5 12.90625 14.554688 12.90625 14.6875 C 12.90625 14.804688 12.960938 14.875 13.09375 14.875 C 13.226563 14.875 13.28125 14.804688 13.28125 14.6875 C 13.28125 14.554688 13.226563 14.5 13.09375 14.5 Z "></path>
                        </g>
                    </svg>`,
            name: "DuckDuckGo",
            prefix: "d",
            url: "https://duckduckgo.com/?q=",
        } as WebSearch,
        {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1">
                        <g id="surface1">
                            <path d="M 16 6 C 12.234375 6 8.90625 6.390625 6.875 6.6875 C 5.195313 6.933594 3.839844 8.199219 3.53125 9.875 C 3.269531 11.300781 3 13.386719 3 16 C 3 18.613281 3.269531 20.699219 3.53125 22.125 C 3.839844 23.800781 5.195313 25.070313 6.875 25.3125 C 8.914063 25.609375 12.253906 26 16 26 C 19.746094 26 23.085938 25.609375 25.125 25.3125 C 26.804688 25.070313 28.160156 23.800781 28.46875 22.125 C 28.730469 20.695313 29 18.605469 29 16 C 29 13.394531 28.734375 11.304688 28.46875 9.875 C 28.160156 8.199219 26.804688 6.933594 25.125 6.6875 C 23.09375 6.390625 19.765625 6 16 6 Z M 16 8 C 19.632813 8 22.878906 8.371094 24.84375 8.65625 C 25.6875 8.78125 26.347656 9.417969 26.5 10.25 C 26.742188 11.570313 27 13.527344 27 16 C 27 18.46875 26.742188 20.429688 26.5 21.75 C 26.347656 22.582031 25.691406 23.222656 24.84375 23.34375 C 22.871094 23.628906 19.609375 24 16 24 C 12.390625 24 9.125 23.628906 7.15625 23.34375 C 6.3125 23.222656 5.652344 22.582031 5.5 21.75 C 5.257813 20.429688 5 18.476563 5 16 C 5 13.519531 5.257813 11.570313 5.5 10.25 C 5.652344 9.417969 6.308594 8.78125 7.15625 8.65625 C 9.117188 8.371094 12.367188 8 16 8 Z M 13 10.28125 L 13 21.71875 L 14.5 20.875 L 21.5 16.875 L 23 16 L 21.5 15.125 L 14.5 11.125 Z M 15 13.71875 L 18.96875 16 L 15 18.28125 Z "></path>
                        </g>
                    </svg>`,
            name: "YouTube",
            prefix: "yt",
            url: "https://www.youtube.com/results?search_query=",
        } as WebSearch,
        {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" version="1.1">
                        <g id="surface1">
                            <path d="M 3 5 L 3 23 L 8 23 L 8 28.09375 L 9.625 26.78125 L 14.34375 23 L 29 23 L 29 5 Z M 5 7 L 27 7 L 27 21 L 13.65625 21 L 13.375 21.21875 L 10 23.90625 L 10 21 L 5 21 Z M 9.21875 9 L 9 9.6875 L 7.0625 15.6875 L 7 15.84375 L 7 17 L 9 17 L 9 16.125 L 9.03125 16 L 10.96875 16 L 11 16.125 L 11 17 L 13 17 L 13 15.84375 L 12.9375 15.6875 L 11 9.6875 L 10.78125 9 Z M 20 11 L 20 12 L 17 12 L 17 14 L 21.4375 14 C 21.269531 14.289063 21.082031 14.59375 20.84375 14.90625 C 20.769531 15.003906 20.675781 15.09375 20.59375 15.1875 C 20.105469 14.738281 19.75 14.34375 19.75 14.34375 L 18.25 15.65625 C 18.25 15.65625 18.574219 16.003906 19.0625 16.46875 C 18.476563 16.785156 17.804688 17 17 17 L 17 19 C 18.476563 19 19.710938 18.503906 20.6875 17.8125 C 21.609375 18.449219 22.71875 19 24 19 L 24 17 C 23.472656 17 22.820313 16.742188 22.1875 16.375 C 22.265625 16.277344 22.363281 16.1875 22.4375 16.09375 C 23.082031 15.25 23.429688 14.53125 23.65625 14 L 25 14 L 25 12 L 22 12 L 22 11 Z M 10 13.0625 L 10.3125 14 L 9.6875 14 Z "></path>
                        </g>
                    </svg>`,
            name: "Linguee",
            prefix: "l",
            url: "http://www.linguee.de/deutsch-englisch/search?source=auto&query=",
        } as WebSearch,
    ];

    public static calculateWindowHeight(searchResultCount: number): number {
        return searchResultCount >= Config.maxSearchResultCount
            ? Config.maxWindowHeight
            : Config.minWindowHeight + (searchResultCount * Config.searchResultHeight);
    }

    public static getConfig(): any {
        return config;
    }
}
