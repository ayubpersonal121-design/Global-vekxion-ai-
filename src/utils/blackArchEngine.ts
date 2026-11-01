import { BlackArchSimulation, BlackArchToolType } from '../types';

export function runBlackArchSimulation(promptText: string): BlackArchSimulation {
  const lower = promptText.toLowerCase().trim();

  // 1. OSINT LOOKUP (SHERLOCK)
  if (
    lower.includes('username') ||
    lower.includes('sherlock') ||
    lower.includes('osint') ||
    lower.includes('jejak digital') ||
    lower.includes('social media') ||
    lower.includes('sosmed') ||
    lower.includes('profil')
  ) {
    // Extract target username
    const match = promptText.match(/@?([a-zA-Z0-9_\-\.]+)/);
    const targetUser = match ? match[1].replace(/[@,]/g, '') : 'target_user';

    return {
      tool: 'sherlock',
      target: targetUser,
      title: `Sherlock OSINT Intelligence Analysis for '${targetUser}'`,
      logs: [
        `$ sherlock ${targetUser} --timeout 5 --print-found --csv output.csv`,
        `[*] Checking username "${targetUser}" across 400+ social and developer networks...`,
        `[+] GitHub: https://github.com/${targetUser} [HTTP 200 - OK, 142ms]`,
        `[+] Twitter/X: https://x.com/${targetUser} [HTTP 200 - OK, 210ms]`,
        `[+] Reddit: https://www.reddit.com/user/${targetUser} [HTTP 200 - OK, 180ms]`,
        `[+] Instagram: https://www.instagram.com/${targetUser} [HTTP 200 - OK, 260ms]`,
        `[+] Telegram: https://t.me/${targetUser} [HTTP 200 - OK, 95ms]`,
        `[+] LinkedIn: https://www.linkedin.com/in/${targetUser} [HTTP 200 - OK, 310ms]`,
        `[+] HackerNews: https://news.ycombinator.com/user?id=${targetUser} [HTTP 200 - OK, 115ms]`,
        `[+] Medium: https://medium.com/@${targetUser} [HTTP 200 - OK, 220ms]`,
        `[*] Search completed. Found 8 verified public digital footprint records.`,
        `[+] Exporting metadata to local intelligence report. Status: COMPLETE.`
      ],
      findings: [
        { label: 'Total Platforms Scanned', value: '412 Services', status: 'info' },
        { label: 'Active Identity Matches', value: '8 Discovered', status: 'warning' },
        { label: 'Exposure Risk Level', value: 'Medium (Public Handles)', status: 'warning' },
        { label: 'Metadata Sanitization', value: 'Recommended', status: 'safe' }
      ],
      osintProfiles: [
        { platform: 'GitHub', url: `https://github.com/${targetUser}`, status: 200 },
        { platform: 'Twitter / X', url: `https://x.com/${targetUser}`, status: 200 },
        { platform: 'Reddit', url: `https://www.reddit.com/user/${targetUser}`, status: 200 },
        { platform: 'Telegram', url: `https://t.me/${targetUser}`, status: 200 },
        { platform: 'LinkedIn', url: `https://www.linkedin.com/in/${targetUser}`, status: 200 },
        { platform: 'Medium', url: `https://medium.com/@${targetUser}`, status: 200 }
      ]
    };
  }

  // 2. PASSWORD TESTING (HYDRA)
  if (
    lower.includes('password') ||
    lower.includes('kata sandi') ||
    lower.includes('hydra') ||
    lower.includes('brute') ||
    lower.includes('crack') ||
    lower.includes('login') ||
    lower.includes('autentikasi')
  ) {
    return {
      tool: 'hydra',
      target: 'ssh://192.168.1.10:22 (Simulated Auth)',
      title: 'THC-Hydra High-Speed Security Password Audit',
      logs: [
        `# hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.10 ssh -t 16 -V`,
        `[*] Hydra v9.5 (c) 2026 by van Hauser / THC - starting at ${new Date().toLocaleTimeString()}`,
        `[*] Attack target: 192.168.1.10 (port 22/tcp), protocol: ssh`,
        `[*] Initializing 16 high-speed concurrent threading engines...`,
        `[ATTEMPT] target 192.168.1.10 - login "admin" - pass "123456" (1/10000) [FAILED]`,
        `[ATTEMPT] target 192.168.1.10 - login "admin" - pass "password" (2/10000) [FAILED]`,
        `[ATTEMPT] target 192.168.1.10 - login "admin" - pass "admin2026" (3/10000) [FAILED]`,
        `[ATTEMPT] target 192.168.1.10 - login "admin" - pass "letmein123" (4/10000) [FAILED]`,
        `[*] Speed: 1,420 passwords/second across 16 parallel threads.`,
        `[+] Rate Limiting & Fail2Ban trigger simulation: Server responded with HTTP 429 / TCP RST`,
        `[!] Audit Finding: System enforced rate-limiting after 15 failed attempts.`,
        `[*] Final Evaluation: Target authentication mechanism is RESILIENT against simple dictionary brute-force.`
      ],
      findings: [
        { label: 'Attack Vector', value: 'SSH / Auth Protocol', status: 'info' },
        { label: 'Brute-force Speed', value: '1,420 tries/sec', status: 'info' },
        { label: 'Account Lockout', value: 'ACTIVE (Fail2Ban)', status: 'safe' },
        { label: 'Entropy Recommendation', value: 'Enforce 16+ chars + 2FA', status: 'safe' }
      ]
    };
  }

  // 3. WIRELESS AUDITING (AIRCRACK-NG)
  if (
    lower.includes('wifi') ||
    lower.includes('wlan') ||
    lower.includes('aircrack') ||
    lower.includes('handshake') ||
    lower.includes('sinyal') ||
    lower.includes('nirkabel') ||
    lower.includes('bssid')
  ) {
    return {
      tool: 'aircrack',
      target: 'wlan0mon (Channel 6 - 2.437 GHz)',
      title: 'Aircrack-ng 802.11 Wireless Security Assessment',
      logs: [
        `# airmon-ng start wlan0 && airodump-ng -w wpa_capture --bssid A4:2B:B0:89:12:4B wlan0mon`,
        `[*] Interface wlan0mon set to Monitor Mode (802.11 b/g/n/ac/ax radio active)`,
        `[*] CH  6 ][ Elapsed: 12 s ][ ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ][ WPA Handshake: captured!`,
        ` `,
        ` BSSID              PWR RXQ  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID`,
        ` A4:2B:B0:89:12:4A  -42 100      312      1400  28  36  540   WPA3 CCMP   SAE  Pixel-Secure-5G`,
        ` A4:2B:B0:89:12:4B  -55  98      289       820  14   6  270   WPA2 CCMP   PSK  Office_Guest_HighSpeed`,
        ` C8:3A:35:E1:90:72  -68  74      142       210   3   1   54   WPA2 TKIP   PSK  SmartIoT_Device_Mesh`,
        ` `,
        `[+] WPA (4-way handshake) captured successfully for BSSID A4:2B:B0:89:12:4B`,
        `[*] PMKID telemetry verified. Key integrity check passed.`,
        `[!] Warning: TKIP cipher detected on C8:3A:35:E1:90:72 (Vulnerable to Beck-Tews attack).`
      ],
      findings: [
        { label: 'Monitor Mode', value: 'ENABLED (wlan0mon)', status: 'safe' },
        { label: '4-Way Handshake', value: 'CAPTURED (WPA2)', status: 'warning' },
        { label: 'WPS Vulnerability', value: 'PIN EXPOSED (Reaver Risk)', status: 'critical' },
        { label: 'Hardening Advice', value: 'Upgrade to WPA3-SAE + 802.11w', status: 'safe' }
      ]
    };
  }

  // 4. NETWORK MAPPING (NMAP / NETWORK SCANNER)
  return {
    tool: 'nmap',
    target: '192.168.1.0/24 (Subnet Discovery)',
    title: 'BlackArch Network Mapper & Port Scanner v7.93',
    logs: [
      `# nmap -sS -sV -O -T4 192.168.1.1`,
      `Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}`,
      `Nmap scan report for gateway.local (192.168.1.1)`,
      `Host is up (0.0012s latency).`,
      `Not shown: 995 closed tcp ports (reset)`,
      `PORT     STATE SERVICE     VERSION`,
      `22/tcp   open  ssh         OpenSSH 9.2p1 Debian 2+deb12u2`,
      `53/tcp   open  domain      dnsmasq 2.89`,
      `80/tcp   open  http        nginx 1.22.1`,
      `443/tcp  open  ssl/https   nginx 1.22.1 (TLSv1.3)`,
      `8080/tcp open  http-proxy  Squid http proxy 5.7`,
      ` `,
      `Device type: general purpose | router`,
      `Running: Linux 5.X | 6.X`,
      `OS details: Linux 5.15 - 6.1 (Debian/Ubuntu kernel)`,
      `Network Distance: 1 hop`,
      `Nmap done: 1 IP address (1 host up) scanned in 2.14 seconds.`
    ],
    findings: [
      { label: 'Open Ports Discovered', value: '5 Services Active', status: 'info' },
      { label: 'SSH Server (Port 22)', value: 'OpenSSH 9.2p1 (Secure)', status: 'safe' },
      { label: 'Web Server (Port 80/443)', value: 'nginx 1.22.1 (Hardened)', status: 'safe' },
      { label: 'Proxy Port (8080)', value: 'Squid 5.7 (Restricted)', status: 'warning' }
    ]
  };
}
