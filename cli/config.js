const yaml = require('js-yaml');
const fs = require('fs');

class Config {
    constructor() {
        this.config = null;
    }

    load() {
        try {
            this.config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));
        } catch (e) {
            console.error('Error loading config:', e);
            throw e;
        }
    }

    get veluxConfig() {
        return this.config.velux;
    }

    get knxConfig() {
        return this.config.knx;
    }

    get devices() {
        return this.config.devices;
    }
}

module.exports = new Config(); 