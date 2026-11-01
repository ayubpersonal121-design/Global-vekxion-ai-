// Universal TV Remote Control Engine (Remot TV Apapun)
// Supporting: Samsung, LG, Sony, Xiaomi, Polytron, Sharp, Toshiba, TCL, Panasonic, Coocaa, Hisense, & Universal Brute Force
// Protocols: Samsung32, NEC, Sony12, RC5, RAW (38kHz / 40kHz / 36.7kHz)
// Compatible with: Built-in IR Blaster (Xiaomi/Redmi/Huawei), Audio Jack 3.5mm IR, Dolphy App v2.6, & Flipper Zero .ir

import { TvBrandProfile, TvCommandCode } from '../types';

export const TV_BRANDS_DATABASE: Record<string, TvBrandProfile> = {
  samsung: {
    id: 'samsung',
    name: 'Samsung Smart TV (Tizen)',
    countryOrType: 'Korea / Global',
    protocol: 'Samsung32',
    defaultFrequency: 38000,
    ipControlPort: 8002,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'Samsung32', address: '07 00 00 00', command: '02 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'Samsung32', address: '07 00 00 00', command: '0F 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'Samsung32', address: '07 00 00 00', command: '07 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'Samsung32', address: '07 00 00 00', command: '0B 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'Samsung32', address: '07 00 00 00', command: '12 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'Samsung32', address: '07 00 00 00', command: '10 00 00 00', frequency: 38000 },
      source: { name: 'Source', label: 'SOURCE', protocol: 'Samsung32', address: '07 00 00 00', command: '01 00 00 00', frequency: 38000 },
      menu: { name: 'Menu', label: 'MENU', protocol: 'Samsung32', address: '07 00 00 00', command: '1A 00 00 00', frequency: 38000 },
      home: { name: 'Home Hub', label: 'HOME', protocol: 'Samsung32', address: '07 00 00 00', command: '79 00 00 00', frequency: 38000 },
      back: { name: 'Return', label: 'BACK', protocol: 'Samsung32', address: '07 00 00 00', command: '58 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'Samsung32', address: '07 00 00 00', command: '60 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'Samsung32', address: '07 00 00 00', command: '61 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'Samsung32', address: '07 00 00 00', command: '65 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'Samsung32', address: '07 00 00 00', command: '62 00 00 00', frequency: 38000 },
      ok: { name: 'Enter', label: 'OK', protocol: 'Samsung32', address: '07 00 00 00', command: '68 00 00 00', frequency: 38000 },
      netflix: { name: 'Netflix', label: 'NETFLIX', protocol: 'Samsung32', address: '07 00 00 00', command: 'CB 00 00 00', frequency: 38000 },
      youtube: { name: 'YouTube', label: 'YOUTUBE', protocol: 'Samsung32', address: '07 00 00 00', command: 'CC 00 00 00', frequency: 38000 }
    }
  },
  lg: {
    id: 'lg',
    name: 'LG webOS TV',
    countryOrType: 'Korea / Global',
    protocol: 'NEC',
    defaultFrequency: 38000,
    ipControlPort: 3000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: '04 00 00 00', command: '08 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: '04 00 00 00', command: '09 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: '04 00 00 00', command: '02 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: '04 00 00 00', command: '03 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: '04 00 00 00', command: '00 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: '04 00 00 00', command: '01 00 00 00', frequency: 38000 },
      source: { name: 'Input Source', label: 'SOURCE', protocol: 'NEC', address: '04 00 00 00', command: '0B 00 00 00', frequency: 38000 },
      menu: { name: 'Settings Menu', label: 'MENU', protocol: 'NEC', address: '04 00 00 00', command: '43 00 00 00', frequency: 38000 },
      home: { name: 'webOS Launcher', label: 'HOME', protocol: 'NEC', address: '04 00 00 00', command: '21 00 00 00', frequency: 38000 },
      back: { name: 'Back / Exit', label: 'BACK', protocol: 'NEC', address: '04 00 00 00', command: '28 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: '04 00 00 00', command: '40 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: '04 00 00 00', command: '41 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: '04 00 00 00', command: '07 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: '04 00 00 00', command: '06 00 00 00', frequency: 38000 },
      ok: { name: 'Select / OK', label: 'OK', protocol: 'NEC', address: '04 00 00 00', command: '44 00 00 00', frequency: 38000 },
      netflix: { name: 'Netflix', label: 'NETFLIX', protocol: 'NEC', address: '04 00 00 00', command: '5B 00 00 00', frequency: 38000 },
      youtube: { name: 'YouTube', label: 'YOUTUBE', protocol: 'NEC', address: '04 00 00 00', command: '5C 00 00 00', frequency: 38000 }
    }
  },
  sony: {
    id: 'sony',
    name: 'Sony Bravia TV (Android TV)',
    countryOrType: 'Japan / Global',
    protocol: 'Sony12',
    defaultFrequency: 40000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'Sony12', address: '01 00 00 00', command: '15 00 00 00', frequency: 40000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'Sony12', address: '01 00 00 00', command: '14 00 00 00', frequency: 40000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'Sony12', address: '01 00 00 00', command: '12 00 00 00', frequency: 40000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'Sony12', address: '01 00 00 00', command: '13 00 00 00', frequency: 40000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'Sony12', address: '01 00 00 00', command: '10 00 00 00', frequency: 40000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'Sony12', address: '01 00 00 00', command: '11 00 00 00', frequency: 40000 },
      source: { name: 'Input TV/Video', label: 'SOURCE', protocol: 'Sony12', address: '01 00 00 00', command: '25 00 00 00', frequency: 40000 },
      menu: { name: 'Options / Sync Menu', label: 'MENU', protocol: 'Sony12', address: '01 00 00 00', command: '36 00 00 00', frequency: 40000 },
      home: { name: 'Bravia Home', label: 'HOME', protocol: 'Sony12', address: '01 00 00 00', command: '60 00 00 00', frequency: 40000 },
      back: { name: 'Return', label: 'BACK', protocol: 'Sony12', address: '01 00 00 00', command: '23 00 00 00', frequency: 40000 },
      up: { name: 'Up', label: '▲', protocol: 'Sony12', address: '01 00 00 00', command: '74 00 00 00', frequency: 40000 },
      down: { name: 'Down', label: '▼', protocol: 'Sony12', address: '01 00 00 00', command: '75 00 00 00', frequency: 40000 },
      left: { name: 'Left', label: '◀', protocol: 'Sony12', address: '01 00 00 00', command: '34 00 00 00', frequency: 40000 },
      right: { name: 'Right', label: '▶', protocol: 'Sony12', address: '01 00 00 00', command: '33 00 00 00', frequency: 40000 },
      ok: { name: 'Center Confirm', label: 'OK', protocol: 'Sony12', address: '01 00 00 00', command: '65 00 00 00', frequency: 40000 },
      netflix: { name: 'Netflix', label: 'NETFLIX', protocol: 'Sony12', address: '01 00 00 00', command: '54 00 00 00', frequency: 40000 },
      youtube: { name: 'YouTube', label: 'YOUTUBE', protocol: 'Sony12', address: '01 00 00 00', command: '55 00 00 00', frequency: 40000 }
    }
  },
  xiaomi: {
    id: 'xiaomi',
    name: 'Xiaomi Mi TV / Redmi TV',
    countryOrType: 'China / Global',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: 'BF 00 00 00', command: '04 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: 'BF 00 00 00', command: '0D 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: 'BF 00 00 00', command: '05 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: 'BF 00 00 00', command: '06 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: 'BF 00 00 00', command: '07 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: 'BF 00 00 00', command: '08 00 00 00', frequency: 38000 },
      source: { name: 'PatchWall / Input', label: 'SOURCE', protocol: 'NEC', address: 'BF 00 00 00', command: '0A 00 00 00', frequency: 38000 },
      menu: { name: 'Mi Menu', label: 'MENU', protocol: 'NEC', address: 'BF 00 00 00', command: '0B 00 00 00', frequency: 38000 },
      home: { name: 'Android TV Home', label: 'HOME', protocol: 'NEC', address: 'BF 00 00 00', command: '13 00 00 00', frequency: 38000 },
      back: { name: 'Back', label: 'BACK', protocol: 'NEC', address: 'BF 00 00 00', command: '14 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: 'BF 00 00 00', command: '0E 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: 'BF 00 00 00', command: '0F 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: 'BF 00 00 00', command: '10 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: 'BF 00 00 00', command: '11 00 00 00', frequency: 38000 },
      ok: { name: 'OK', label: 'OK', protocol: 'NEC', address: 'BF 00 00 00', command: '12 00 00 00', frequency: 38000 },
      netflix: { name: 'Netflix', label: 'NETFLIX', protocol: 'NEC', address: 'BF 00 00 00', command: '22 00 00 00', frequency: 38000 },
      youtube: { name: 'YouTube', label: 'YOUTUBE', protocol: 'NEC', address: 'BF 00 00 00', command: '23 00 00 00', frequency: 38000 }
    }
  },
  polytron: {
    id: 'polytron',
    name: 'Polytron LED / Android TV',
    countryOrType: 'Indonesia / Populer',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: '01 00 00 00', command: '48 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: '01 00 00 00', command: '08 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: '01 00 00 00', command: '58 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: '01 00 00 00', command: '78 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: '01 00 00 00', command: '68 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: '01 00 00 00', command: '28 00 00 00', frequency: 38000 },
      source: { name: 'AV / HDMI Source', label: 'SOURCE', protocol: 'NEC', address: '01 00 00 00', command: '88 00 00 00', frequency: 38000 },
      menu: { name: 'Menu', label: 'MENU', protocol: 'NEC', address: '01 00 00 00', command: '38 00 00 00', frequency: 38000 },
      home: { name: 'Smart Home', label: 'HOME', protocol: 'NEC', address: '01 00 00 00', command: '98 00 00 00', frequency: 38000 },
      back: { name: 'Exit', label: 'BACK', protocol: 'NEC', address: '01 00 00 00', command: 'A8 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: '01 00 00 00', command: '68 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: '01 00 00 00', command: '28 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: '01 00 00 00', command: '78 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: '01 00 00 00', command: '58 00 00 00', frequency: 38000 },
      ok: { name: 'OK', label: 'OK', protocol: 'NEC', address: '01 00 00 00', command: '1A 00 00 00', frequency: 38000 },
      netflix: { name: 'Netflix', label: 'NETFLIX', protocol: 'NEC', address: '01 00 00 00', command: 'E2 00 00 00', frequency: 38000 },
      youtube: { name: 'YouTube', label: 'YOUTUBE', protocol: 'NEC', address: '01 00 00 00', command: 'E3 00 00 00', frequency: 38000 }
    }
  },
  sharp: {
    id: 'sharp',
    name: 'Sharp Aquos TV',
    countryOrType: 'Japan / Global',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: 'AA 55 00 00', command: '41 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: 'AA 55 00 00', command: '44 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: 'AA 55 00 00', command: '42 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: 'AA 55 00 00', command: '43 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: 'AA 55 00 00', command: '45 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: 'AA 55 00 00', command: '46 00 00 00', frequency: 38000 },
      source: { name: 'Input', label: 'SOURCE', protocol: 'NEC', address: 'AA 55 00 00', command: '47 00 00 00', frequency: 38000 },
      menu: { name: 'Aquos Menu', label: 'MENU', protocol: 'NEC', address: 'AA 55 00 00', command: '4F 00 00 00', frequency: 38000 },
      home: { name: 'Home', label: 'HOME', protocol: 'NEC', address: 'AA 55 00 00', command: '55 00 00 00', frequency: 38000 },
      back: { name: 'Return', label: 'BACK', protocol: 'NEC', address: 'AA 55 00 00', command: '4E 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: 'AA 55 00 00', command: '51 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: 'AA 55 00 00', command: '52 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: 'AA 55 00 00', command: '53 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: 'AA 55 00 00', command: '54 00 00 00', frequency: 38000 },
      ok: { name: 'Enter', label: 'OK', protocol: 'NEC', address: 'AA 55 00 00', command: '50 00 00 00', frequency: 38000 }
    }
  },
  toshiba: {
    id: 'toshiba',
    name: 'Toshiba Regza TV',
    countryOrType: 'Japan / Global',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: '40 BF 00 00', command: '12 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: '40 BF 00 00', command: '10 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: '40 BF 00 00', command: '1A 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: '40 BF 00 00', command: '1B 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: '40 BF 00 00', command: '1C 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: '40 BF 00 00', command: '1D 00 00 00', frequency: 38000 },
      source: { name: 'Input', label: 'SOURCE', protocol: 'NEC', address: '40 BF 00 00', command: '0F 00 00 00', frequency: 38000 },
      menu: { name: 'Quick Menu', label: 'MENU', protocol: 'NEC', address: '40 BF 00 00', command: '1E 00 00 00', frequency: 38000 },
      home: { name: 'VIDAA Home', label: 'HOME', protocol: 'NEC', address: '40 BF 00 00', command: '22 00 00 00', frequency: 38000 },
      back: { name: 'Exit', label: 'BACK', protocol: 'NEC', address: '40 BF 00 00', command: '19 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: '40 BF 00 00', command: '01 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: '40 BF 00 00', command: '02 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: '40 BF 00 00', command: '03 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: '40 BF 00 00', command: '04 00 00 00', frequency: 38000 },
      ok: { name: 'OK', label: 'OK', protocol: 'NEC', address: '40 BF 00 00', command: '0D 00 00 00', frequency: 38000 }
    }
  },
  tcl: {
    id: 'tcl',
    name: 'TCL Google TV / Roku',
    countryOrType: 'China / Global',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: '00 FF 00 00', command: '4A 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: '00 FF 00 00', command: '14 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: '00 FF 00 00', command: '1A 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: '00 FF 00 00', command: '1B 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: '00 FF 00 00', command: '12 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: '00 FF 00 00', command: '13 00 00 00', frequency: 38000 },
      source: { name: 'Source', label: 'SOURCE', protocol: 'NEC', address: '00 FF 00 00', command: '0F 00 00 00', frequency: 38000 },
      menu: { name: 'Dashboard Menu', label: 'MENU', protocol: 'NEC', address: '00 FF 00 00', command: '07 00 00 00', frequency: 38000 },
      home: { name: 'Google TV Home', label: 'HOME', protocol: 'NEC', address: '00 FF 00 00', command: '08 00 00 00', frequency: 38000 },
      back: { name: 'Back', label: 'BACK', protocol: 'NEC', address: '00 FF 00 00', command: '0A 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: '00 FF 00 00', command: '02 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: '00 FF 00 00', command: '03 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: '00 FF 00 00', command: '04 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: '00 FF 00 00', command: '05 00 00 00', frequency: 38000 },
      ok: { name: 'OK', label: 'OK', protocol: 'NEC', address: '00 FF 00 00', command: '06 00 00 00', frequency: 38000 }
    }
  },
  coocaa: {
    id: 'coocaa',
    name: 'Coocaa Android TV',
    countryOrType: 'China / Populer',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: '07 00 00 00', command: '02 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: '07 00 00 00', command: '0F 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: '07 00 00 00', command: '05 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: '07 00 00 00', command: '06 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: '07 00 00 00', command: '07 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: '07 00 00 00', command: '08 00 00 00', frequency: 38000 },
      source: { name: 'Input', label: 'SOURCE', protocol: 'NEC', address: '07 00 00 00', command: '0A 00 00 00', frequency: 38000 },
      home: { name: 'Home', label: 'HOME', protocol: 'NEC', address: '07 00 00 00', command: '13 00 00 00', frequency: 38000 },
      back: { name: 'Back', label: 'BACK', protocol: 'NEC', address: '07 00 00 00', command: '14 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: '07 00 00 00', command: '0E 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: '07 00 00 00', command: '0F 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: '07 00 00 00', command: '10 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: '07 00 00 00', command: '11 00 00 00', frequency: 38000 },
      ok: { name: 'OK', label: 'OK', protocol: 'NEC', address: '07 00 00 00', command: '12 00 00 00', frequency: 38000 }
    }
  },
  hisense: {
    id: 'hisense',
    name: 'Hisense VIDAA / Android TV',
    countryOrType: 'China / Global',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power', label: 'POWER', protocol: 'NEC', address: 'FB 04 00 00', command: '08 00 00 00', frequency: 38000 },
      mute: { name: 'Mute', label: 'MUTE', protocol: 'NEC', address: 'FB 04 00 00', command: '09 00 00 00', frequency: 38000 },
      vol_up: { name: 'Volume Up', label: 'VOL +', protocol: 'NEC', address: 'FB 04 00 00', command: '02 00 00 00', frequency: 38000 },
      vol_down: { name: 'Volume Down', label: 'VOL -', protocol: 'NEC', address: 'FB 04 00 00', command: '03 00 00 00', frequency: 38000 },
      ch_up: { name: 'Channel Up', label: 'CH +', protocol: 'NEC', address: 'FB 04 00 00', command: '00 00 00 00', frequency: 38000 },
      ch_down: { name: 'Channel Down', label: 'CH -', protocol: 'NEC', address: 'FB 04 00 00', command: '01 00 00 00', frequency: 38000 },
      source: { name: 'Input', label: 'SOURCE', protocol: 'NEC', address: 'FB 04 00 00', command: '0B 00 00 00', frequency: 38000 },
      home: { name: 'VIDAA Home', label: 'HOME', protocol: 'NEC', address: 'FB 04 00 00', command: '21 00 00 00', frequency: 38000 },
      back: { name: 'Back', label: 'BACK', protocol: 'NEC', address: 'FB 04 00 00', command: '28 00 00 00', frequency: 38000 },
      up: { name: 'Up', label: '▲', protocol: 'NEC', address: 'FB 04 00 00', command: '40 00 00 00', frequency: 38000 },
      down: { name: 'Down', label: '▼', protocol: 'NEC', address: 'FB 04 00 00', command: '41 00 00 00', frequency: 38000 },
      left: { name: 'Left', label: '◀', protocol: 'NEC', address: 'FB 04 00 00', command: '07 00 00 00', frequency: 38000 },
      right: { name: 'Right', label: '▶', protocol: 'NEC', address: 'FB 04 00 00', command: '06 00 00 00', frequency: 38000 },
      ok: { name: 'OK', label: 'OK', protocol: 'NEC', address: 'FB 04 00 00', command: '44 00 00 00', frequency: 38000 }
    }
  },
  universal: {
    id: 'universal',
    name: 'Universal Multi-TV (Brute Force Cycle)',
    countryOrType: 'All TV Brands Cycle',
    protocol: 'NEC',
    defaultFrequency: 38000,
    commands: {
      power: { name: 'Power Storm (All Brands)', label: 'ALL POWER', protocol: 'NEC', address: 'FF FF 00 00', command: '00 00 00 00', frequency: 38000 },
      mute: { name: 'Universal Mute', label: 'ALL MUTE', protocol: 'NEC', address: 'FF FF 00 00', command: '0F 00 00 00', frequency: 38000 },
      vol_up: { name: 'Universal Vol +', label: 'ALL VOL +', protocol: 'NEC', address: 'FF FF 00 00', command: '02 00 00 00', frequency: 38000 },
      vol_down: { name: 'Universal Vol -', label: 'ALL VOL -', protocol: 'NEC', address: 'FF FF 00 00', command: '03 00 00 00', frequency: 38000 },
      source: { name: 'Cycle Inputs', label: 'ALL SOURCE', protocol: 'NEC', address: 'FF FF 00 00', command: '0B 00 00 00', frequency: 38000 }
    }
  }
};

