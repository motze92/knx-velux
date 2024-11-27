"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
class Config {
    constructor() {
        this.config = null;
    }
    load() {
        try {
            this.config = js_yaml_1.default.load(fs_1.default.readFileSync('./config.yaml', 'utf8'));
        }
        catch (e) {
            console.error('Error loading config:', e);
            throw e;
        }
    }
    get veluxConfig() {
        if (!this.config)
            throw new Error('Config not loaded');
        return this.config.velux;
    }
    get knxConfig() {
        if (!this.config)
            throw new Error('Config not loaded');
        return this.config.knx;
    }
    get devices() {
        if (!this.config)
            throw new Error('Config not loaded');
        return this.config.devices;
    }
}
exports.default = new Config();
