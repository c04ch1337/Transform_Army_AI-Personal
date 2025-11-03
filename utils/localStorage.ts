export const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        // Check if the default value is an object to decide on parsing
        if (typeof defaultValue === 'object' && defaultValue !== null) {
            return JSON.parse(item);
        }
        // For simple types like strings, numbers, booleans
        return item as unknown as T;
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        return defaultValue;
    }
};
