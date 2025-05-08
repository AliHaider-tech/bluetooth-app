interface Navigator {
    bluetooth: Bluetooth;
  }
  
  interface Bluetooth {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
  }
  
  interface RequestDeviceOptions {
    filters?: DeviceFilter[];  // This is the filter for devices (can be empty to match all devices)
    optionalServices?: string[]; // Optional services you may want to specify
  }
  
  
  interface DeviceFilter {
    name?: string;
    namePrefix?: string;
    services?: string[];
  }
  
  // The BluetoothDevice interface
  interface BluetoothDevice {
    id: string;
    name: string;
    gatt: BluetoothRemoteGATTServer | any;
    watchAdvertisements(): void;
    unwatchAdvertisements(): void;
    // Add other necessary methods and properties
  }
  
  // Additional types
  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    // Add other necessary methods
  }
  