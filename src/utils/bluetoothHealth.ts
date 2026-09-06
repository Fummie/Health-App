// Web Bluetooth API handler with fallback physiological simulator
import { BluetoothWearableState } from '../types';

export interface BluetoothHeartRateData {
  heartRate: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
  hrvMs?: number;
}

export type HeartRateCallback = (data: BluetoothHeartRateData) => void;
export type DisconnectCallback = () => void;
export type StateCallback = (state: BluetoothWearableState) => void;

class BluetoothHealthManager {
  private device: any = null;
  private server: any = null;
  private hrCharacteristic: any = null;
  private isSimulating: boolean = false;
  private simInterval: any = null;
  private hrListeners: Set<HeartRateCallback> = new Set();
  private disconnectListeners: Set<DisconnectCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();

  private currentState: BluetoothWearableState = {
    isConnected: false,
    isScanning: false,
    deviceName: null,
    batteryLevel: null,
    liveHeartRate: null,
    liveHrv: null,
    liveSteps: 7420,
    pulseStream: [68, 69, 70, 68, 67, 69, 72, 71],
    isSimulator: false,
    isSimulated: false,
    errorMessage: null,
    lastSyncTime: undefined,
  };

  public getState(): BluetoothWearableState {
    return { ...this.currentState };
  }

  public addListener(cb: StateCallback): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  private notifyState() {
    this.stateListeners.forEach((cb) => cb({ ...this.currentState }));
  }

  public isBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async requestHeartRateDevice(): Promise<{ name: string; connected: boolean }> {
    if (!this.isBluetoothSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser environment. Using physiological simulation mode.');
    }

    try {
      this.currentState.isScanning = true;
      this.notifyState();

      // Standard Bluetooth SIG services
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect();
      });

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService('heart_rate');
      this.hrCharacteristic = await service.getCharacteristic('heart_rate_measurement');

