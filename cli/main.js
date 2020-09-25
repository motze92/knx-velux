var settings = require('./settings')
var connections = require('./connections')
const { Connection, Products, Product } = require("klf-200-api");
const Device = require('./knx_device')

console.log('starting service')
settings.load()
// connections.initKnxConneciton().then(() => {
//   console.log('conneciton loaded')

// })

setTimeout(function() {



connections.initKnxConneciton().then(() => {

    console.log('knx connected')

    connections.initKLFConnection().then(async conn => {
        console.log('klf init')
        await conn.loginAsync(settings.settings.velux_password, 10);

	setInterval(function() {
		conn.loginAsync(settings.settings.velux_password, 10);
	}, 60 * 1000)

        console.log('klf login')
        const myProducts = await Products.createProductsAsync(conn);
        new Device({
            up_down_ga: "0/6/0",
            stop_ga: "0/6/1",
            position_ga: "0/6/2",
            position_state_ga: "0/6/6",
            alarm_ga: "0/6/8",
            velux_product_name: "Fenster Nord"
        }, connections.knx, myProducts)

        new Device({
            up_down_ga: "0/6/20",
            stop_ga: "0/6/21",
            position_ga: "0/6/22",
            position_state_ga: "0/6/26",
            alarm_ga: "0/6/28",
            velux_product_name: "Fenster Sued"
        }, connections.knx, myProducts)

        new Device({
            up_down_ga: "0/6/10",
            stop_ga: "0/6/11",
            position_ga: "0/6/12",
            position_state_ga: "0/6/16",
            alarm_ga: "0/6/18",
            velux_product_name: "Rollo Nord"
        }, connections.knx, myProducts)

        new Device({
            up_down_ga: "0/6/30",
            stop_ga: "0/6/31",
            position_ga: "0/6/32",
            position_state_ga: "0/6/36",
            alarm_ga: "0/6/38",
            velux_product_name: "Rollo Sued"
        }, connections.knx, myProducts)

        // try {
        //     // Read the product's data:
        //     console.log(myProducts)
        //     // Find the window by it's name:
        // const myKitchenWindow = myProducts.findByName("Fenster Nord");
        // myKitchenWindow.onRunStatus

        //     if (myKitchenWindow) {
        //         await myKitchenWindow.setTargetPositionAsync(0);
        //     } else {
        //         throw(new Error("Could not find kitchen window."));
        //     }
        // } finally {
        //     await conn.logoutAsync();
        // }
    })

})
}, 30000)
