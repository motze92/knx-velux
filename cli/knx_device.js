const knx = require('knx');

function Device(options, conn, velux_products) {
  if (options == null) {
    throw "must supply options!";
  }
  this.up_down_ga = options.up_down_ga;
  this.stop_ga = options.stop_ga;
  this.position_ga = options.position_ga;
  this.position_state_ga = options.position_state_ga;
  this.alarm_ga = options.alarm_ga;
  this.velux_product_name = options.velux_product_name;
  if (conn && velux_products) this.bind(conn, velux_products);
  this.log = knx.Log.get();
}

Device.prototype.bind = function (conn, velux_products) {
  if (!conn) this.log.warn("must supply a valid KNX connection to bind to");
  if (!velux_products) this.log.warn("must supply valid Veluxproducts to bind to");

  this.conn = conn;
  this.velux_product = velux_products.findByName(this.velux_product_name)

  if (!this.velux_product) this.log.warn("velux product " + this.velux_product_name + "not found");
  this.up_down = new knx.Datapoint({ga: this.up_down_ga}, conn);
  this.stop = new knx.Datapoint({ga: this.stop_ga}, conn);
  this.position = new knx.Datapoint({ga: this.position_ga, dpt: "DPT5.001"}, conn);
  this.position_state = new knx.Datapoint({ga: this.position_state_ga, dpt: "DPT5.001"}, conn);
  this.alarm = new knx.Datapoint({ga: this.alarm_ga}, conn);
  this.up_down.on('change', (old_value, new_value) => {
    if (new_value) {
        this.velux_product.setTargetPositionAsync(1)
    } else {
        this.velux_product.setTargetPositionAsync(0)
    }
  })

  this.stop.on('change', (old_value, new_value) => {
    this.velux_product.stopAsync()
  })

  this.position.on('change', (old_value, new_value) => {
    this.velux_product.setTargetPositionAsync(new_value / 100)
  })
  this.velux_product.onRunStatus = (val) => { 
      if (this.velux_product.CurrentPosition) {
        this.position_state.write(this.velux_product.CurrentPosition * 100);
      }
  }

}


module.exports = Device;
