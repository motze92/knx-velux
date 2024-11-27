export interface VeluxConfig {
  address: string;
  password: string;
}

export interface KnxConfig {
  address: string;
  port: number;
}

export interface KnxDeviceConfig {
  up_down_long: string;
  up_down_short: string;
  position_height: string;
  position_height_state: string;
  position_slat: string;
  position_slat_state: string;
}

export interface DeviceConfig {
  name: string;
  velux_name: string;
  knx: KnxDeviceConfig;
}

export interface AppConfig {
  velux: VeluxConfig;
  knx: KnxConfig;
  devices: DeviceConfig[];
} 