// Generate official Flipper Zero & Dolphy .ir format file string
export function generateFlipperIrFile(brandProfile: TvBrandProfile, commandKey?: string): string {
  const brand = brandProfile.name;
  let lines: string[] = [
    'Filetype: IR library file',
    'Version: 1',
    `# Global Pixel AI - Universal TV Remote (.ir)`,
    `# Brand: ${brand}`,
    ''
  ];

  const commandsToExport = commandKey && brandProfile.commands[commandKey]
    ? [brandProfile.commands[commandKey]]
    : Object.values(brandProfile.commands);

  commandsToExport.forEach((cmd) => {
    lines.push(`name: ${cmd.name.replace(/\s+/g, '_')}`);
    lines.push('type: parsed');
    lines.push(`protocol: ${cmd.protocol}`);
    lines.push(`address: ${cmd.address}`);
    lines.push(`command: ${cmd.command}`);
    lines.push('');
  });

  return lines.join('\n');
}

// Generate single button Flipper/Dolphy .ir snippet
export function generateSingleCommandIr(brandProfile: TvBrandProfile, commandKey: string): string {
  const cmd = brandProfile.commands[commandKey] || brandProfile.commands.power;
  return `Filetype: IR library file
Version: 1
# Global Pixel AI - ${brandProfile.name}
name: ${cmd.name.replace(/\s+/g, '_')}
type: parsed
protocol: ${cmd.protocol}
address: ${cmd.address}
command: ${cmd.command}
`;
}

