# Device Data & Location Tracking Guide

## Overview

As of v2.1.0, the BerseMuka API supports comprehensive device and location tracking during authentication (registration and login). This guide explains why it's important, what to send, and how to implement it in your client applications.

---

## Why Track Device Data?

### 🔒 Security Benefits
- **Anomaly Detection:** Identify suspicious logins from unusual locations
- **Device Fingerprinting:** Recognize trusted devices
- **Session Management:** View and manage all active sessions
- **Security Alerts:** Notify users of new device logins
- **Breach Prevention:** Quick detection of unauthorized access

### 📊 Analytics Benefits
- **Platform Distribution:** Understand iOS vs Android vs Web usage
- **App Version Adoption:** Track which versions users are on
- **Geographic Insights:** See where users are located
- **Device Preferences:** Understand hardware and OS preferences
- **Usage Patterns:** Analyze behavior by device type

### 🔔 Notification Benefits
- **Push Token Storage:** Enable push notifications
- **Targeted Messaging:** Send device-specific notifications
- **Token Updates:** Keep notification tokens current
- **Multi-Device Support:** Deliver to all user devices

### 👤 User Experience Benefits
- **Trusted Devices:** Skip 2FA on recognized devices
- **Device Names:** Show friendly names in session list
- **Session History:** Display login history with device details
- **Remote Logout:** Terminate sessions on lost/stolen devices

---

## What Data to Send

### Device Information

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `deviceId` | string | Recommended | Unique device identifier (UUID) | `"abc-123-xyz-789"` |
| `deviceName` | string | Optional | User-friendly device name | `"John's iPhone"` |
| `deviceType` | string | Recommended | Platform type | `"ios"`, `"android"`, `"web"`, `"desktop"` |
| `osVersion` | string | Optional | Operating system version | `"iOS 17.0"`, `"Android 14"` |
| `appVersion` | string | Recommended | Your app version | `"1.2.3"` |
| `pushToken` | string | Optional | FCM/APNs notification token | `"fcm-token-here"` |

### Location Information

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `latitude` | number | Optional | GPS latitude | `1.3521` |
| `longitude` | number | Optional | GPS longitude | `103.8198` |
| `city` | string | Optional | City name | `"Singapore"` |
| `country` | string | Optional | Country name | `"Singapore"` |
| `timezone` | string | Recommended | IANA timezone | `"Asia/Singapore"` |

---

## Implementation by Platform

### iOS (Swift)

