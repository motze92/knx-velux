import yaml from 'js-yaml';
import fs from 'fs';
import { AppConfig } from './types';

class Config {
    private config: AppConfig | null = null;

    load(): void {
        try {
            this.config = yaml.load(fs.readFileSync('./config.yaml', 'utf8')) as AppConfig;
        } catch (e) {
            console.error('Error loading config:', e);
            throw e;
        }
    }

    get veluxConfig(): AppConfig['velux'] {
        if (!this.config) throw new Error('Config not loaded');
        return this.config.velux;
    }

    get knxConfig(): AppConfig['knx'] {
        if (!this.config) throw new Error('Config not loaded');
        return this.config.knx;
    }

    get devices(): AppConfig['devices'] {
        if (!this.config) throw new Error('Config not loaded');
        return this.config.devices;
    }
}

export default new Config(); 