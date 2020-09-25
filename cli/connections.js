var knx = require('knx')
var settings = require('./settings')
const { execSync } = require('child_process');
const fs = require('fs')
const { Connection, Products, Product } = require("klf-200-api");


module.exports = {
  knx: null,
  certificate: null,
  generatingCertificate: false,
  initKnxConneciton() {
    return new Promise((resolve, reject) => {
      this.knx = connection = knx.Connection({
        ipAddr: settings.knx_ip_address, ipPort: settings.knx_port,
        handlers: {
        connected: function() {
          console.log('connecte')
          resolve()
        },
        event: function (evt, src, dest, value) {

        }
        }
      });
    })
  },

  async initKLFConnection() {
    try {
      if (fs.existsSync('./velux-cert.pem') && fs.statSync('./velux-cert.pem').size) {
        this.certificate = fs.statSync('./velux-cert.pem')
 
        const myFingerprint = settings.settings.velux_fingerprint;
        const myCA = fs.readFileSync("velux-cert.pem");
 
        const conn = new Connection(settings.settings.velux_address, myCA, myFingerprint);
        return conn
      } else {
        this.generateCertificate()
      }
    } catch(err) {
      throw new Error(err)
    }
  },

  async generateCertificate() {
    this.generateCertificate = true
    execSync("echo -n | openssl s_client -connect " + settings.settings.velux_address + ":51200 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > velux-cert.pem");
    if(fs.statSync('./velux-cert.pem').size) {
      let fingerprint = execSync("openssl x509 -noout -fingerprint -sha1 -inform pem -in velux-cert.pem")
      console.log(fingerprint.toString().split("=")[1].trim())
      settings.settings.velux_fingerprint = fingerprint.toString().split("=")[1].trim()
      settings.save()
      this.generatingCertificate = false
      return
    } else {
      console.log('Error while generating certificate!')
      throw new Error('Error while generating certificate!')
    }
  },

  deleteCertificate() {
    fs.unlinkSync('./velux-cert.pem')
    this.certificate = false
  }
  
}
    
  


