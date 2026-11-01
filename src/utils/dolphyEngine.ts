// Dolphy Cyber & Wireless Protocol Intelligence Engine
// Inspired by Dolphy v2.6 (https://unvoiddd.github.io/Dolphy-App/)
// Supports: Infrared (.ir / Flipper Zero), BLE, Web Bluetooth, Web NFC, Wi-Fi Spectrum, Media UPnP, and Plugin Specs

import { DolphyProtocolSimulation, DolphyProtocolType } from '../types';

export interface IrPreset {
  id: string;
  name: string;
  category: 'TV' | 'AC' | 'Audio' | 'Projector';
  brand: string;
  protocol: 'NEC' | 'Samsung32' | 'RC5' | 'RAW';
  address: string;
  command: string;
  frequency: number; // e.g. 38000
  irFileContent: string;
}

export const DOLPHY_IR_PRESETS: IrPreset[] = [
  {
    id: 'samsung-tv-pwr',
    name: 'Samsung Smart TV - Power Toggle',
    category: 'TV',
    brand: 'Samsung',
    protocol: 'Samsung32',
    address: '0x0707',
    command: '0x02FD',
    frequency: 38000,
    irFileContent: `Filetype: IR library file
Version: 1
# Global Pixel AI - Dolphy IR Studio
name: Power
type: parsed
protocol: Samsung32
address: 07 00 00 00
command: 02 00 00 00
`
  },
  {
    id: 'lg-tv-pwr',
    name: 'LG webOS TV - Power Toggle',
    category: 'TV',
    brand: 'LG',
    protocol: 'NEC',
    address: '0x0004',
    command: '0x0008',
    frequency: 38000,
    irFileContent: `Filetype: IR library file
Version: 1
# Global Pixel AI - Dolphy IR Studio
name: Power
type: parsed
protocol: NEC
address: 04 00 00 00
command: 08 00 00 00
`
  },
  {
    id: 'sony-bravia-pwr',
    name: 'Sony Bravia TV - Power Toggle',
    category: 'TV',
    brand: 'Sony',
    protocol: 'RAW',
    address: '0x0001',
    command: '0x0015',
    frequency: 40000,
    irFileContent: `Filetype: IR library file
Version: 1
# Global Pixel AI - Dolphy IR Studio
name: Power
type: raw
frequency: 40000
duty_cycle: 0.33
data: 2400 600 1200 600 600 600 1200 600 600 600 1200 600 600 600 600 600 1200 600 600 600 600 600 600 600 600 25000
`
  },
  {
    id: 'daikin-ac-pwr',
    name: 'Daikin Inverter AC - Cool 24°C Auto',
    category: 'AC',
    brand: 'Daikin',
    protocol: 'RAW',
    address: '0x11DA',
    command: '0x2700',
    frequency: 38000,
    irFileContent: `Filetype: IR library file
Version: 1
# Global Pixel AI - Dolphy IR Studio
name: Cool_24C
type: raw
frequency: 38000
duty_cycle: 0.33
data: 3450 1700 450 1250 450 400 450 1250 450 400 450 400 450 400 450 400 450 1250 450 29000
`
  },
  {
    id: 'panasonic-ac-pwr',
    name: 'Panasonic Econavi AC - Power Toggle',
    category: 'AC',
    brand: 'Panasonic',
    protocol: 'RAW',
    address: '0x4004',
    command: '0x0100',
    frequency: 36700,
    irFileContent: `Filetype: IR library file
Version: 1
# Global Pixel AI - Dolphy IR Studio
name: Power
type: raw
frequency: 36700
duty_cycle: 0.33
data: 3500 3500 880 2600 880 880 880 2600 880 880 880 880 880 880 880 2600 880 10000
`
  },
  {
    id: 'epson-projector',
    name: 'Epson Projector - Power Off Storm',
    category: 'Projector',
    brand: 'Epson',
    protocol: 'NEC',
    address: '0x8355',
    command: '0x5C00',
    frequency: 38000,
    irFileContent: `Filetype: IR library file
Version: 1
# Global Pixel AI - Dolphy IR Studio
name: Power_Off
type: parsed
protocol: NEC
address: 55 83 00 00
command: 00 5C 00 00
`
  }
];

