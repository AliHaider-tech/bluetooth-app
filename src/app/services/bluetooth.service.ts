import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  private apiUrl = 'http://localhost:3000'; // URL of the Node.js backend

  constructor(private http: HttpClient) { }

  // Start scanning for Bluetooth devices
  startScan(): Observable<any> {
    return this.http.get(`${this.apiUrl}/start-scan`);
  }

  // Connect to a selected Bluetooth device
  connectToDevice(address: string): Observable<any> {
    this.http.post(`${this.apiUrl}/connect`, { address }).subscribe((res)=>{
      console.log(res);
    });
    return this.http.post(`${this.apiUrl}/connect`, { address });
  }
}