```swift
import UIKit
import CoreLocation
import UserNotifications

struct DeviceInfo: Codable {
    let deviceId: String
    let deviceName: String
    let deviceType: String
    let osVersion: String
    let appVersion: String
    let pushToken: String?
}

struct LocationInfo: Codable {
    let latitude: Double?
    let longitude: Double?
    let city: String?
    let country: String?
    let timezone: String
}

class DeviceDataCollector {
    
    // Get unique device ID
    static func getDeviceId() -> String {
        // Try to get from keychain first
        if let saved = KeychainHelper.load(key: "deviceId") {
            return saved
        }
        
        // Generate new UUID and save
        let uuid = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
        KeychainHelper.save(key: "deviceId", data: uuid)
        return uuid
    }
    
    // Get device name
    static func getDeviceName() -> String {
        return UIDevice.current.name
    }
    
    // Get OS version
    static func getOSVersion() -> String {
        return "iOS \\(UIDevice.current.systemVersion)"
    }
    
    // Get app version
    static func getAppVersion() -> String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\\(version) (\\(build))"
    }
    
    // Request push notification token
    static func getPushToken() async -> String? {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])
            
            if granted {
                return await withCheckedContinuation { continuation in
                    DispatchQueue.main.async {
                        UIApplication.shared.registerForRemoteNotifications()
                        // Store continuation to resume when token is received
                        // This is simplified - implement proper token handling
                        continuation.resume(returning: UserDefaults.standard.string(forKey: "pushToken"))
                    }
                }
            }
        } catch {
            print("Failed to request notification permission: \\(error)")
        }
        return nil
    }
    
    // Get current location
    static func getLocation() async -> LocationInfo {
        let locationManager = CLLocationManager()
        
        // Request permission if needed
        let status = locationManager.authorizationStatus
        if status == .notDetermined {
            locationManager.requestWhenInUseAuthorization()
        }
        
        // Get timezone
        let timezone = TimeZone.current.identifier
        
        // Try to get location if authorized
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            if let location = locationManager.location {
                // Reverse geocode to get city/country
                let geocoder = CLGeocoder()
                if let placemark = try? await geocoder.reverseGeocodeLocation(location).first {
                    return LocationInfo(
                        latitude: location.coordinate.latitude,
                        longitude: location.coordinate.longitude,
                        city: placemark.locality,
                        country: placemark.country,
                        timezone: timezone
                    )
                }
                
                return LocationInfo(
                    latitude: location.coordinate.latitude,
                    longitude: location.coordinate.longitude,
                    city: nil,
                    country: nil,
                    timezone: timezone
                )
            }
        }
        
        // Return just timezone if location unavailable
        return LocationInfo(
            latitude: nil,
            longitude: nil,
            city: nil,
            country: nil,
            timezone: timezone
        )
    }
    
    // Collect all device info
    static func getDeviceInfo() async -> DeviceInfo {
        let pushToken = await getPushToken()
        
        return DeviceInfo(
            deviceId: getDeviceId(),
            deviceName: getDeviceName(),
            deviceType: "ios",
            osVersion: getOSVersion(),
            appVersion: getAppVersion(),
            pushToken: pushToken
        )
    }
}

// Usage in login/register
struct RegisterRequest: Codable {
    let email: String
    let password: String
    let fullName: String
    let deviceInfo: DeviceInfo?
    let locationInfo: LocationInfo?
}

func register(email: String, password: String, fullName: String) async throws {
    let deviceInfo = await DeviceDataCollector.getDeviceInfo()
    let locationInfo = await DeviceDataCollector.getLocation()
    
    let request = RegisterRequest(
        email: email,
        password: password,
        fullName: fullName,
        deviceInfo: deviceInfo,
        locationInfo: locationInfo
    )
    
    let url = URL(string: "https://api.bersemuka.com/v2/auth/register")!
    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = "POST"
    urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
    urlRequest.httpBody = try JSONEncoder().encode(request)
    
    let (data, response) = try await URLSession.shared.data(for: urlRequest)
    
    // Handle response...
}
```

### Android (Kotlin)

```kotlin
import android.content.Context
import android.os.Build
import android.provider.Settings
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import java.util.*

data class DeviceInfo(
    val deviceId: String,
    val deviceName: String,
    val deviceType: String,
    val osVersion: String,
    val appVersion: String,
    val pushToken: String?
)

data class LocationInfo(
    val latitude: Double? = null,
    val longitude: Double? = null,
    val city: String? = null,
    val country: String? = null,
    val timezone: String
)

object DeviceDataCollector {
    
    // Get unique device ID
    fun getDeviceId(context: Context): String {
        // Try SharedPreferences first
        val prefs = context.getSharedPreferences("device_prefs", Context.MODE_PRIVATE)
        var deviceId = prefs.getString("device_id", null)
        
        if (deviceId == null) {
            // Use Android ID
            deviceId = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ANDROID_ID
            ) ?: UUID.randomUUID().toString()
            
            prefs.edit().putString("device_id", deviceId).apply()
        }
        
        return deviceId
    }
    
    // Get device name
    fun getDeviceName(): String {
        val manufacturer = Build.MANUFACTURER
        val model = Build.MODEL
        return if (model.startsWith(manufacturer)) {
            model.capitalize()
        } else {
            "${manufacturer.capitalize()} $model"
        }
    }
    
    // Get OS version
    fun getOSVersion(): String {
        return "Android ${Build.VERSION.RELEASE}"
    }
    
    // Get app version
    fun getAppVersion(context: Context): String {
        val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        return "${packageInfo.versionName} (${packageInfo.versionCode})"
    }
    
    // Get push token
    suspend fun getPushToken(): String? {
        return try {
            FirebaseMessaging.getInstance().token.await()
        } catch (e: Exception) {
            null
        }
    }
    
    // Get location
    suspend fun getLocation(context: Context): LocationInfo {
        val fusedLocationClient: FusedLocationProviderClient =
            LocationServices.getFusedLocationProviderClient(context)
        
        val timezone = TimeZone.getDefault().id
        
        return try {
            val location = fusedLocationClient.lastLocation.await()
            
            if (location != null) {
                // Reverse geocode to get city/country
                val geocoder = android.location.Geocoder(context, Locale.getDefault())
                val addresses = geocoder.getFromLocation(
                    location.latitude,
                    location.longitude,
                    1
                )
                
                val address = addresses?.firstOrNull()
                
                LocationInfo(
                    latitude = location.latitude,
                    longitude = location.longitude,
                    city = address?.locality,
                    country = address?.countryName,
                    timezone = timezone
                )
            } else {
                LocationInfo(timezone = timezone)
            }
        } catch (e: Exception) {
            LocationInfo(timezone = timezone)
        }
    }
    
    // Collect all device info
    suspend fun getDeviceInfo(context: Context): DeviceInfo {
        val pushToken = getPushToken()
        
        return DeviceInfo(
            deviceId = getDeviceId(context),
            deviceName = getDeviceName(),
            deviceType = "android",
            osVersion = getOSVersion(),
            appVersion = getAppVersion(context),
            pushToken = pushToken
        )
    }
}

// Usage in login/register
data class RegisterRequest(
    val email: String,
    val password: String,
    val fullName: String,
    val deviceInfo: DeviceInfo? = null,
    val locationInfo: LocationInfo? = null
)

suspend fun register(
    context: Context,
    email: String,
    password: String,
    fullName: String
) {
    val deviceInfo = DeviceDataCollector.getDeviceInfo(context)
    val locationInfo = DeviceDataCollector.getLocation(context)
    
    val request = RegisterRequest(
        email = email,
        password = password,
        fullName = fullName,
        deviceInfo = deviceInfo,
        locationInfo = locationInfo
    )
    
    // Make API call...
}
```

