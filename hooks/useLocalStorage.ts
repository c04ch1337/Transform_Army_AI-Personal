import React, { useState, useEffect } from 'react';

function getValueFromLocalStorage<T>(key: string, initialValue: T): T {
    if (typeof window === 'undefined') {
        return initialValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        if (item === null) return initialValue;
        
        // Check if the initial value is a non-null object to decide on parsing
        if (typeof initialValue === 'object' && initialValue !== null) {
            return JSON.parse(item);
        }
        // For simple types like strings, numbers, booleans
        return item as unknown as T;
    } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        return initialValue;
    }
}

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        return getValueFromLocalStorage(key, initialValue);
    });

    useEffect(() => {
        try {
            const valueToStore = typeof storedValue === 'object' && storedValue !== null
                ? JSON.stringify(storedValue)
                : storedValue;
            window.localStorage.setItem(key, valueToStore as string);
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
};