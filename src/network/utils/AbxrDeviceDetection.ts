/**
 * AbxrDeviceDetection.ts
 * Contains functions to detect device information including OS, browser, IP address, and other device details.
 */

/**
 * Detects the operating system version.
 * @returns A string representing the detected OS version.
 */
export function AbxrDetectOsVersion(): string {
    const userAgent = navigator.userAgent;
    let osVersion = "Unknown";

    if (userAgent.indexOf("Windows NT 10.0") !== -1) osVersion = "Windows 10";
    else if (userAgent.indexOf("Windows NT 6.3") !== -1) osVersion = "Windows 8.1";
    else if (userAgent.indexOf("Windows NT 6.2") !== -1) osVersion = "Windows 8";
    else if (userAgent.indexOf("Windows NT 6.1") !== -1) osVersion = "Windows 7";
    else if (userAgent.indexOf("Windows NT 6.0") !== -1) osVersion = "Windows Vista";
    else if (userAgent.indexOf("Windows NT 5.1") !== -1) osVersion = "Windows XP";
    else if (userAgent.indexOf("Windows NT 5.0") !== -1) osVersion = "Windows 2000";
    else if (userAgent.indexOf("Mac OS X 10_15") !== -1) osVersion = "macOS 10.15 Catalina";
    else if (userAgent.indexOf("Mac OS X 10_14") !== -1) osVersion = "macOS 10.14 Mojave";
    else if (userAgent.indexOf("Mac OS X 10_13") !== -1) osVersion = "macOS 10.13 High Sierra";
    else if (userAgent.indexOf("Mac OS X 10_12") !== -1) osVersion = "macOS 10.12 Sierra";
    else if (userAgent.indexOf("Mac OS X 10_11") !== -1) osVersion = "OS X 10.11 El Capitan";
    else if (userAgent.indexOf("Mac OS X 10_10") !== -1) osVersion = "OS X 10.10 Yosemite";
    else if (userAgent.indexOf("Mac OS X") !== -1) {
        const version = userAgent.match(/Mac OS X (\d+_\d+)/);
        if (version) {
            osVersion = `macOS ${version[1].replace('_', '.')}`;
        } else {
            osVersion = "macOS";
        }
    }
    else if (userAgent.indexOf("Android") !== -1) {
        const version = userAgent.match(/Android (\d+\.?\d*)/);
        osVersion = version ? `Android ${version[1]}` : "Android";
    }
    else if (userAgent.indexOf("iPhone OS") !== -1) {
        const version = userAgent.match(/iPhone OS (\d+_\d+)/);
        osVersion = version ? `iOS ${version[1].replace('_', '.')}` : "iOS";
    }
    else if (userAgent.indexOf("iPad OS") !== -1 || (userAgent.indexOf("iPad") !== -1 && userAgent.indexOf("OS") !== -1)) {
        const version = userAgent.match(/OS (\d+_\d+)/);
        osVersion = version ? `iPadOS ${version[1].replace('_', '.')}` : "iPadOS";
    }
    else if (userAgent.indexOf("Linux") !== -1) osVersion = "Linux";
    else if (userAgent.indexOf("Ubuntu") !== -1) osVersion = "Ubuntu";

    return osVersion;
}

/**
 * Detects the device model.
 * @returns A string representing the detected device model.
 */
export function AbxrDetectDeviceModel(): string {
    const userAgent = navigator.userAgent;
    let deviceModel = "Unknown";

    // Check for specific device models
    if (userAgent.includes("iPhone")) {
        const iPhoneMatch = userAgent.match(/iPhone(\d+,\d+)/);
        if (iPhoneMatch) {
            deviceModel = `iPhone ${iPhoneMatch[1]}`;
        } else {
            deviceModel = "iPhone";
        }
    } else if (userAgent.includes("iPad")) {
        const iPadMatch = userAgent.match(/iPad(\d+,\d+)/);
        if (iPadMatch) {
            deviceModel = `iPad ${iPadMatch[1]}`;
        } else {
            deviceModel = "iPad";
        }
    } else if (userAgent.includes("Android")) {
        // Try to extract Android device model
        const androidMatch = userAgent.match(/; ([^;)]+)\) AppleWebKit/);
        if (androidMatch) {
            deviceModel = androidMatch[1].trim();
        } else {
            deviceModel = "Android Device";
        }
    } else {
        // For desktop, try to determine based on OS
        if (userAgent.includes("Windows")) {
            deviceModel = "Windows PC";
        } else if (userAgent.includes("Mac")) {
            deviceModel = "Mac";
        } else if (userAgent.includes("Linux")) {
            deviceModel = "Linux PC";
        }
    }

    return deviceModel;
}

