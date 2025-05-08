// app.component.ts
import { Component } from '@angular/core';
import { BluetoothService } from './services/bluetooth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  devices: any[] = [];

  pairedDevices: any[] = [];  // List to hold paired devices
  unpairedDevices: any[] = [];  // List to hold unpaired devices
  selectedDevice: string = '';  // Device address for connecting

  constructor(private bluetoothService: BluetoothService) { }

  ngOnInit(): void {
    // Start scanning for devices when the component loads
    this.bluetoothService.startScan().subscribe(
      (data) => {
        console.log('Devices found:', data);
        this.pairedDevices = data.paired;  // Store paired devices
        this.unpairedDevices = data.unpaired;  // Store unpaired devices
      },
      (error) => {
        console.error('Error scanning devices:', error);
      }
    );
  }

  // Method to connect to the selected Bluetooth device
  connectToDevice(): void {
    if (this.selectedDevice) {
      this.bluetoothService.connectToDevice(this.selectedDevice).subscribe(
        (response) => {
          console.log('Connected to device:', response);
        },
        (error) => {
          console.error('Error connecting to device:', error);
        }
      );
    }
  }
}
