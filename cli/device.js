class Device {
    constructor(config, knxConnection, veluxProduct) {
        this.config = config;
        this.knxConnection = knxConnection;
        this.veluxProduct = veluxProduct;
        this.setupKnxListeners();
    }

    setupKnxListeners() {
        // Up/Down Long
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.up_down_long}`, async (value) => {
            const position = value[0] ? 0 : 1;  // 0 = up = 1.0, 1 = down = 0.0
            await this.veluxProduct.setTargetPositionAsync(position);
        });

        // Up/Down Short
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.up_down_short}`, async (value) => {
            const currentPos = this.veluxProduct.CurrentPosition;
            const step = 0.1; // 10% step
            const newPos = value[0] ? Math.max(currentPos - step, 0) : Math.min(currentPos + step, 1);
            await this.veluxProduct.setTargetPositionAsync(newPos);
        });

        // Stop
        // this.knxConnection.on(`GroupValue_Write_${this.config.knx.stop}`, async () => {
        //     await this.veluxProduct.stopAsync();
        // });

        // Position Height
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.position_height}`, async (value) => {
            const position = value[0] / 255;  // Convert 0-255 to 0-1
            await this.veluxProduct.setTargetPositionAsync(position);
        });

        // Position Slat
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.position_slat}`, async (value) => {
            const position = value[0] / 255;  // Convert 0-255 to 0-1
            await this.veluxProduct.setTargetPositionAsync(
                this.veluxProduct.CurrentPosition, 
                undefined, 
                undefined, 
                undefined, 
                [{ID: 3, Value: position}]  // FP3 for slat position
            );
        });

        // Update state listeners
        this.veluxProduct.on('propertyChanged', (property) => {
            if (property === 'CurrentPosition') {
                const value = Math.round(this.veluxProduct.CurrentPosition * 255);
                this.knxConnection.write(this.config.knx.position_height_state, [value]);
            }
            if (property === 'FP3CurrentPositionRaw') {
                const value = Math.round(this.veluxProduct.FP3CurrentPositionRaw * 255);
                this.knxConnection.write(this.config.knx.position_slat_state, [value]);
            }
        });
    }
}

module.exports = Device; 