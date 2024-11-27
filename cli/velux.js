const { Connection, Products } = require('klf-200-api');
const fs = require('fs');
const { execSync } = require('child_process');

class VeluxConnection {
    constructor() {
        this.connection = null;
        this.products = null;
    }

    async generateCertificate(address) {
        console.log('Generating Velux certificate...');
        try {
            const opensslPath = `"C:\\Program Files\\Git\\usr\\bin\\openssl.exe"`;
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

    async connect(config) {
        try {
            let fingerprint;
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

    findProduct(name) {
        return this.products.findByName(name);
    }
}

module.exports = new VeluxConnection(); 