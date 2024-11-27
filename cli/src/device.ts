import { Connection as KnxConnection, type DPT, Datapoint } from 'knx';
import { ParameterActive, Product, PropertyChangedEvent, RunStatus, convertPosition, convertPositionRaw } from 'klf-200-api';
import { DeviceConfig } from './types';

export default class Device {
    private upDownDpLong: Datapoint;
    private upDownDpShort: Datapoint;
    private heightDp: Datapoint;
    private heightStateDp: Datapoint;
    private slatDp: Datapoint;
    private slatStateDp: Datapoint;
    private maxValue = 65535;

    constructor(
        private config: DeviceConfig,
        private knxConnection: KnxConnection,
        private veluxProduct: Product
    ) {
        // Create datapoints
        this.upDownDpLong = new Datapoint({
            ga: this.config.knx.up_down_long,
            dpt: 'DPT1.008'
        }, this.knxConnection);

        this.upDownDpShort = new Datapoint({
            ga: this.config.knx.up_down_short,
            dpt: 'DPT1.001'
        }, this.knxConnection);

        this.heightDp = new Datapoint({
            ga: this.config.knx.position_height,
            dpt: 'DPT5.001'
        }, this.knxConnection);

        this.heightStateDp = new Datapoint({
            ga: this.config.knx.position_height_state,
            dpt: 'DPT5.001'
        }, this.knxConnection);

        this.slatDp = new Datapoint({
            ga: this.config.knx.position_slat,
            dpt: 'DPT5.001'
        }, this.knxConnection);

        this.slatStateDp = new Datapoint({
            ga: this.config.knx.position_slat_state,
            dpt: 'DPT5.001'
        }, this.knxConnection);

        this.setupKnxListeners();
    }

    private setupKnxListeners(): void {
        // Up/Down Long
        this.upDownDpLong.on('event', async (event: any, value: any) => {
            const position = value ? 0 : 1;  // 0 = up = 1.0, 1 = down = 0.0
            await this.veluxProduct.setTargetPositionAsync(position);
        });

        // Up/Down Short
        this.knxConnection.on(`GroupValue_Write_${this.config.knx.up_down_short}`, async (src: any, value: any) => {
            await this.veluxProduct.refreshAsync();
            if (this.veluxProduct.RunStatus === RunStatus.ExecutionCompleted) {
                const currentPos = this.veluxProduct.FP3CurrentPositionRaw;
                const step = 0.1; // 10% step
                const newPos = value ? 
                Math.max(convertPositionRaw(currentPos, this.veluxProduct.TypeID) - step, 0) : 
                Math.min(convertPositionRaw(currentPos, this.veluxProduct.TypeID) + step, 1);

                await this.veluxProduct.setTargetPositionAsync(
                    this.veluxProduct.CurrentPosition,
                    undefined, 
                    undefined,
                    ParameterActive.FP3,
                    [{ID: 3, Value: convertPosition(newPos, this.veluxProduct.TypeID)}]
                );
            } else if (this.veluxProduct.RunStatus === RunStatus.ExecutionActive) {
                await this.veluxProduct.stopAsync();
            } else {
                console.error('setTargetPositionAsync failed');
            }
        });

        // Position Height
        this.heightDp.on('change', async (oldValue: any, newValue: any) => {
            const position = newValue / 100; // Convert percentage to 0-1
            await this.veluxProduct.setTargetPositionAsync(position);
        });

        // Position Slat
        this.slatDp.on('change', async (oldValue: any, newValue: any) => {
            const position = newValue / 100; // Convert percentage to 0-1
            await this.veluxProduct.setTargetPositionAsync(
                this.veluxProduct.CurrentPosition,
                undefined,
                undefined,
                ParameterActive.FP3,
                [{ID: 3, Value: convertPosition(position, this.veluxProduct.TypeID)}] // FP3 for slat position
            );
        });

        // Update state listeners
        this.veluxProduct.propertyChangedEvent.on((property: PropertyChangedEvent) => {
            if (property.propertyName === 'CurrentPosition' && property.propertyValue) {
                this.heightStateDp.write(property.propertyValue * 100); // Convert 0-1 to percentage
            }
            if (property.propertyName === 'FP3CurrentPositionRaw') {
                this.slatStateDp.write(convertPositionRaw(property.propertyValue, this.veluxProduct.TypeID) * 100); // Convert 0-1 to percentage
            }
        });
    }
} 