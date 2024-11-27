"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const velux_1 = __importDefault(require("./velux"));
const knx_1 = require("knx");
const device_1 = __importDefault(require("./device"));
async function main() {
    try {
        // Load config
        config_1.default.load();
        // Connect to KNX
        console.log('Connecting to KNX...');
        const knxConnection = new knx_1.Connection({
            ipAddr: config_1.default.knxConfig.address,
            ipPort: config_1.default.knxConfig.port,
            handlers: {
                connected: () => console.log('Connected to KNX'),
                error: (err) => console.error('KNX connection error:', err)
            }
        });
        // Connect to Velux
        console.log('Connecting to Velux...');
        const products = await velux_1.default.connect(config_1.default.veluxConfig);
        // Create devices
        console.log('Creating devices...');
        for (const deviceConfig of config_1.default.devices) {
            const veluxProduct = velux_1.default.findProduct(deviceConfig.velux_name);
            if (!veluxProduct) {
                console.error(`Velux product not found: ${deviceConfig.velux_name}`);
                continue;
            }
            new device_1.default(deviceConfig, knxConnection, veluxProduct);
            console.log(`Device created: ${deviceConfig.name}`);
        }
    }
    catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
}
main();