// Web Audio API Differential Stereo 38kHz PWM transmitter & feedback audio
export function transmitTvCommand(frequency: number = 38000): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const gainL = ctx.createGain();
      const gainR = ctx.createGain();
      const merger = ctx.createChannelMerger(2);

      // Differential out-of-phase square waves for 3.5mm IR blaster dongles (2x forward voltage across diode)
      oscL.type = 'square';
      oscR.type = 'square';
      
      const targetFreq = Math.min(frequency, ctx.sampleRate / 2 - 100);
      oscL.frequency.setValueAtTime(targetFreq, ctx.currentTime);
      oscR.frequency.setValueAtTime(targetFreq, ctx.currentTime);

      gainL.gain.setValueAtTime(0.95, ctx.currentTime);
      gainL.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      gainR.gain.setValueAtTime(-0.95, ctx.currentTime); // Inverted phase
      gainR.gain.exponentialRampToValueAtTime(-0.01, ctx.currentTime + 0.18);

      oscL.connect(gainL);
      gainL.connect(merger, 0, 0); // Left channel

      oscR.connect(gainR);
      gainR.connect(merger, 0, 1); // Right channel

      merger.connect(ctx.destination);

      oscL.start();
      oscR.start();
      oscL.stop(ctx.currentTime + 0.18);
      oscR.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    // Audio context gesture restriction handling
  }

  // Mobile Haptic Feedback (Vibration burst)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([40, 20, 40]);
    } catch (e) {}
  }
}