/**
 * Detects the browser name and version.
 * @returns A string representing the detected browser.
 */
export function AbxrDetectBrowser(): string {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";

    // Check for Chrome first (since other browsers may include "Chrome" in their user agent)
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg") && !userAgent.includes("OPR")) {
        const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
        browser = chromeMatch ? `Chrome ${chromeMatch[1]}` : "Chrome";
    }
    // Check for Edge
    else if (userAgent.includes("Edg")) {
        const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
        browser = edgeMatch ? `Edge ${edgeMatch[1]}` : "Edge";
    }
    // Check for Opera
    else if (userAgent.includes("OPR")) {
        const operaMatch = userAgent.match(/OPR\/(\d+\.\d+\.\d+\.\d+)/);
        browser = operaMatch ? `Opera ${operaMatch[1]}` : "Opera";
    }
    // Check for Firefox
    else if (userAgent.includes("Firefox")) {
        const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
        browser = firefoxMatch ? `Firefox ${firefoxMatch[1]}` : "Firefox";
    }
    // Check for Safari (must come after Chrome check)
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
        browser = safariMatch ? `Safari ${safariMatch[1]}` : "Safari";
    }

    return browser;
}

/**
 * Detects the user's IP address using external services.
 * @param enableExternalDetection Whether to enable external IP detection. Defaults to false to avoid CSP violations.
 * @returns A promise that resolves to the detected IP address, or 'NA' if detection is disabled or fails.
 */
export async function AbxrDetectIpAddress(enableExternalDetection: boolean = false): Promise<string> {
    if (!enableExternalDetection) {
        // Return 'NA' immediately to avoid CSP violations
        return 'NA';
    }

    // External IP detection logic (only runs if explicitly enabled)
    const ipServices = [
        'https://api.ipify.org/?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip'
    ];

    for (const service of ipServices) {
        try {
            const response = await fetch(service);
            const data = await response.json();
            
            // Different services return IP in different formats
            if (data.ip) {
                return data.ip;
            } else if (data.origin) {
                return data.origin;
            } else if (data.query) {
                return data.query;
            }
        } catch (error) {
            console.warn(`AbxrLib: Failed to get IP from ${service}:`, error);
            continue;
        }
    }

    // If all services fail, return NA
    return 'NA';
}

/**
 * Detects screen resolution.
 * @returns A string representing the screen resolution.
 */
export function AbxrDetectScreenResolution(): string {
    return `${screen.width}x${screen.height}`;
}

/**
 * Detects the current language setting.
 * @returns A string representing the detected language.
 */
export function AbxrDetectLanguage(): string {
    return navigator.language || 'en-US';
}

/**
 * Detects the timezone.
 * @returns A string representing the detected timezone.
 */
export function AbxrDetectTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
        return 'UTC';
    }
}

/**
 * Detects if the device supports WebXR.
 * @returns A promise that resolves to a boolean indicating WebXR support.
 */
export async function AbxrDetectWebXRSupport(): Promise<boolean> {
    if ('xr' in navigator) {
        try {
            const xr = (navigator as any).xr;
            const isSupported = await xr.isSessionSupported('immersive-vr');
            return isSupported;
        } catch (error) {
            return false;
        }
    }
    return false;
}

/**
 * Detects all device information and returns it as an object.
 * @param enableIpDetection Whether to enable IP detection. Defaults to false to avoid CSP violations.
 * @returns A promise that resolves to an object containing all detected device information.
 */
export async function AbxrDetectAllDeviceInfo(enableIpDetection: boolean = false): Promise<{
    osVersion: string;
    deviceModel: string;
    browser: string;
    ipAddress: string;
    screenResolution: string;
    language: string;
    timezone: string;
    webXRSupported: boolean;
}> {
    const osVersion = AbxrDetectOsVersion();
    const deviceModel = AbxrDetectDeviceModel();
    const browser = AbxrDetectBrowser();
    const ipAddress = await AbxrDetectIpAddress(enableIpDetection);
    const screenResolution = AbxrDetectScreenResolution();
    const language = AbxrDetectLanguage();
    const timezone = AbxrDetectTimezone();
    const webXRSupported = await AbxrDetectWebXRSupport();

    return {
        osVersion,
        deviceModel,
        browser,
        ipAddress,
        screenResolution,
        language,
        timezone,
        webXRSupported
    };
}