      await this.hrCharacteristic.startNotifications();
      this.hrCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const data = this.parseHeartRate(event.target.value);
        this.notifyHR(data);
      });

      const deviceName = this.device.name || 'Wireless Heart Rate Monitor';
      this.currentState = {
        ...this.currentState,
        isConnected: true,
        isScanning: false,
        deviceName: deviceName,
        batteryLevel: 92,
        isSimulator: false,
        isSimulated: false,
        errorMessage: null,
        lastSyncTime: new Date().toISOString(),
      };
      this.notifyState();

      return {
        name: deviceName,
        connected: true,
      };
    } catch (err: any) {
      console.warn('Bluetooth pairing failed or cancelled:', err);
      this.currentState.isScanning = false;
      this.currentState.errorMessage = err.message || 'Bluetooth connection failed';
      this.notifyState();
      throw err;
    }
  }

  public async requestDevice(cb?: StateCallback): Promise<boolean> {
    if (cb) this.addListener(cb);
    try {
      await this.requestHeartRateDevice();
      return true;
    } catch (err) {
      return false;
    }
  }

  public startSimulation(baseHr: number | StateCallback = 68, onUpdate?: HeartRateCallback) {
    this.stopSimulation();
    this.isSimulating = true;

    let startingHr = 68;
    if (typeof baseHr === 'function') {
      this.addListener(baseHr);
    } else if (typeof baseHr === 'number') {
      startingHr = baseHr;
    }

    if (onUpdate) this.hrListeners.add(onUpdate);

    let currentHr = startingHr;
    let currentSteps = this.currentState.liveSteps || 7420;

    this.currentState = {
      ...this.currentState,
      isConnected: true,
      isScanning: false,
      deviceName: 'Apple Watch Ultra (Simulated)',
      batteryLevel: 88,
      liveHeartRate: currentHr,
      liveHrv: 62,
      isSimulator: true,
      isSimulated: true,
      errorMessage: null,
      lastSyncTime: new Date().toISOString(),
    };
    this.notifyState();

    this.simInterval = setInterval(() => {
      // Natural sinus arrhythmia fluctuation (+/- 2-4 bpm)
      const delta = (Math.random() - 0.48) * 3;
      currentHr = Math.max(54, Math.min(135, Math.round(currentHr + delta)));
      
      // Step increment simulation (occasional steps)
      if (Math.random() > 0.6) {
        currentSteps += Math.floor(Math.random() * 3) + 1;
      }

      // Calculate realistic HRV (rMSSD estimation ~45-75ms)
      const simulatedHrv = Math.round(55 + (Math.random() - 0.5) * 18);
      
      const packet: BluetoothHeartRateData = {
        heartRate: currentHr,
        contactDetected: true,
        hrvMs: simulatedHrv,
        rrIntervals: [Math.round(60000 / currentHr)]
      };

      const updatedStream = [...(this.currentState.pulseStream || []).slice(-15), currentHr];

      this.currentState = {
        ...this.currentState,
        liveHeartRate: currentHr,
        liveHrv: simulatedHrv,
        liveSteps: currentSteps,
        pulseStream: updatedStream,
        lastSyncTime: new Date().toISOString(),
      };

      this.notifyHR(packet);
      this.notifyState();
    }, 1200);
  }

  public stopSimulation() {
    this.isSimulating = false;
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  public subscribe(cb: HeartRateCallback): () => void {
    this.hrListeners.add(cb);
    return () => this.hrListeners.delete(cb);
  }

  public onDisconnect(cb: DisconnectCallback): () => void {
    this.disconnectListeners.add(cb);
    return () => this.disconnectListeners.delete(cb);
  }

  public disconnect() {
    this.stopSimulation();
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      try {
        this.device.gatt.disconnect();
      } catch (e) {
        // ignore
      }
    }
    this.handleDisconnect();
  }

  private handleDisconnect() {
    this.device = null;
    this.server = null;
    this.hrCharacteristic = null;
    this.currentState = {
      ...this.currentState,
      isConnected: false,
      isScanning: false,
      deviceName: null,
      liveHeartRate: null,
      isSimulator: false,
      isSimulated: false,
    };
    this.disconnectListeners.forEach((cb) => cb());
    this.notifyState();
  }

  private notifyHR(data: BluetoothHeartRateData) {
    this.hrListeners.forEach((cb) => cb(data));
  }

  // Parses the standard Bluetooth SIG Heart Rate Measurement characteristic (0x2A37)
  private parseHeartRate(value: DataView): BluetoothHeartRateData {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let index = 1;
    let heartRate: number;

    if (rate16Bits) {
      heartRate = value.getUint16(index, true);
      index += 2;
    } else {
      heartRate = value.getUint8(index);
      index += 1;
    }

    const contactDetected = (flags & 0x6) === 0x6;
    let energyExpended: number | undefined;
    const energyPresent = flags & 0x8;
    if (energyPresent) {
      energyExpended = value.getUint16(index, true);
      index += 2;
    }

    const rrIntervals: number[] = [];
    const rrPresent = flags & 0x10;
    if (rrPresent) {
      while (index + 1 < value.byteLength) {
        const rawRr = value.getUint16(index, true);
        const rrMs = Math.round((rawRr / 1024) * 1000);
        rrIntervals.push(rrMs);
        index += 2;
      }
    }

    let hrvMs = 60;
    if (rrIntervals.length >= 2) {
      let sumSqDiff = 0;
      for (let i = 1; i < rrIntervals.length; i++) {
        const diff = rrIntervals[i] - rrIntervals[i - 1];
        sumSqDiff += diff * diff;
      }
      hrvMs = Math.round(Math.sqrt(sumSqDiff / (rrIntervals.length - 1)));
    }

    return {
      heartRate,
      contactDetected,
      energyExpended,
      rrIntervals,
      hrvMs: hrvMs || 60
    };
  }
}

export const bluetoothManager = new BluetoothHealthManager();
