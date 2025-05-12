// src/utils/download.ts
/**
 * Download a file with given data
 * @param data Content of the file
 * @param filename Filename with extension
 * @param type MIME type
 */
export const downloadFile = (data: string, filename: string, type: string): void => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

/**
 * Export data as CSV
 * @param data Array of objects to convert to CSV
 * @param filename Filename (without extension)
 */
export const exportCSV = <T extends Record<string, unknown>>(data: T[], filename: string): void => {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV header row
    let csv = headers.join(',') + '\n';

    // Add data rows
    data.forEach(item => {
        const row = headers.map(header => {
            const value = item[header];
            // Handle special cases (comma in content, quotes, null/undefined)
            if (value === null || value === undefined) {
                return '';
            } else if (typeof value === 'string') {
                // Escape quotes and wrap in quotes if needed
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            } else {
                return String(value);
            }
        });

        csv += row.join(',') + '\n';
    });

    downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Export data as JSON
 * @param data Object or array to export as JSON
 * @param filename Filename (without extension)
 * @param pretty Whether to pretty-print the JSON
 */
export const exportJSON = <T>(data: T, filename: string, pretty = true): void => {
    const json = pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

    downloadFile(json, `${filename}.json`, 'application/json;charset=utf-8;');
};

/**
 * Create a data URL from an image
 * @param file Image file
 * @returns Promise resolving to data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};