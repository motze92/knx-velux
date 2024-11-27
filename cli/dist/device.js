"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knx_1 = require("knx");
const klf_200_api_1 = require("klf-200-api");
class Device {
    constructor(config, knxConnection, veluxProduct) {
        this.config = config;
        this.knxConnection = knxConnection;
        this.veluxProduct = veluxProduct;
        this.maxValue = 65535;
        // Create datapoints
        this.heightDp = new knx_1.Datapoint({
            ga: this.config.knx.position_height,
            dpt: 'DPT5.001'
        }, this.knxConnection);
        this.heightStateDp = new knx_1.Datapoint({
            ga: this.config.knx.position_height_state,
            dpt: 'DPT5.001'
        }, this.knxConnection);
        this.slatDp = new knx_1.Datapoint({
            ga: this.config.knx.position_slat,
            dpt: 'DPT5.001'
        }, this.knxConnection);
        this.slatStateDp = new knx_1.Datapoint({
            ga: this.config.knx.position_slat_state,
            dpt: 'DPT5.001'
        }, this.knxConnection);
        this.setupKnxListeners();
    }
    setupKnxListeners() {
        // Up/Down Long
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.up_down_long}`, async (value) => {
            console.log(`up_down_long: ${value}`);
            const position = value[0] ? 0 : 1; // 0 = up = 1.0, 1 = down = 0.0
            await this.veluxProduct.setTargetPositionAsync(position);
        });
        // Up/Down Short
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.up_down_short}`, async (value) => {
            const currentPos = this.veluxProduct.CurrentPosition;
            const step = 0.1; // 10% step
            const newPos = value[0] ? Math.max(currentPos - step, 0) : Math.min(currentPos + step, 1);
            await this.veluxProduct.setTargetPositionAsync(newPos);
        });
        // Position Height
        this.heightDp.on('change', async (oldValue, newValue) => {
            const position = newValue / 100; // Convert percentage to 0-1
            await this.veluxProduct.setTargetPositionAsync(position);
        });
        // Position Slat
        this.slatDp.on('change', async (oldValue, newValue) => {
            const position = newValue / 100; // Convert percentage to 0-1
            await this.veluxProduct.setTargetPositionAsync(this.veluxProduct.CurrentPosition, undefined, undefined, undefined, [{ ID: 3, Value: position }] // FP3 for slat position
            );
        });
        // Update state listeners
        this.veluxProduct.propertyChangedEvent.on((property) => {
            console.log(property.propertyName, property.propertyValue);
            if (property.propertyName === 'CurrentPosition') {
                this.heightStateDp.write(property.propertyValue * 100); // Convert 0-1 to percentage
            }
            if (property.propertyName === 'FP3CurrentPositionRaw') {
                this.slatStateDp.write((0, klf_200_api_1.convertPositionRaw)(property.propertyValue, this.veluxProduct.TypeID) * 100); // Convert 0-1 to percentage
            }
        });
    }
}
exports.default = Device;