### React Native (TypeScript)

```typescript
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  pushToken?: string;
}

interface LocationInfo {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  timezone: string;
}

class DeviceDataCollector {
  // Get unique device ID
  static async getDeviceId(): Promise<string> {
    // Try to get saved ID
    let deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      // Generate and save new ID
      deviceId = await DeviceInfo.getUniqueId();
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  }
  
  // Get device name
  static async getDeviceName(): Promise<string> {
    return await DeviceInfo.getDeviceName();
  }
  
  // Get OS version
  static async getOSVersion(): Promise<string> {
    const systemVersion = await DeviceInfo.getSystemVersion();
    const platformName = Platform.OS === 'ios' ? 'iOS' : 'Android';
    return `${platformName} ${systemVersion}`;
  }
  
  // Get app version
  static getAppVersion(): string {
    return `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`;
  }
  
  // Get push token
  static async getPushToken(): Promise<string | undefined> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        return await messaging().getToken();
      }
    } catch (error) {
      console.warn('Failed to get push token:', error);
    }
    return undefined;
  }
  
  // Get location
  static async getLocation(): Promise<LocationInfo> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          // Try reverse geocoding (you'll need a geocoding service)
          // For example, using Google Geocoding API or similar
          const { latitude, longitude } = position.coords;
          
          // This is a placeholder - implement actual geocoding
          resolve({
            latitude,
            longitude,
            city: undefined,
            country: undefined,
            timezone,
          });
        },
        (error) => {
          console.warn('Location error:', error);
          resolve({ timezone });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }
  
  // Collect all device info
  static async getDeviceInfo(): Promise<DeviceInfo> {
    const [deviceId, deviceName, osVersion, pushToken] = await Promise.all([
      this.getDeviceId(),
      this.getDeviceName(),
      this.getOSVersion(),
      this.getPushToken(),
    ]);
    
    return {
      deviceId,
      deviceName,
      deviceType: Platform.OS as 'ios' | 'android',
      osVersion,
      appVersion: this.getAppVersion(),
      pushToken,
    };
  }
}

// Usage in login/register
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;
}

export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  const [deviceInfo, locationInfo] = await Promise.all([
    DeviceDataCollector.getDeviceInfo(),
    DeviceDataCollector.getLocation(),
  ]);
  
  const request: RegisterRequest = {
    email,
    password,
    fullName,
    deviceInfo,
    locationInfo,
  };
  
  const response = await fetch('https://api.bersemuka.com/v2/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens and navigate
    await AsyncStorage.setItem('accessToken', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
}
```

### Web (JavaScript/TypeScript)

