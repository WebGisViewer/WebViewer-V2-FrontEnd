// src/components/viewer/EnhancedTowerPopupSystem.ts
// Enhanced Tower Popup System to match V1 styling

interface TowerProperties {
    lat?: string | number;
    lon?: string | number;
    county_display?: string;
    county_name?: string;
    state_fips?: string;
    county_fips?: string;
    overall_height_above_ground?: string | number;
    type_display?: string;
    english_type?: string;
    structure_type?: string;
    entity?: string;
    [key: string]: any;
}

// Create styled popup HTML for antenna towers
export const createTowerPopupHTML = (properties: TowerProperties, companyName: string): string => {
    // Generate unique ID for this popup instance
    const popupId = `tower-popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Format county display
    const formatCountyDisplay = (): string => {
        if (properties.county_display) {
            return properties.county_display.toString();
        }

        const countyName = properties.county_name || 'N/A';
        const stateFips = properties.state_fips || '';
        const countyFips = properties.county_fips || '';

        if (stateFips && countyFips) {
            return `${countyName} (${stateFips}${countyFips})`;
        }

        return countyName;
    };

    // Format type display
    const formatTypeDisplay = (): string => {
        if (properties.type_display) {
            return properties.type_display.toString();
        }

        const englishType = properties.english_type || 'Unknown';
        const structureType = properties.structure_type || 'None';

        return `${englishType} (${structureType})`;
    };

    // Safe value formatter
    const safeValue = (val: any, defaultVal: string = 'N/A'): string => {
        if (val === null || val === undefined || val === '') {
            return defaultVal;
        }
        return val.toString();
    };

    const popupHTML = `
        <style>
        .popup-container-${popupId} {
            font-family: Arial, sans-serif;
            max-width: 400px;
            position: relative;
        }
        
        .copy-btn-${popupId} {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
        }
        
        .copy-btn-${popupId}:hover {
            background-color: #45a049;
        }
        
        .tower-table-${popupId} {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            margin-top: 20px;
        }
        
        .tower-table-${popupId} th, .tower-table-${popupId} td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            min-width: 120px;
        }
        
        .tower-table-${popupId} th {
            background-color: #2196F3;
            color: white;
            font-weight: bold;
        }
        
        .tower-table-${popupId} tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        
        .tower-table-${popupId} tr:hover {
            background-color: #ddd;
        }
        
        .tower-table-${popupId} td {
            font-weight: normal;
        }
        
        .popup-header-${popupId} {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
        }
        </style>

        <div class="popup-container-${popupId}">
            <button class="copy-btn-${popupId}" onclick="copyTowerTableContent_${popupId}()">Copy</button>
            <div class="popup-header-${popupId}">FCC Tower Information</div>
            <table class='tower-table tower-table-${popupId}'>
                <tr><td><b>Latitude</b></td><td>${safeValue(properties.lat)}</td></tr>
                <tr><td><b>Longitude</b></td><td>${safeValue(properties.lon)}</td></tr>
                <tr><td><b>County Name</b></td><td>${formatCountyDisplay()}</td></tr>
                <tr><td><b>Overall Height Above Ground (Meters)</b></td><td>${safeValue(properties.overall_height_above_ground)}</td></tr>
                <tr><td><b>Type</b></td><td>${formatTypeDisplay()}</td></tr>
                <tr><td><b>Owner</b></td><td>${safeValue(properties.entity)}</td></tr>
            </table>
        </div>

        <script>
        function copyTowerTableContent_${popupId}() {
            const table = document.querySelector('.tower-table-${popupId}');
            if (!table) return;
            
            let textContent = 'FCC Tower Information\\n\\n';
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const label = cells[0].textContent.trim();
                    const value = cells[1].textContent.trim();
                    textContent += label + ': ' + value + '\\n';
                }
            });
            
            // Try to copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textContent).then(() => {
                    // Visual feedback
                    const btn = document.querySelector('.copy-btn-${popupId}');
                    if (btn) {
                        const originalText = btn.textContent;
                        btn.textContent = 'Copied!';
                        btn.style.backgroundColor = '#4CAF50';
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.backgroundColor = '#4CAF50';
                        }, 1500);
                    }
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    fallbackCopy_${popupId}(textContent);
                });
            } else {
                fallbackCopy_${popupId}(textContent);
            }
        }
        
        function fallbackCopy_${popupId}(text) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                const btn = document.querySelector('.copy-btn-${popupId}');
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 1500);
                }
            } catch (err) {
                console.error('Fallback copy failed: ', err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
        </script>
    `;

    return popupHTML;
};

// Enhanced popup creation for buffer circles
export const createBufferPopupHTML = (
    properties: TowerProperties,
    distance: number,
    companyName: string
): string => {
    const safeValue = (val: any, defaultVal: string = 'N/A'): string => {
        if (val === null || val === undefined || val === '') {
            return defaultVal;
        }
        return val.toString();
    };

    return `
        <div style="max-width: 250px; font-family: Arial, sans-serif;">
            <div style="font-weight: bold; font-size: 14px; color: #333; margin-bottom: 8px;">
                ${distance} Mile Coverage Area
            </div>
            <div style="font-size: 12px; line-height: 1.4;">
                <strong>Tower:</strong> ${safeValue(properties.entity)}<br>
                <strong>Company:</strong> ${companyName}<br>
                <strong>Location:</strong> ${safeValue(properties.lat)}, ${safeValue(properties.lon)}<br>
                <strong>Height:</strong> ${safeValue(properties.overall_height_above_ground)} meters<br>
                <strong>Coverage:</strong> ${distance} mile radius
            </div>
        </div>
    `;
};

// Helper function to detect if properties look like tower data
export const isTowerPropertyStructure = (properties: any): boolean => {
    return !!(
        properties && (
            properties.entity ||
            properties.lat ||
            properties.lon ||
            properties.overall_height_above_ground ||
            properties.county_display ||
            properties.type_display
        )
    );
};

export { TowerProperties };