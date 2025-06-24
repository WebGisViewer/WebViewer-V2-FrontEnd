// src/components/viewer/EnhancedTowerPopupSystem.tsx
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
                        }, 2000);
                    }
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    // Fallback to selection method
                    fallbackCopyMethod_${popupId}();
                });
            } else {
                // Fallback for older browsers
                fallbackCopyMethod_${popupId}();
            }
        }
        
        function fallbackCopyMethod_${popupId}() {
            const table = document.querySelector('.tower-table-${popupId}');
            if (!table) return;
            
            const range = document.createRange();
            range.selectNode(table);
            
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            try {
                document.execCommand('copy');
                const btn = document.querySelector('.copy-btn-${popupId}');
                if (btn) {
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                        btn.textContent = 'Copy';
                    }, 2000);
                }
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            
            selection.removeAllRanges();
        }
        </script>
    `;

    return popupHTML;
};

// Helper function to determine if a layer is an antenna/tower layer
export const isAntennaLayer = (layerName: string): boolean => {
    const antennaKeywords = ['antenna', 'tower', 'fcc tower'];
    const lowerName = layerName.toLowerCase();
    return antennaKeywords.some(keyword => lowerName.includes(keyword));
};

// Get tower company from layer name
export const getTowerCompanyFromLayerName = (layerName: string): string => {
    const lowerName = layerName.toLowerCase();

    if (lowerName.includes('american tower')) return 'American Towers';
    if (lowerName.includes('sba')) return 'SBA';
    if (lowerName.includes('crown castle')) return 'Crown Castle';
    if (lowerName.includes('other')) return 'Other';

    // Default fallback
    return 'FCC Tower';
};

// Create styled popup HTML for antenna buffers
export const createBufferPopupHTML = (properties: any, bufferType: string): string => {
    // Generate unique ID for this popup instance
    const popupId = `buffer-popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
            max-width: 350px;
            position: relative;
        }
        
        .buffer-table-${popupId} {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            margin-top: 10px;
        }
        
        .buffer-table-${popupId} td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .buffer-table-${popupId} td:first-child {
            background-color: #f5f5f5;
            font-weight: bold;
            min-width: 120px;
        }
        
        .buffer-table-${popupId} tr:hover {
            background-color: #f9f9f9;
        }
        
        .popup-header-${popupId} {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
        }
        
        .buffer-type-${popupId} {
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 8px;
        }
        </style>

        <div class="popup-container-${popupId}">
            <div class="popup-header-${popupId}">Tower Coverage Area</div>
            <div class="buffer-type-${popupId}">${bufferType}</div>
            <table class='buffer-table-${popupId}'>
                <tr><td>Tower ID</td><td>${safeValue(properties.tower_id)}</td></tr>
                <tr><td>Tower Name</td><td>${safeValue(properties.tower_name)}</td></tr>
                <tr><td>Company</td><td>${safeValue(properties.company)}</td></tr>
                <tr><td>Coverage Radius</td><td>${safeValue(properties.radius)} km</td></tr>
                <tr><td>Tower Height</td><td>${safeValue(properties.tower_height)} m</td></tr>
                <tr><td>Location</td><td>${safeValue(properties.lat)}, ${safeValue(properties.lon)}</td></tr>
            </table>
        </div>
    `;

    return popupHTML;
};