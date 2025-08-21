/**
 * Extension method for escaping strings in StringList and AbxrDictStrings for serializing into comma-separated single string.
 */
export function escapeForSerialization(str: string): string {
    const sOut: string[] = [];

    for (const c of str) {
        switch (c) {
            case '\\':
                sOut.push('\\\\');
                break;
            case '\"':
                sOut.push('\\\"');
                break;
            case ',':
                sOut.push('\\,');
                break;
            case '=':
                sOut.push('\\=');
                break;
            default:
                sOut.push(c);
        }
    }
    
    return sOut.join('');
}

// Alternative implementation using string extension (if you prefer extension-like syntax)
declare global {
    interface String {
        escapeForSerialization(): string;
    }
}

String.prototype.escapeForSerialization = function(): string {
    return escapeForSerialization(this.toString());
};

/**
 * Extension method for de-escaping strings into StringList from serialized comma-separated single string.
 */
export function unescapeAndDeserialize(str: string, pfnAddString: (value: string) => void): void {
    const sOut: string[] = [];
    let escapedState: boolean = false;

    for (const c of str) {
        switch (c) {
            case '\\':
                if (escapedState) {
                    sOut.push(c);
                    escapedState = false;
                } else {
                    escapedState = true;
                }
                break;
            case ',':
                if (escapedState) {
                    sOut.push(c);
                } else {
                    pfnAddString(sOut.join(''));
                    sOut.length = 0; // clear the array
                }
                escapedState = false;
                break;
            default:
                sOut.push(c);
                escapedState = false;
        }
    }
    
    if (sOut.length > 0) {
        pfnAddString(sOut.join(''));
    }
}

// Extension-like syntax for unescapeAndDeserialize
declare global {
    interface String {
        escapeForSerialization(): string;
        unescapeAndDeserialize(pfnAddString: (value: string) => void): void;
    }
}

String.prototype.unescapeAndDeserialize = function(pfnAddString: (value: string) => void): void {
    return unescapeAndDeserialize(this.toString(), pfnAddString);
};

/**
 * Extension method for de-escaping strings into StringList from serialized comma-separated single string.
 * Overloaded version that handles key-value pairs (first, second parameters).
 */
export function unescapeAndDeserializeKeyValue(str: string, pfnAddString: (first: string, second: string) => void): void {
    const sFirst: string[] = [];
    const sSecond: string[] = [];
    let escapedState: boolean = false;
    let onFirst: boolean = true;

    for (const c of str) {
        switch (c) {
            case '\\':
                if (escapedState) {
                    if (onFirst) sFirst.push(c); else sSecond.push(c);
                    escapedState = false;
                } else {
                    escapedState = true;
                }
                break;
            case '=':
                if (escapedState) {
                    if (onFirst) sFirst.push(c); else sSecond.push(c);
                } else {
                    onFirst = false;
                }
                escapedState = false;
                break;
            case ',':
                if (escapedState) {
                    if (onFirst) sFirst.push(c); else sSecond.push(c);
                } else {
                    pfnAddString(sFirst.join(''), sSecond.join(''));
                    sFirst.length = 0; // clear the array
                    sSecond.length = 0; // clear the array
                    onFirst = true;
                }
                escapedState = false;
                break;
            default:
                if (onFirst) sFirst.push(c); else sSecond.push(c);
                escapedState = false;
        }
    }
    
    if (sFirst.length > 0 && sSecond.length > 0 && !onFirst) {
        pfnAddString(sFirst.join(''), sSecond.join(''));
    }
}

// Extension-like syntax for unescapeAndDeserializeKeyValue
declare global {
    interface String {
        escapeForSerialization(): string;
        unescapeAndDeserialize(pfnAddString: (value: string) => void): void;
        unescapeAndDeserializeKeyValue(pfnAddString: (first: string, second: string) => void): void;
    }
}

String.prototype.unescapeAndDeserializeKeyValue = function(pfnAddString: (first: string, second: string) => void): void {
    return unescapeAndDeserializeKeyValue(this.toString(), pfnAddString);
};
