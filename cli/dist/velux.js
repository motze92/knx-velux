"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const klf_200_api_1 = require("klf-200-api");
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
class VeluxConnection {
    constructor() {
        this.connection = null;
        this.products = null;
    }
    async generateCertificate(address) {
        console.log('Generating Velux certificate...');
        try {
            const opensslPath = `"C:\\Program Files\\Git\\usr\\bin\\openssl.exe"`;
            (0, child_process_1.execSync)(`${opensslPath} s_client -connect ${address}:51200 -showcerts < nul | findstr /v "DONE" > velux-cert.pem`);
            if (fs_1.default.statSync('./velux-cert.pem').size) {
                const fingerprint = (0, child_process_1.execSync)(`${opensslPath} x509 -noout -fingerprint -sha1 -inform pem -in velux-cert.pem`);
                return fingerprint.toString().split("=")[1].trim();
            }
            throw new Error('Certificate generation failed');
        }
        catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }
    async connect(config) {
        try {
            let fingerprint;
            if (!fs_1.default.existsSync('./velux-cert.pem') || !fs_1.default.statSync('./velux-cert.pem').size) {
                fingerprint = await this.generateCertificate(config.address);
            }
            const ca = fs_1.default.readFileSync('./velux-cert.pem');
            this.connection = new klf_200_api_1.Connection(config.address, ca, fingerprint);
            await this.connection.loginAsync(config.password);
            this.products = await klf_200_api_1.Products.createProductsAsync(this.connection);
            console.log('Connected to Velux gateway');
            return this.products;
        }
        catch (error) {
            console.error('Velux connection error:', error);
            throw error;
        }
    }
    findProduct(name) {
        if (!this.products)
            throw new Error('Not connected to Velux gateway');
        return this.products.findByName(name);
    }
}
exports.default = new VeluxConnection();
