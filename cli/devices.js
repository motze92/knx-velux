const fs = require('fs')

module.exports = [
  {
    name: "Fenster Nord",
    velux: null,
    knx: null,
    knx_settings: {
      up_down: "0/6/0",
      stop: "0/6/1",
      position: "0/6/2",
      position_state: "0/6/6",
      alarm: "0/6/8"
    }
  }
]