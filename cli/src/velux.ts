import { Connection, Products, Product } from 'klf-200-api';
import fs from 'fs';
import { execSync } from 'child_process';
import { VeluxConfig } from './types';

class VeluxConnection {
    private connection: Connection | null = null;
    private products: Products | null = null;

    async generateCertificate(address: string): Promise<string> {
        console.log('Generating Velux certificate...');

        // Check platform and set openssl path accordingly
        const isWindows = process.platform === 'win32';
        const opensslPath = isWindows ? 
            `"C:\\Program Files\\Git\\usr\\bin\\openssl.exe"` : 
            'openssl';
        try {
            execSync(`${opensslPath} s_client -connect ${address}:51200 -showcerts < nul | findstr /v "DONE" > velux-cert.pem`);
            
            if(fs.statSync('./velux-cert.pem').size) {
                const fingerprint = execSync(`${opensslPath} x509 -noout -fingerprint -sha1 -inform pem -in velux-cert.pem`);
                return fingerprint.toString().split("=")[1].trim();
            }
            throw new Error('Certificate generation failed');
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }

    async connect(config: VeluxConfig): Promise<Products> {
        try {
            let fingerprint: string | undefined;
            if (!fs.existsSync('./velux-cert.pem') || !fs.statSync('./velux-cert.pem').size) {
                fingerprint = await this.generateCertificate(config.address);
            }

            const ca = fs.readFileSync('./velux-cert.pem');
            this.connection = new Connection(config.address, ca, fingerprint);
            
            await this.connection.loginAsync(config.password);
            this.products = await Products.createProductsAsync(this.connection);
            
            console.log('Connected to Velux gateway');
            return this.products;
        } catch (error) {
            console.error('Velux connection error:', error);
            throw error;
        }
    }

    findProduct(name: string): Product | undefined {
        if (!this.products) throw new Error('Not connected to Velux gateway');
        return this.products.findByName(name);
    }
}

export default new VeluxConnection(); 