import Vue from "vue";
import { VueEventChannels } from "../vue-event-channels";
import { vueEventDispatcher } from "../vue-event-dispatcher";
import { PluginSettings } from "./plugin-settings";
import { SettingOsSpecific } from "./settings-os-specific";
import { TranslationSet } from "../../common/translation/translation-set";
import { GeneralSettings } from "./general-settings";

export const settingMenuItemComponent = Vue.extend({
    data() {
        return {
            isActive: false,
        };
    },
    methods: {
        getItemName(item: GeneralSettings | PluginSettings | SettingOsSpecific) {
            const translations: TranslationSet = this.translations;
            switch (item) {
                case GeneralSettings.Appearance:
                    return translations.appearanceSettings;
                case GeneralSettings.ColorTheme:
                    return translations.colorThemeSettings;
                case GeneralSettings.General:
                    return translations.generalSettings;
                case GeneralSettings.SearchEngine:
                    return translations.searchEngineSettings;
                case PluginSettings.ApplicationSearch:
                    return translations.applicationSearchSettings;
                case PluginSettings.Shortcuts:
                    return translations.shortcutSettings;
                case PluginSettings.Translation:
                    return translations.translationSettingsTranslation;
                case PluginSettings.WebSearch:
                    return translations.websearch;
                case PluginSettings.FileBrowser:
                    return translations.fileBrowser;
                case PluginSettings.OperatingSystemCommands:
                    return translations.operatingSystemCommands;
                case PluginSettings.Calculator:
                    return translations.calcuator;
                case SettingOsSpecific.Everything:
                    return translations.everythingSearch;
                case SettingOsSpecific.MdFind:
                    return translations.mdfindSearch;
                default:
                    return item;
            }
        },
        showSetting() {
            vueEventDispatcher.$emit(VueEventChannels.showSetting, this.item);
        },
    },
    mounted() {
        vueEventDispatcher.$on(VueEventChannels.showSetting, (item: string) => {
            this.isActive = this.item === item;
        });
    },
    props: ["item", "translations"],
    template: `
        <li @click="showSetting">
            <a :class="{ 'is-active' : isActive }">
                {{ getItemName(item) }}
            </a>
        </li>
    `,
});