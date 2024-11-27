import config from './config';
import velux from './velux';
import { Connection as KnxConnection } from 'knx';
import Device from './device';

async function main(): Promise<void> {
    try {
        // Load config
        config.load();

        // Connect to KNX
        console.log('Connecting to KNX...');
        const knxConnection = new KnxConnection({
            ipAddr: config.knxConfig.address,
            ipPort: config.knxConfig.port,
            handlers: {
                connected: () => console.log('Connected to KNX'),
                error: (err: Error) => console.error('KNX connection error:', err)
            }
        });

        // Connect to Velux
        console.log('Connecting to Velux...');
        const products = await velux.connect(config.veluxConfig);

        // Create devices
        console.log('Creating devices...');
        for (const deviceConfig of config.devices) {
            const veluxProduct = velux.findProduct(deviceConfig.velux_name);
            if (!veluxProduct) {
                console.error(`Velux product not found: ${deviceConfig.velux_name}`);
                continue;
            }

            new Device(deviceConfig, knxConnection, veluxProduct);
            console.log(`Device created: ${deviceConfig.name}`);
        }

    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
}

main(); 