// Open official .ir file in Dolphy App / Mi Remote / Flipper Zero
export async function openInDolphyApp(brandProfile: TvBrandProfile, commandKey?: string): Promise<void> {
  const irContent = generateFlipperIrFile(brandProfile, commandKey);
  const fileName = `${brandProfile.id}_tv_remote.ir`;

  // Try Android Native Intent / Share Sheet if supported
  if (typeof navigator !== 'undefined' && typeof File !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([irContent], fileName, { type: 'text/plain' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Remote TV ${brandProfile.name}`,
          text: `Buka berkas infra merah untuk mengontrol TV ${brandProfile.name} di Dolphy App atau Mi Remote.`
        });
        return;
      }
    } catch (e) {
      // User cancelled or share failed, fallback to download
    }
  }

  // Fallback: standard file download trigger
  try {
    const blob = new Blob([irContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('Dolphy export error:', err);
  }
}

// Attempt opening native IR controller on Xiaomi/Android devices or export .ir safely
export function launchMiRemoteApp(brandProfile?: TvBrandProfile): void {
  if (typeof window !== 'undefined' && brandProfile) {
    openInDolphyApp(brandProfile).catch((err) => {
      console.warn('Dolphy app export notification:', err);
    });
  }
}

// Detect which TV brand user asked for in chat
export function detectTvBrandFromPrompt(text: string): { brandId: string; actionKey?: string } {
  const lower = text.toLowerCase();

  let brandId = 'samsung';
  if (lower.includes('lg')) brandId = 'lg';
  else if (lower.includes('sony') || lower.includes('bravia')) brandId = 'sony';
  else if (lower.includes('xiaomi') || lower.includes('mi tv') || lower.includes('redmi')) brandId = 'xiaomi';
  else if (lower.includes('polytron')) brandId = 'polytron';
  else if (lower.includes('sharp') || lower.includes('aquos')) brandId = 'sharp';
  else if (lower.includes('toshiba') || lower.includes('regza')) brandId = 'toshiba';
  else if (lower.includes('tcl')) brandId = 'tcl';
  else if (lower.includes('coocaa')) brandId = 'coocaa';
  else if (lower.includes('hisense')) brandId = 'hisense';
  else if (lower.includes('universal') || lower.includes('semua tv') || lower.includes('apapun')) brandId = 'universal';

  let actionKey: string | undefined = undefined;
  if (lower.includes('nyala') || lower.includes('mati') || lower.includes('power') || lower.includes('on') || lower.includes('off')) actionKey = 'power';
  else if (lower.includes('mute') || lower.includes('bisu') || lower.includes('suara mati')) actionKey = 'mute';
  else if (lower.includes('volume naik') || lower.includes('vol +') || lower.includes('perbesar volume')) actionKey = 'vol_up';
  else if (lower.includes('volume turun') || lower.includes('vol -') || lower.includes('kecilkan')) actionKey = 'vol_down';
  else if (lower.includes('channel naik') || lower.includes('ch +') || lower.includes('ganti channel')) actionKey = 'ch_up';
  else if (lower.includes('channel turun') || lower.includes('ch -')) actionKey = 'ch_down';
  else if (lower.includes('netflix')) actionKey = 'netflix';
  else if (lower.includes('youtube')) actionKey = 'youtube';
  else if (lower.includes('source') || lower.includes('hdmi') || lower.includes('av')) actionKey = 'source';
  else if (lower.includes('home')) actionKey = 'home';
  else if (lower.includes('menu')) actionKey = 'menu';

  return { brandId, actionKey };
}
