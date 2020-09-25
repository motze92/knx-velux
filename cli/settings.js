const fs = require('fs')

module.exports = {
  settings: null,

  save() {
    fs.writeFileSync('settings.json', JSON.stringify(this.settings))
  },

  load() {
    this.settings = JSON.parse(fs.readFileSync('settings.json'))
  }
}