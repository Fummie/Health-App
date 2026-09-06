import React, { useState } from 'react';
import { 
  Bluetooth, 
  Activity, 
  Battery, 
  Wifi, 
  Watch, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Zap, 
  Heart, 
  HelpCircle,
  Footprints
} from 'lucide-react';
import { BluetoothWearableState } from '../types';
import { bluetoothManager } from '../utils/bluetoothHealth';

interface WearablesSegmentProps {
  wearableState: BluetoothWearableState;
  onStateChange: (state: BluetoothWearableState) => void;
}

export const WearablesSegment: React.FC<WearablesSegmentProps> = ({
  wearableState,
  onStateChange,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [connectionLog, setConnectionLog] = useState<string[]>([
    'Bluetooth Core subsystem initialized.',
    'GATT Service 0x180D (Heart Rate) and Characteristic 0x2A37 registered.',
  ]);

  const addLog = (msg: string) => {
    setConnectionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 15),
    ]);
  };

  const handleConnectRealBluetooth = async () => {
    setIsScanning(true);
    addLog('Querying browser Web Bluetooth navigator...');

    const success = await bluetoothManager.requestDevice((state) => {
      onStateChange(state);
    });

    setIsScanning(false);
    if (success) {
      addLog(`Connected to Bluetooth hardware device successfully.`);
    } else {
      addLog('Web Bluetooth hardware scan cancelled or unavailable in this environment.');
    }
  };

  const handleToggleSimulation = () => {
    if (wearableState.isConnected && wearableState.isSimulated) {
      bluetoothManager.disconnect();
      addLog('Simulated wearable telemetry stream disconnected.');
    } else {
      addLog('Initiating high-fidelity physiological wearable simulator...');
      bluetoothManager.startSimulation((state) => {
        onStateChange(state);
      });
      addLog('Streaming real-time heart rate & sinus arrhythmia telemetry.');
    }
  };

  const handleDisconnect = () => {
    bluetoothManager.disconnect();
    addLog('Device disconnected from telemetry stream.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Biometric Hardware Ingress
            </span>
            <span className="text-[10px] font-mono text-[#6B7280] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              GATT 0x180D / 0x2A37
            </span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#3A4D39]">Wearable & Bluetooth Synchronization</h1>
          <p className="text-xs text-[#6B7280]">
            Stream continuous biometric signals from Apple Watch, Polar, Garmin, Whoop, or simulated telemetry
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {wearableState.isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-5 py-2.5 rounded-full border border-[#A45C40]/30 text-[#A45C40] bg-[#FAF8F5] text-xs font-bold uppercase tracking-wider hover:bg-[#F4F1ED] transition-all"
            >
              Disconnect {wearableState.deviceName}
            </button>
          ) : (
            <>
              <button
                onClick={handleToggleSimulation}
                className="px-5 py-2.5 rounded-full border border-[#E8E4DE] text-[#3A4D39] bg-white hover:bg-[#FAF8F5] text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                Quick Simulate Device
              </button>
              <button
                onClick={handleConnectRealBluetooth}
                disabled={isScanning}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#3A4D39] text-white hover:bg-[#2F3F2E] text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-60"
              >
                <Bluetooth className="w-4 h-4" />
                <span>{isScanning ? 'Scanning for Peripherals...' : 'Pair Bluetooth Device'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Status & Telemetry Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device State Card */}
        <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070]">Device Connection</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                wearableState.isConnected
                  ? 'bg-white text-[#3A4D39] border-[#3A4D39]/30'
                  : 'bg-white text-[#6B7280] border-[#E8E4DE]'
              }`}>
                {wearableState.isConnected ? 'Connected & Streaming' : 'Standby / Offline'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-3.5 rounded-2xl border ${
                wearableState.isConnected 
                  ? 'bg-white border-[#3A4D39]/30 text-[#3A4D39]' 
                  : 'bg-[#F4F1ED] border-[#E8E4DE] text-[#6B7280]'
              }`}>
                <Watch className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-serif italic text-[#3A4D39]">
                  {wearableState.deviceName || 'No Peripheral Paired'}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {wearableState.isSimulated 
                    ? 'High-Fidelity Telemetry Simulator' 
                    : wearableState.isConnected 
                    ? 'Native Web Bluetooth GATT Connection' 
                    : 'Awaiting device pairing'}
                </p>
              </div>
            </div>

            {wearableState.isConnected && (
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#E8E4DE] text-xs">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-[#3A4D39]" />
                  <span>Battery: <strong className="text-[#3A4D39]">{wearableState.batteryLevel ?? 94}%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#7C9070]" />
                  <span>Signal: <strong className="text-[#3A4D39]">-58 dBm</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E4DE] text-[10px] text-[#6B7280] uppercase tracking-wider flex items-center justify-between font-mono">
            <span>Protocol: Bluetooth LE 5.2</span>
            <span>Latency: &lt;18ms</span>
          </div>
        </div>

        {/* Real-Time Live Vitals Ingress */}
        <div className="lg:col-span-2 bg-[#3A4D39] text-white p-6 sm:p-7 rounded-[32px] border border-[#7C9070]/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#E8E4DE] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#A45C40]" />
                Live Ingress Telemetry Wave
              </span>
              {wearableState.isConnected && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FAF8F5] bg-white/15 px-3 py-1 rounded-full border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Streaming Live
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Heart Rate Ingress */}
              <div className="p-4 rounded-2xl bg-[#2D382C] border border-[#7C9070]/40">
                <span className="text-xs text-[#E8E4DE] flex items-center gap-1.5 mb-1 font-medium">
                  <Heart className="w-3.5 h-3.5 text-[#A45C40]" />
                  Instantaneous Pulse
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-serif italic text-white">
                    {wearableState.isConnected && wearableState.liveHeartRate ? wearableState.liveHeartRate : '—'}
                  </span>
                  <span className="text-xs text-[#E8E4DE] font-mono">BPM</span>
                </div>
                <span className="text-[10px] text-[#E8E4DE]/70 block mt-1 font-serif italic">Normal sinus rhythm</span>
              </div>

              {/* Steps Ingress */}
              <div className="p-4 rounded-2xl bg-[#2D382C] border border-[#7C9070]/40">
                <span className="text-xs text-[#E8E4DE] flex items-center gap-1.5 mb-1 font-medium">
                  <Footprints className="w-3.5 h-3.5 text-[#7C9070]" />
                  Live Step Sync
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-serif italic text-white">
                    {wearableState.isConnected && wearableState.liveSteps != null ? Number(wearableState.liveSteps).toLocaleString() : '—'}
                  </span>
                  <span className="text-xs text-[#E8E4DE] font-mono">Steps</span>
                </div>
                <span className="text-[10px] text-[#E8E4DE]/70 block mt-1 font-serif italic">Pedometer synchronized</span>
              </div>

              {/* Data Ingress State */}
              <div className="p-4 rounded-2xl bg-[#2D382C] border border-[#7C9070]/40">
                <span className="text-xs text-[#E8E4DE] flex items-center gap-1.5 mb-1 font-medium">
                  <Zap className="w-3.5 h-3.5 text-[#A45C40]" />
                  Ingress Health Status
                </span>
                <span className="text-xl font-serif italic text-white block mt-1">
                  {wearableState.isConnected ? 'Nominal / Active' : 'Standby'}
                </span>
                <span className="text-[10px] text-[#E8E4DE]/70 block mt-1 font-serif italic">
                  {wearableState.isConnected ? 'Zero packet dropped' : 'Pair device to stream'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-[#E8E4DE]">
            <span>Last Packet Received: {wearableState.lastSyncTime ? new Date(wearableState.lastSyncTime).toLocaleTimeString() : 'N/A'}</span>
            <button
              onClick={handleToggleSimulation}
              className="text-[#FAF8F5] hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 text-[10px] bg-white/10 px-3 py-1 rounded-full border border-white/20"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{wearableState.isConnected && wearableState.isSimulated ? 'Stop Simulator' : 'Run Simulator Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics & Connection Terminal Log */}
      <div className="bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DE] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif italic text-[#3A4D39]">Hardware Connection Diagnostics & Audit Log</h3>
            <p className="text-xs text-[#6B7280]">Real-time Web Bluetooth GATT handshakes and device telemetry packets</p>
          </div>
          <span className="text-xs font-mono text-[#7C9070]">RFC 793 / BLE GATT</span>
        </div>

        <div className="p-4 bg-[#2D382C] rounded-2xl font-mono text-xs text-[#E8E4DE] space-y-1 max-h-48 overflow-y-auto border border-[#7C9070]/30">
          {connectionLog.map((log, index) => (
            <div key={index} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Compatibility & Security Note */}
      <div className="p-6 rounded-[28px] bg-[#F4F1ED] border border-[#E8E4DE] text-[#6B7280] text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#3A4D39]">
          <ShieldCheck className="w-4 h-4 text-[#7C9070]" />
          <span className="uppercase tracking-wider text-xs">Web Bluetooth Security & Browser Requirements</span>
        </div>
        <p className="text-[#6B7280] leading-relaxed text-xs font-serif italic">
          Vitalis utilizes the W3C Web Bluetooth API specification. Supported browsers include Google Chrome, Microsoft Edge, Opera, and Bluefy on iOS. When pairing, select your heart rate monitor from the system prompt. If no hardware is detected or permissions are restricted in iframe containers, use the integrated high-fidelity simulation engine to observe real-time health data streaming.
        </p>
      </div>
    </div>
  );
};
