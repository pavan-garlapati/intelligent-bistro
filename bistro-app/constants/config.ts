// To find your computer's local IP for testing on a physical device via Expo Go:
//   macOS / Linux: run `ifconfig | grep "inet "` and use the IPv4 from your Wi-Fi adapter (usually en0)
//   Windows:        run `ipconfig` and use the "IPv4 Address" under your active Wi-Fi adapter
//
// iOS Simulator and web can use http://localhost:3001 directly; Android emulator can use http://10.0.2.2:3001.
// You can override this at runtime with EXPO_PUBLIC_API_URL=http://x.x.x.x:3001/api in a .env file.
const LOCAL_IP = '192.168.1.x'; // ← REPLACE with your computer's local IP

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  (__DEV__ ? `http://${LOCAL_IP}:3001/api` : 'https://your-api.com/api');
