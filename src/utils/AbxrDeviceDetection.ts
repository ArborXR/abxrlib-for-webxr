/**
 * Device detection utilities for AbxrLib
 * Provides functions to detect OS version, browser information, and IP address
 */

/**
 * Detects the operating system and version from the user agent string
 * @returns OS version string (e.g., "Windows 10", "macOS 14.0", "iOS 17.1")
 */
export function AbxrDetectOsVersion(): string {
    if (typeof navigator === 'undefined') {
        return 'Unknown OS';
    }

    const userAgent = navigator.userAgent;
    
    // Windows detection
    if (userAgent.includes('Windows NT')) {
        const windowsVersionMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
        if (windowsVersionMatch) {
            const ntVersion = windowsVersionMatch[1];
            // Map NT versions to Windows versions
            const windowsVersionMap: { [key: string]: string } = {
                '10.0': 'Windows 10/11',
                '6.3': 'Windows 8.1',
                '6.2': 'Windows 8',
                '6.1': 'Windows 7',
                '6.0': 'Windows Vista'
            };
            return windowsVersionMap[ntVersion] || `Windows NT ${ntVersion}`;
        }
        return 'Windows';
    }
    
    // macOS detection
    if (userAgent.includes('Mac OS X')) {
        const macVersionMatch = userAgent.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/);
        if (macVersionMatch) {
            const version = macVersionMatch[1].replace(/_/g, '.');
            return `macOS ${version}`;
        }
        return 'macOS';
    }
    
    // iOS detection
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        const iosVersionMatch = userAgent.match(/OS (\d+[._]\d+([._]\d+)?)/);
        if (iosVersionMatch) {
            const version = iosVersionMatch[1].replace(/_/g, '.');
            const device = userAgent.includes('iPhone') ? 'iPhone' : 'iPad';
            return `iOS ${version} (${device})`;
        }
        return userAgent.includes('iPhone') ? 'iOS (iPhone)' : 'iOS (iPad)';
    }
    
    // Android detection
    if (userAgent.includes('Android')) {
        const androidVersionMatch = userAgent.match(/Android (\d+(?:\.\d+)*)/);
        if (androidVersionMatch) {
            return `Android ${androidVersionMatch[1]}`;
        }
        return 'Android';
    }
    
    // Linux detection
    if (userAgent.includes('Linux')) {
        return 'Linux';
    }
    
    // Chrome OS detection
    if (userAgent.includes('CrOS')) {
        return 'Chrome OS';
    }
    
    return 'Unknown OS';
}

/**
 * Detects the browser name and version as device model
 * @returns Browser information string (e.g., "Chrome 120.0.6099.109", "Firefox 121.0")
 */
export function AbxrDetectDeviceModel(): string {
    if (typeof navigator === 'undefined') {
        return 'Unknown Browser';
    }

    const userAgent = navigator.userAgent;
    
    // Chrome detection (must come before Safari since Chrome includes Safari in UA)
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        const chromeVersionMatch = userAgent.match(/Chrome\/(\d+(?:\.\d+)*)/);
        if (chromeVersionMatch) {
            return `Chrome ${chromeVersionMatch[1]}`;
        }
        return 'Chrome';
    }
    
    // Edge detection
    if (userAgent.includes('Edg')) {
        const edgeVersionMatch = userAgent.match(/Edg\/(\d+(?:\.\d+)*)/);
        if (edgeVersionMatch) {
            return `Edge ${edgeVersionMatch[1]}`;
        }
        return 'Edge';
    }
    
    // Firefox detection
    if (userAgent.includes('Firefox')) {
        const firefoxVersionMatch = userAgent.match(/Firefox\/(\d+(?:\.\d+)*)/);
        if (firefoxVersionMatch) {
            return `Firefox ${firefoxVersionMatch[1]}`;
        }
        return 'Firefox';
    }
    
    // Safari detection
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        const safariVersionMatch = userAgent.match(/Version\/(\d+(?:\.\d+)*)/);
        if (safariVersionMatch) {
            return `Safari ${safariVersionMatch[1]}`;
        }
        return 'Safari';
    }
    
    // Opera detection
    if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
        const operaVersionMatch = userAgent.match(/(?:OPR|Opera)\/(\d+(?:\.\d+)*)/);
        if (operaVersionMatch) {
            return `Opera ${operaVersionMatch[1]}`;
        }
        return 'Opera';
    }
    
    return 'Unknown Browser';
}

/**
 * Attempts to get the client's IP address
 * Note: Due to browser security restrictions, this may not always be possible
 * @returns Promise that resolves to IP address string or 'NA'
 */
export async function AbxrDetectIpAddress(): Promise<string> {
    try {
        // Try multiple IP detection services as fallbacks
        const services = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://httpbin.org/ip'
        ];
        
        for (const service of services) {
            try {
                const response = await fetch(service, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    // Add timeout to prevent hanging
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Different services return IP in different fields
                    const ip = data.ip || data.query || data.origin;
                    if (ip && typeof ip === 'string') {
                        // Basic IP validation
                        if (ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) || 
                            ip.match(/^[0-9a-fA-F:]+$/)) {
                            return ip;
                        }
                    }
                }
            } catch (serviceError) {
                // Continue to next service
                continue;
            }
        }
        
        return 'NA';
    } catch (error) {
        console.warn('AbxrLib: Could not detect IP address:', error);
        return 'NA';
    }
}

/**
 * Detects all device information at once
 * @returns Promise that resolves to an object with osVersion, deviceModel, and ipAddress
 */
export async function AbxrDetectAllDeviceInfo(): Promise<{
    osVersion: string;
    deviceModel: string;
    ipAddress: string;
}> {
    const [osVersion, deviceModel, ipAddress] = await Promise.all([
        Promise.resolve(AbxrDetectOsVersion()),
        Promise.resolve(AbxrDetectDeviceModel()),
        AbxrDetectIpAddress()
    ]);
    
    return {
        osVersion,
        deviceModel,
        ipAddress
    };
}