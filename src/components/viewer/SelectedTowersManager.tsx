// src/components/viewer/SelectedTowersManager.tsx
import * as L from 'leaflet';
import { frontendBufferManager, TowerWithBuffers, getTowerCompanyFromLayerName } from './FrontendAntennaBufferSystem';
import { createTowerPopupHTML } from './EnhancedTowerPopupSystem';

export interface SelectedTower {
    id: string;
    data: any;
    coordinates: [number, number];
    layerName: string;
    companyName: string;
    originalLayerId: number;
}

export class SelectedTowersManager {
    private selectedTowers: Map<string, SelectedTower> = new Map();
    private selectedLayerGroup: L.LayerGroup | null = null;
    private mapRef: L.Map | null = null;
    private onSelectionChangeCallback: ((towers: SelectedTower[]) => void) | null = null;

    constructor() {
        // Make this manager globally available
        (window as any).selectedTowersManager = this;
    }

    initialize(map: L.Map) {
        this.mapRef = map;
        this.selectedLayerGroup = L.layerGroup();
        // We'll add this to the map when we have selected towers
    }

    onSelectionChange(callback: (towers: SelectedTower[]) => void) {
        this.onSelectionChangeCallback = callback;
    }

    toggleTower(
        towerId: string,
        towerData: any,
        coordinates: [number, number],
        layerName: string,
        companyName: string,
        originalLayerId: number
    ): boolean {
        const isCurrentlySelected = this.selectedTowers.has(towerId);

        if (isCurrentlySelected) {
            this.unselectTower(towerId);
            return false;
        } else {
            this.selectTower(towerId, towerData, coordinates, layerName, companyName, originalLayerId);
            return true;
        }
    }

    selectTower(
        towerId: string,
        towerData: any,
        coordinates: [number, number],
        layerName: string,
        companyName: string,
        originalLayerId: number
    ) {
        const selectedTower: SelectedTower = {
            id: towerId,
            data: towerData,
            coordinates,
            layerName,
            companyName,
            originalLayerId
        };

        this.selectedTowers.set(towerId, selectedTower);
        this.updateSelectedLayer();
        this.notifySelectionChange();

        console.log(`Tower ${towerId} selected from ${layerName}`);
    }

    unselectTower(towerId: string) {
        this.selectedTowers.delete(towerId);
        this.updateSelectedLayer();
        this.notifySelectionChange();

        console.log(`Tower ${towerId} unselected`);
    }

    isSelected(towerId: string): boolean {
        return this.selectedTowers.has(towerId);
    }

    getSelectedTowers(): SelectedTower[] {
        return Array.from(this.selectedTowers.values());
    }

    clearAllSelections() {
        this.selectedTowers.clear();
        this.updateSelectedLayer();
        this.notifySelectionChange();
    }

    private updateSelectedLayer() {
        if (!this.mapRef || !this.selectedLayerGroup) return;

        // Clear existing selected layer
        this.selectedLayerGroup.clearLayers();

        if (this.selectedTowers.size === 0) {
            // Remove from map if no towers selected
            if (this.mapRef.hasLayer(this.selectedLayerGroup)) {
                this.mapRef.removeLayer(this.selectedLayerGroup);
            }
            return;
        }

        // Add selected layer to map if not already added
        if (!this.mapRef.hasLayer(this.selectedLayerGroup)) {
            this.mapRef.addLayer(this.selectedLayerGroup);
        }

        // Create features collection for selected towers
        const selectedFeatures = Array.from(this.selectedTowers.values()).map(tower => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [tower.coordinates[1], tower.coordinates[0]] // [lng, lat] for GeoJSON
            },
            properties: tower.data
        }));

        const selectedData = {
            type: 'FeatureCollection' as const,
            features: selectedFeatures
        };

        // Create the selected towers layer with distinct styling
        this.createSelectedTowersLayer(selectedData);

        // Generate buffer layers for selected towers
        this.generateSelectedTowerBuffers(selectedData);
    }

    private createSelectedTowersLayer(data: any) {
        if (!this.selectedLayerGroup) return;

        // Create custom icon for selected towers (gold/yellow to distinguish)
        const createSelectedTowerIcon = (): L.DivIcon => {
            const svgString = `
                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <!-- Larger marker background with gold color -->
                    <path d="M18 2C11.925 2 7 6.925 7 13c0 8.1 11 21 11 21s11-12.9 11-21c0-6.075-4.925-11-11-11z" 
                          fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
                    
                    <!-- WiFi tower icon -->
                    <g transform="translate(18,13)">
                        <!-- Tower base -->
                        <rect x="-1.5" y="2" width="3" height="7" fill="white"/>
                        
                        <!-- WiFi signal arcs -->
                        <path d="M-7,-3 A9,9 0 0,1 7,-3" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
                        <path d="M-5,-1.5 A6,6 0 0,1 5,-1.5" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
                        <path d="M-3,0 A3.5,3.5 0 0,1 3,0" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
                        
                        <!-- Center dot -->
                        <circle cx="0" cy="1.5" r="1.5" fill="white"/>
                        
                        <!-- Selection star -->
                        <path d="M0,-6 L1.5,-2 L6,-2 L2.5,1 L4,5 L0,2.5 L-4,5 L-2.5,1 L-6,-2 L-1.5,-2 Z" 
                              fill="#FFD700" stroke="white" stroke-width="0.5" opacity="0.8"/>
                    </g>
                </svg>
            `;

            return L.divIcon({
                html: svgString,
                className: 'custom-selected-tower-icon',
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            });
        };

        // Process each selected tower
        data.features.forEach((feature: any) => {
            const [lng, lat] = feature.geometry.coordinates;
            const towerId = `tower_${lat}_${lng}`;
            const selectedTower = this.selectedTowers.get(towerId);

            if (selectedTower) {
                const selectedIcon = createSelectedTowerIcon();
                const marker = L.marker([lat, lng], { icon: selectedIcon });

                // Use ES6 import instead of require
                const popupHTML = createTowerPopupHTML(
                    feature.properties,
                    selectedTower.companyName,
                    'Selected Towers',
                    -1, // Use -1 to indicate this is a selected tower
                    true // isSelected = true
                );

                marker.bindPopup(popupHTML, {
                    maxWidth: 400,
                    className: 'tower-popup selected-tower-popup'
                });

                this.selectedLayerGroup!.addLayer(marker);
            }
        });
    }

    private generateSelectedTowerBuffers(data: any) {
        // Generate buffers for the selected towers layer using the frontend buffer manager
        const buffers = frontendBufferManager.generateBuffersFromTowerData(
            data,
            -1, // Use -1 as the layer ID for selected towers
            'Selected Towers',
            'Selected' // Use 'Selected' as company name for consistent styling
        );

        console.log(`Generated ${buffers.length} buffer layers for selected towers`);
    }

    private notifySelectionChange() {
        if (this.onSelectionChangeCallback) {
            this.onSelectionChangeCallback(this.getSelectedTowers());
        }
    }

    cleanup() {
        if (this.mapRef && this.selectedLayerGroup) {
            this.mapRef.removeLayer(this.selectedLayerGroup);
        }
        this.selectedTowers.clear();
        this.selectedLayerGroup = null;
        this.mapRef = null;
    }
}

// Create a singleton instance
export const selectedTowersManager = new SelectedTowersManager();