export interface BlePacketSample {
  id: string;
  name: string;
  manufacturer: string;
  type: 'Proximity' | 'Beacon' | 'Telemetry';
  rawHex: string;
  fields: Array<{ name: string; hex: string; decoded: string }>;
}

export const BLE_PACKET_SAMPLES: BlePacketSample[] = [
  {
    id: 'apple-airpods-pop',
    name: 'Apple Proximity Pair (AirPods Frame)',
    manufacturer: 'Apple Inc. (0x004C)',
    type: 'Proximity',
    rawHex: '02 01 06 13 FF 4C 00 07 11 01 02 20 00 5B 00 00 00 00 00 00 00',
    fields: [
      { name: 'Length & AD Type', hex: '02 01 06', decoded: 'Flags: LE General Discoverable, BR/EDR Not Supported' },
      { name: 'Manufacturer Specific', hex: '13 FF 4C 00', decoded: 'Company ID: 0x004C (Apple Inc.)' },
      { name: 'Apple Subtype', hex: '07', decoded: 'Proximity Pairing (AirPods / Beats)' },
      { name: 'Device Model', hex: '02 20', decoded: 'AirPods Pro 2nd Gen Case & Buds' },
      { name: 'Battery & Status', hex: '5B 00', decoded: 'Left: 90%, Right: 90%, Case: 95%' }
    ]
  },
  {
    id: 'google-fast-pair',
    name: 'Google Fast Pair Service Advertisement',
    manufacturer: 'Google LLC (Service 0xFE2C)',
    type: 'Proximity',
    rawHex: '02 01 06 03 03 2C FE 06 16 2C FE 82 F4 11',
    fields: [
      { name: 'Service UUID', hex: '03 03 2C FE', decoded: '16-bit Service UUID: 0xFE2C (Google Fast Pair)' },
      { name: 'Model ID', hex: '06 16 2C FE 82 F4 11', decoded: 'Model ID: 0x82F411 (Google Pixel Buds Pro)' }
    ]
  },
  {
    id: 'altbeacon-eddystone',
    name: 'Eddystone-UID Physical Web Beacon',
    manufacturer: 'Open Specification (Service 0xFEAA)',
    type: 'Beacon',
    rawHex: '02 01 06 03 03 AA FE 15 16 AA FE 00 E8 01 02 03 04 05 06 07 08 09 0A 01 02 03 04 05 06 00',
    fields: [
      { name: 'Eddystone Service', hex: '03 03 AA FE', decoded: '16-bit Service UUID: 0xFEAA' },
      { name: 'Frame Type', hex: '00', decoded: 'UID Frame (Namespace + Instance)' },
      { name: 'Calibrated Tx Power', hex: 'E8', decoded: '-24 dBm at 0 meters' },
      { name: 'Namespace ID', hex: '01 02 03 04 05 06 07 08 09 0A', decoded: 'GlobalPixelAI-Namespace' },
      { name: 'Instance ID', hex: '01 02 03 04 05 06', decoded: 'Node-001' }
    ]
  }
];

export interface WifiChannelInfo {
  channel: number;
  freqMhz: number;
  band: '2.4GHz' | '5GHz';
  standard: string;
  isCommon: boolean;
  notes: string;
}

