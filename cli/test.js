import { Connection, Products, Product, ParameterActive } from "klf-200-api";

/*
    Use either the IP address or the name of *your* interface
    'velux-klf-12ab' is just a placeholder in this example.
*/
const conn = new Connection('192.168.0.112');

/*
    Login with *your* password.
    The default password is the same as the WiFi password
    that is written on back side of the KLF200.
    For security reason you should change it.

    In the following example we assume
    that the password is `velux123`.
*/
await conn.loginAsync('a3gUeKQ2eG');
try {
    // Read the product's data:
    const myProducts = await Products.createProductsAsync(conn);
    const archiv = await myProducts.findByName("archiv_links")
    // async setTargetPositionAsync(newPosition, PriorityLevel = 3, CommandOriginator = 1, ParameterActive = 0, FunctionalParameters = [], PriorityLevelLock = 0, PriorityLevels = [], LockTime = Infinity) {
    await archiv.setTargetPositionAsync(0.5, undefined, undefined, undefined, [{ID: 3, Value: 0.5}]);
    console.log(archiv);
    // Find the window by it's name:
    // const myKitchenWindow = myProducts.findByName("Window kitchen");
    // if (myKitchenWindow) {
    //     await myKitchenWindow.setTargetPositionAsync(0.5);
    // } else {
    //     throw(new Error("Could not find kitchen window."));
    // }
} finally {
    await conn.logoutAsync();
}