```typescript
import UAParser from 'ua-parser-js';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'web' | 'desktop';
  osVersion: string;
  appVersion: string;
  pushToken?: string;
}

interface LocationInfo {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  timezone: string;
}

class DeviceDataCollector {
  // Get or generate device ID
  static getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  }
  
  // Parse user agent to get device info
  static getDeviceName(): string {
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();
    
    return `${result.browser.name} on ${result.os.name}`;
  }
  
  // Get OS version
  static getOSVersion(): string {
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();
    
    return `${result.os.name} ${result.os.version || ''}`.trim();
  }
  
  // Get app version (from your build/env)
  static getAppVersion(): string {
    return process.env.REACT_APP_VERSION || '1.0.0';
  }
  
  // Get web push token (if using service workers)
  static async getPushToken(): Promise<string | undefined> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
        });
        
        return JSON.stringify(subscription);
      } catch (error) {
        console.warn('Failed to get push subscription:', error);
      }
    }
    return undefined;
  }
  
  // Get location
  static async getLocation(): Promise<LocationInfo> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (!navigator.geolocation) {
      return { timezone };
    }
    
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: undefined, // Would need geocoding service
            country: undefined,
            timezone,
          });
        },
        (error) => {
          console.warn('Location error:', error);
          resolve({ timezone });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
  
  // Collect all device info
  static async getDeviceInfo(): Promise<DeviceInfo> {
    const pushToken = await this.getPushToken();
    
    return {
      deviceId: this.getDeviceId(),
      deviceName: this.getDeviceName(),
      deviceType: 'web',
      osVersion: this.getOSVersion(),
      appVersion: this.getAppVersion(),
      pushToken,
    };
  }
}

// Usage in login/register
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;
}

export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  const [deviceInfo, locationInfo] = await Promise.all([
    DeviceDataCollector.getDeviceInfo(),
    DeviceDataCollector.getLocation(),
  ]);
  
  const request: RegisterRequest = {
    email,
    password,
    fullName,
    deviceInfo,
    locationInfo,
  };
  
  const response = await fetch('https://api.bersemuka.com/v2/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    credentials: 'include', // Important for cookies
  });
  
  const data = await response.json();
  
  if (data.success) {
    sessionStorage.setItem('accessToken', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
}
```

---

## Best Practices

### 1. User Privacy
- ✅ Request location permission with clear explanation
- ✅ Allow users to opt-out of location tracking
- ✅ Store device ID securely (Keychain/SharedPreferences)
- ✅ Don't track location continuously - only on auth

### 2. Error Handling
- ✅ Don't block auth if device data collection fails
- ✅ Send whatever data is available
- ✅ Log failures for debugging
- ✅ Gracefully handle permission denials

### 3. Performance
- ✅ Collect device data asynchronously
- ✅ Cache device ID (don't regenerate every time)
- ✅ Use location with timeout
- ✅ Don't wait for geocoding - send coordinates only

### 4. Security
- ✅ Never expose sensitive device data in logs
- ✅ Use HTTPS for all API calls
- ✅ Validate device IDs on backend
- ✅ Rotate push tokens on each login

---

## Testing

### Test Device Data Collection

```bash
# Test registration with device data
curl -X POST http://localhost:3000/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "deviceInfo": {
      "deviceId": "test-device-123",
      "deviceName": "Test iPhone",
      "deviceType": "ios",
      "osVersion": "iOS 17.0",
      "appVersion": "1.0.0",
      "pushToken": "test-push-token"
    },
    "locationInfo": {
      "city": "Singapore",
      "country": "Singapore",
      "timezone": "Asia/Singapore"
    }
  }'
```

### Verify Database Storage

```sql
-- Check user session with device data
SELECT 
  id,
  user_id,
  ip_address,
  device_info,
  location_data,
  created_at
FROM user_sessions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 1;

-- Check device registrations
SELECT * FROM device_registrations
WHERE user_id = 'your-user-id';

-- Verify push token storage
SELECT device_info->>'pushToken' as push_token
FROM device_registrations
WHERE user_id = 'your-user-id';
```

---

## Troubleshooting

### Common Issues

**Problem:** Device ID changes on every app launch
- **Solution:** Store in persistent storage (Keychain/SharedPreferences)

**Problem:** Location permission denied
- **Solution:** Handle gracefully, send timezone only

**Problem:** Push token not available immediately
- **Solution:** Update token on next login or via separate endpoint

**Problem:** Geocoding fails
- **Solution:** Send coordinates only, geocode on backend if needed

---

## Support

For questions or issues:
- 📖 [Full API Documentation](./AUTH_API.md)
- 🐛 [Report Issues](https://github.com/berse-app/backend/issues)
- 💬 [Discord Community](https://discord.gg/bersemuka)
- 📧 [Email Support](mailto:support@bersemuka.com)

---

**Last Updated:** October 15, 2025  
**API Version:** v2.1.0