export const WIFI_CHANNELS: WifiChannelInfo[] = [
  { channel: 1, freqMhz: 2412, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: true, notes: 'Non-overlapping channel utama di 2.4 GHz' },
  { channel: 2, freqMhz: 2417, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi tinggi dengan Ch 1 & 6' },
  { channel: 3, freqMhz: 2422, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi tinggi' },
  { channel: 4, freqMhz: 2427, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi tinggi' },
  { channel: 5, freqMhz: 2432, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi dengan Ch 1 & 6' },
  { channel: 6, freqMhz: 2437, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: true, notes: 'Non-overlapping channel pusat di 2.4 GHz' },
  { channel: 7, freqMhz: 2442, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi dengan Ch 6 & 11' },
  { channel: 8, freqMhz: 2447, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi dengan Ch 6 & 11' },
  { channel: 9, freqMhz: 2452, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi dengan Ch 6 & 11' },
  { channel: 10, freqMhz: 2457, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: false, notes: 'Interferensi dengan Ch 11' },
  { channel: 11, freqMhz: 2462, band: '2.4GHz', standard: '802.11b/g/n/ax', isCommon: true, notes: 'Non-overlapping channel standar internasional' },
  { channel: 36, freqMhz: 5180, band: '5GHz', standard: '802.11ac/ax/be', isCommon: true, notes: '5GHz UNII-1 Band (bebas radar DFS)' },
  { channel: 40, freqMhz: 5200, band: '5GHz', standard: '802.11ac/ax/be', isCommon: true, notes: '5GHz UNII-1 Band' },
  { channel: 44, freqMhz: 5220, band: '5GHz', standard: '802.11ac/ax/be', isCommon: true, notes: '5GHz UNII-1 Band' },
  { channel: 48, freqMhz: 5240, band: '5GHz', standard: '802.11ac/ax/be', isCommon: true, notes: '5GHz UNII-1 Band' },
  { channel: 149, freqMhz: 5745, band: '5GHz', standard: '802.11ac/ax/be', isCommon: true, notes: '5GHz UNII-3 Band (Daya tinggi / high throughput)' }
];

// Subnet Calculator helper
export function calculateSubnet(ipStr: string, cidr: number) {
  try {
    const parts = ipStr.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      throw new Error('Invalid IPv4');
    }
    const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const netNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (netNum | (~maskNum >>> 0)) >>> 0;
    
    const numToIp = (n: number) => [
      (n >>> 24) & 255,
      (n >>> 16) & 255,
      (n >>> 8) & 255,
      n & 255
    ].join('.');

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = totalHosts > 2 ? totalHosts - 2 : totalHosts;
    const firstHost = numToIp(netNum + 1);
    const lastHost = numToIp(broadcastNum - 1);

    return {
      networkAddress: numToIp(netNum),
      netmask: numToIp(maskNum),
      broadcastAddress: numToIp(broadcastNum),
      firstHost: usableHosts > 0 ? firstHost : numToIp(netNum),
      lastHost: usableHosts > 0 ? lastHost : numToIp(broadcastNum),
      totalHosts,
      usableHosts
    };
  } catch (e) {
    return null;
  }
}

export interface SubGhzFrequencyPreset {
  id: string;
  name: string;
  category: 'Garage / Gate' | 'Car Keyfob' | 'Doorbell' | 'Smart Home / Alarm' | 'TV Remote (IR 38kHz)' | 'Smart TV (RF 2.4GHz)' | 'Custom';
  frequency: number;
  frequencyDisplay: string;
  modulation: 'AM650' | 'AM270' | 'FM238' | 'RAW' | 'NEC_IR' | 'SAMSUNG_IR' | 'BLE_GFSK';
  protocol: 'Princeton' | 'Came' | 'Nice Flo' | 'Keeloq' | 'Samsung32' | 'NEC' | 'Sony12' | 'BLE HID' | 'RAW';
  bitLength: number;
  keyHex: string;
  teMicroseconds: number;
  rawTimings: string;
  subFileContent: string;
}

export const FLIPPER_SUBGHZ_PRESETS: SubGhzFrequencyPreset[] = [
  {
    id: 'flipper-tv-samsung-38k',
    name: 'Remote TV Samsung (38.00 kHz IR Carrier)',
    category: 'TV Remote (IR 38kHz)',
    frequency: 38000,
    frequencyDisplay: '38.00 kHz (IR)',
    modulation: 'SAMSUNG_IR',
    protocol: 'Samsung32',
    bitLength: 32,
    keyHex: '0x070702FD',
    teMicroseconds: 560,
    rawTimings: '4500 -4500 560 -560 560 -1690 560 -560 560 -1690 560 -1690 560 -560 560 -560 560 -45000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
# Global Pixel AI - Dual-Band TV Remote Mode
Frequency: 38000
Preset: FuriHalSubGhzPresetCustomIR
Protocol: Samsung32
Bit: 32
Key: 07 00 00 00 02 00 00 00
TE: 560
Repeat: 3
`
  },
  {
    id: 'flipper-tv-lg-38k',
    name: 'Remote TV LG webOS (38.00 kHz NEC)',
    category: 'TV Remote (IR 38kHz)',
    frequency: 38000,
    frequencyDisplay: '38.00 kHz (IR)',
    modulation: 'NEC_IR',
    protocol: 'NEC',
    bitLength: 32,
    keyHex: '0x04000800',
    teMicroseconds: 560,
    rawTimings: '9000 -4500 560 -560 560 -1690 560 -560 560 -560 560 -1690 560 -560 560 -1690 560 -40000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
# Global Pixel AI - Dual-Band TV Remote Mode
Frequency: 38000
Preset: FuriHalSubGhzPresetCustomIR
Protocol: NEC
Bit: 32
Key: 04 00 00 00 08 00 00 00
TE: 560
Repeat: 3
`
  },
  {
    id: 'flipper-tv-polytron-sharp-38k',
    name: 'Remote TV Polytron / Sharp / TCL (38.00 kHz)',
    category: 'TV Remote (IR 38kHz)',
    frequency: 38000,
    frequencyDisplay: '38.00 kHz (IR)',
    modulation: 'NEC_IR',
    protocol: 'NEC',
    bitLength: 32,
    keyHex: '0x01FE48B7',
    teMicroseconds: 560,
    rawTimings: '9000 -4500 560 -560 560 -1690 560 -560 560 -1690 560 -560 560 -1690 560 -40000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
# Global Pixel AI - Dual-Band TV Remote Mode
Frequency: 38000
Preset: FuriHalSubGhzPresetCustomIR
Protocol: NEC
Bit: 32
Key: 01 FE 48 B7 00 00 00 00
TE: 560
Repeat: 3
`
  },
  {
    id: 'flipper-tv-smart-ble-24g',
    name: 'Remote Smart TV Android (2.40 GHz RF/BLE)',
    category: 'Smart TV (RF 2.4GHz)',
    frequency: 2402000000,
    frequencyDisplay: '2.40 GHz (RF)',
    modulation: 'BLE_GFSK',
    protocol: 'BLE HID',
    bitLength: 64,
    keyHex: '0x050C0100E9000000',
    teMicroseconds: 125,
    rawTimings: '125 -250 250 -125 125 -125 250 -250 125 -375 250 -125 125 -1000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
# Global Pixel AI - 2.4GHz BLE Smart TV Remote Mode
Frequency: 2402000000
Preset: FuriHalSubGhzPresetBleHid
Protocol: BLE HID
Bit: 64
Key: 05 0C 01 00 E9 00 00 00
TE: 125
Repeat: 2
`
  },
  {
    id: 'flipper-gate-came-433',
    name: 'Remote Pagar Otomatis (CAME 12-bit)',
    category: 'Garage / Gate',
    frequency: 433920000,
    frequencyDisplay: '433.92 MHz',
    modulation: 'AM650',
    protocol: 'Came',
    bitLength: 12,
    keyHex: '0x0000000000000D58',
    teMicroseconds: 320,
    rawTimings: '320 -640 640 -320 320 -640 640 -320 320 -640 640 -320 320 -640 640 -320 320 -640 640 -320 320 -640 640 -12000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: Came
Bit: 12
Key: 00 00 00 00 00 00 0D 58
TE: 320
Repeat: 5
`
  },
  {
    id: 'flipper-car-nice-433',
    name: 'Remote Mobil / Alarm (Nice Flo 24-bit)',
    category: 'Car Keyfob',
    frequency: 433920000,
    frequencyDisplay: '433.92 MHz',
    modulation: 'AM650',
    protocol: 'Nice Flo',
    bitLength: 24,
    keyHex: '0x00000000005D3B89',
    teMicroseconds: 700,
    rawTimings: '700 -1400 1400 -700 700 -1400 700 -1400 1400 -700 1400 -700 700 -1400 700 -1400 1400 -700 1400 -700 700 -25000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 433920000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: Nice Flo
Bit: 24
Key: 00 00 00 00 00 5D 3B 89
TE: 700
Repeat: 4
`
  },
  {
    id: 'flipper-doorbell-315',
    name: 'Bel Pintu Nirkabel (Princeton PT2262)',
    category: 'Doorbell',
    frequency: 315000000,
    frequencyDisplay: '315.00 MHz',
    modulation: 'AM650',
    protocol: 'Princeton',
    bitLength: 24,
    keyHex: '0x0000000000C8912A',
    teMicroseconds: 350,
    rawTimings: '350 -1050 1050 -350 350 -1050 1050 -350 350 -1050 1050 -350 350 -1050 350 -1050 1050 -350 350 -12500',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 315000000
Preset: FuriHalSubGhzPresetOok650Async
Protocol: Princeton
Bit: 24
Key: 00 00 00 00 00 C8 91 2A
TE: 350
Repeat: 6
`
  },
  {
    id: 'flipper-smarthome-868',
    name: 'Sensor Gerak & Alarm IoT (868.35MHz Keeloq)',
    category: 'Smart Home / Alarm',
    frequency: 868350000,
    frequencyDisplay: '868.35 MHz',
    modulation: 'AM270',
    protocol: 'Keeloq',
    bitLength: 64,
    keyHex: '0x3F8A2E19BC74D005',
    teMicroseconds: 400,
    rawTimings: '400 -800 800 -400 400 -800 800 -400 400 -800 400 -800 800 -400 400 -800 800 -400 400 -18000',
    subFileContent: `Filetype: Flipper SubGhz Key File
Version: 1
Frequency: 868350000
Preset: FuriHalSubGhzPresetOok270Async
Protocol: Keeloq
Bit: 64
Key: 3F 8A 2E 19 BC 74 D0 05
Manufacture: HCS301 Microchip
TE: 400
Repeat: 3
`
  }
];

export function transmitRfSignalChirp(frequency: number = 433920000): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const isIrCarrier = frequency <= 100000;
    const audioPitch = isIrCarrier ? 950 : frequency > 800000000 ? 1200 : frequency > 400000000 ? 880 : 640;
    osc.type = isIrCarrier ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(audioPitch, ctx.currentTime);
    
    if (isIrCarrier) {
      // Rapid carrier pulse burst simulation for 38kHz IR
      for (let i = 0; i < 4; i++) {
        osc.frequency.setValueAtTime(audioPitch, ctx.currentTime + i * 0.04);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.04);
        gain.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.04 + 0.02);
      }
    } else {
      osc.frequency.exponentialRampToValueAtTime(audioPitch * 1.5, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    }
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([30, 40, 30, 40]); } catch (e) {}
  }
}

// Generate Dolphy Protocol Simulation for chat messages
export function generateDolphySimulation(userPrompt: string): DolphyProtocolSimulation {
  const lower = userPrompt.toLowerCase();

  // 1A. SPECIALIZED: TV Remote in Sub-GHz Sniffer (Handles "sub ghz tidak bisa membaca remote tv")
  const isTvRemoteInSubGhz = 
    (lower.includes('sub') && (lower.includes('tv') || lower.includes('remote tv'))) ||
    (lower.includes('baca') && lower.includes('tv')) ||
    (lower.includes('sniff') && lower.includes('tv')) ||
    (lower.includes('frekuensi') && lower.includes('tv'));

  if (isTvRemoteInSubGhz) {
    const tvPreset = FLIPPER_SUBGHZ_PRESETS[0]; // Samsung 38kHz IR
    return {
      type: 'subghz_frequency',
      title: 'Flipper Zero Dual-Band Universal Sniffer: Mode Remote TV (IR 38kHz & RF 2.4GHz)',
      protocolName: 'Samsung32 / NEC TV Remote Protocol @ 38.00 kHz',
      frequencyOrBand: '38.00 kHz (Infrared Carrier) & 2.40 GHz (Smart TV RF)',
      payloadData: tvPreset.subFileContent,
      decodedInfo: [
        { label: 'Penjelasan Fisik Radio', value: 'Remote TV menggunakan pulsa cahaya inframerah (38.0 kHz) atau Bluetooth 2.4GHz, bukan radio Sub-GHz (433MHz).' },
        { label: 'Solusi Dual-Band Aktif', value: 'Sistem Dolphy & Flipper otomatis mengaktifkan Optical Camera IR Reader & Sensor 38 kHz.' },
        { label: 'Carrier Frequency', value: '38.00 kHz (38,000 Hz) / 40.00 kHz (Sony)' },
        { label: 'Dukungan Protokol TV', value: 'Samsung32, NEC (LG, Polytron, Sharp, Xiaomi, TCL), Sony12, RC5' },
        { label: 'Sensor Kamera Optik', value: 'Kamera HP dapat mendeteksi kedipan LED IR remote TV secara visual dan membaca kodenya' },
        { label: 'Format Ekspor', value: 'Flipper Zero .sub & .ir File Ready' }
      ],
      rawHexOrTimings: tvPreset.rawTimings,
      recommendedTool: 'Flipper Zero Sub-GHz TV Mode / Dolphy Optical IR Reader'
    };
  }

  // 1B. General Flipper Zero Sub-GHz Signal & Frequency Copier / Cloner Intent
  const isFlipperFrequencyCopy = 
    lower.includes('salin frekuensi') || 
    lower.includes('copy frekuensi') || 
    lower.includes('klon') || 
    lower.includes('kloning') || 
    lower.includes('sub-ghz') || 
    lower.includes('subghz') || 
    lower.includes('433') || 
    lower.includes('315') || 
    lower.includes('868') ||
    (lower.includes('flipper') && (lower.includes('frekuensi') || lower.includes('sinyal') || lower.includes('copy') || lower.includes('salin')));

  if (isFlipperFrequencyCopy) {
    const preset = FLIPPER_SUBGHZ_PRESETS.find(p => p.id === 'flipper-gate-came-433') || FLIPPER_SUBGHZ_PRESETS[4]; // CAME 433.92MHz
    return {
      type: 'subghz_frequency',
      title: 'Flipper Zero Sub-GHz Signal & Frequency Copier (Read & Replay)',
      protocolName: `${preset.protocol} Protocol @ ${preset.frequencyDisplay}`,
      frequencyOrBand: `${preset.frequencyDisplay} (${preset.modulation} ASK/OOK)`,
      payloadData: preset.subFileContent,
      decodedInfo: [
        { label: 'Carrier Freq', value: `${preset.frequencyDisplay} (${preset.frequency} Hz)` },
        { label: 'Modulation', value: `${preset.modulation} (Amplitude Shift Keying)` },
        { label: 'Chipset Protocol', value: `${preset.protocol} (${preset.bitLength}-bit Static Key)` },
        { label: 'Decoded Key HEX', value: preset.keyHex },
        { label: 'Timing Element (TE)', value: `${preset.teMicroseconds} µs per bit pulse` },
        { label: 'Format Ekspor', value: 'Flipper Zero .sub File (Siap di-load & ditransmisikan)' }
      ],
      rawHexOrTimings: preset.rawTimings,
      recommendedTool: 'Flipper Zero Sub-GHz / Dolphy Frequency Cloner'
    };
  }

  // 2. Infrared Remote Intent
  if (lower.includes('ir') || lower.includes('remote') || lower.includes('inframerah') || lower.includes('tv') || lower.includes('ac')) {
    const preset = DOLPHY_IR_PRESETS[0];
    return {
      type: 'infrared',
      title: 'Dolphy IR Studio - Flipper Zero Compatible Signal',
      protocolName: `${preset.protocol} Protocol @ ${preset.frequency / 1000} kHz`,
      frequencyOrBand: '38.0 kHz IR Carrier Pulse',
      payloadData: preset.irFileContent,
      decodedInfo: [
        { label: 'Carrier Freq', value: `${preset.frequency} Hz (Standard TV/AC)` },
        { label: 'Protocol Type', value: preset.protocol },
        { label: 'Address HEX', value: preset.address },
        { label: 'Command HEX', value: preset.command },
        { label: 'Compat', value: 'Dolphy Android v2.6 & Flipper Zero .ir format' }
      ],
      rawHexOrTimings: '9000 -4500 560 -560 560 -1690 560 -560 560 -560 560 -1690',
      recommendedTool: 'Dolphy Infrared Module / Flipper Zero'
    };
  }

  // 3. NFC / RFID Tag Intent
  if (lower.includes('nfc') || lower.includes('mifare') || lower.includes('kartu') || lower.includes('rfid')) {
    return {
      type: 'nfc',
      title: 'Dolphy NFC & RFID Inspector (ISO/IEC 14443-A)',
      protocolName: 'Mifare Classic 1K / NDEF Tag',
      frequencyOrBand: '13.56 MHz HF RFID',
      payloadData: `UID: 4B 8A 19 F2 (4-byte Single Size)
SAK: 08 (NXP Mifare Classic 1K)
ATQA: 00 04
Sector 00 [Block 0]: 4B 8A 19 F2 7A 08 04 00 62 63 64 65 66 67 68 69 (Manufacturer)
Sector 01 [Block 4]: 57 69 46 69 5F 50 69 78 65 6C 41 49 00 00 00 00 (Data: WiFi_PixelAI)
Sector Trailer: FF FF FF FF FF FF [Key A] | FF 07 80 69 | FF FF FF FF FF FF [Key B]`,
      decodedInfo: [
        { label: 'Chip Standard', value: 'ISO 14443 Type A (NXP Semiconductors)' },
        { label: 'Memory Capacity', value: '1024 Bytes (16 Sectors x 4 Blocks)' },
        { label: 'UID Type', value: '4-byte Static UID (4B:8A:19:F2)' },
        { label: 'Default Access', value: 'Transport Key (0xFFFFFFFFFFFF)' }
      ],
      recommendedTool: 'Dolphy NFC Reader / Web NFC API'
    };
  }

  // 4. Wi-Fi Spectrum Intent
  if (lower.includes('wifi') || lower.includes('router') || lower.includes('subnet') || lower.includes('spektrum') || lower.includes('frekuensi')) {
    return {
      type: 'wifi_spectrum',
      title: 'Dolphy Wi-Fi Spectrum & 2.4/5GHz Channel Analysis',
      protocolName: 'IEEE 802.11 ax/ac/n/g/b Spectrum Matrix',
      frequencyOrBand: '2.412 GHz - 2.472 GHz & 5.180 GHz - 5.825 GHz',
      payloadData: `Subnet: 192.168.43.0/24 (Tethering / USB Router Range)
Gateway: 192.168.43.1
Broadcast: 192.168.43.255
Best Non-Overlapping Channels: Channel 1 (2412MHz), Ch 6 (2437MHz), Ch 11 (2462MHz)
Bandwidth: 20MHz / 40MHz channel width`,
      decodedInfo: [
        { label: 'Active Interface', value: 'wlan0 / usb0 (USB Tethering Hotspot)' },
        { label: 'Channel Congestion', value: 'Ch 6 (Moderate), Ch 1 & 11 (Clear)' },
        { label: 'Encryption', value: 'WPA3-SAE / WPA2-Personal AES-CCMP' },
        { label: 'Signal Modulation', value: 'OFDMA / 1024-QAM Wi-Fi 6' }
      ],
      recommendedTool: 'Dolphy Wi-Fi Diagnostic & USB Router Bridge'
    };
  }

  // Default to BLE Analysis
  const bleSample = BLE_PACKET_SAMPLES[0];
  return {
    type: 'bluetooth',
    title: 'Dolphy BLE Packet Analyzer (Bluetooth 5.2 LE)',
    protocolName: bleSample.name,
    frequencyOrBand: '2.402 GHz - 2.480 GHz (Channel 37, 38, 39 Adv)',
    payloadData: bleSample.rawHex,
    decodedInfo: bleSample.fields.map(f => ({ label: f.name, value: f.decoded, detail: f.hex })),
    rawHexOrTimings: bleSample.rawHex,
    recommendedTool: 'Dolphy BLE Scanner / Web Bluetooth API'
  };
}
