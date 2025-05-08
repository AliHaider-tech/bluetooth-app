import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private _ipc: typeof ipcRenderer | undefined;

  constructor() {
    if ((window as any).require) {
      this._ipc = (window as any).require('electron').ipcRenderer;
    }
  }

  get ipcRenderer(): typeof ipcRenderer {
    return this._ipc as typeof ipcRenderer;
  }
}
