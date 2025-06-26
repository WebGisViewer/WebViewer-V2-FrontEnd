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

// Virtual layer info for Selected Towers
export interface SelectedTowersVirtualLayer {
    id: number;
    name: string;
    layer_type_name: string;
    is_visible: boolean;
    layerGroup: L.LayerGroup;
    featureCount: number;
    companyName: string;
}

export class SelectedTowersManager {
    private selectedTowers: Map<string, SelectedTower> = new Map();
    private selectedLayerGroup: L.LayerGroup | null = null;
    private mapRef: L.Map | null = null;
    private onSelectionChangeCallback: ((towers: SelectedTower[]) => void) | null = null;

    // Virtual layer for integration with LayerControl
    private selectedTowersVirtualLayer: SelectedTowersVirtualLayer | null = null;
    private onLayerUpdateCallback: ((layer: SelectedTowersVirtualLayer | null) => void) | null = null;

    constructor() {
        // Make this manager globally available
        (window as any).selectedTowersManager = this;
    }

    initialize(map: L.Map) {
        this.mapRef = map;
        this.selectedLayerGroup = L.layerGroup();

        // Initialize virtual layer for LayerControl integration
        this.selectedTowersVirtualLayer = {
            id: -1, // Special ID for selected towers
            name: 'Selected Towers',
            layer_type_name: 'Point Layer',
            is_visible: false,
            layerGroup: this.selectedLayerGroup,
            featureCount: 0,
            companyName: 'Selected'
        };
    }

    onSelectionChange(callback: (towers: SelectedTower[]) => void) {
        this.onSelectionChangeCallback = callback;
    }

    onLayerUpdate(callback: (layer: SelectedTowersVirtualLayer | null) => void) {
        this.onLayerUpdateCallback = callback;
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
        this.notifyLayerUpdate();

        console.log(`Tower ${towerId} selected from ${layerName}`);
    }

    unselectTower(towerId: string) {
        this.selectedTowers.delete(towerId);
        this.updateSelectedLayer();
        this.notifySelectionChange();
        this.notifyLayerUpdate();

        console.log(`Tower ${towerId} unselected`);
    }

    isSelected(towerId: string): boolean {
        return this.selectedTowers.has(towerId);
    }

    getSelectedTowers(): SelectedTower[] {
        return Array.from(this.selectedTowers.values());
    }

    getSelectedTowersVirtualLayer(): SelectedTowersVirtualLayer | null {
        return this.selectedTowersVirtualLayer;
    }

    toggleSelectedLayerVisibility(isVisible: boolean) {
        if (!this.selectedTowersVirtualLayer || !this.mapRef || !this.selectedLayerGroup) return;

        this.selectedTowersVirtualLayer.is_visible = isVisible;

        if (isVisible && this.selectedTowers.size > 0) {
            if (!this.mapRef.hasLayer(this.selectedLayerGroup)) {
                this.mapRef.addLayer(this.selectedLayerGroup);
            }
        } else {
            if (this.mapRef.hasLayer(this.selectedLayerGroup)) {
                this.mapRef.removeLayer(this.selectedLayerGroup);
            }
        }

        this.notifyLayerUpdate();
    }

    clearAllSelections() {
        this.selectedTowers.clear();
        this.updateSelectedLayer();
        this.notifySelectionChange();
        this.notifyLayerUpdate();
    }

    private updateSelectedLayer() {
        if (!this.mapRef || !this.selectedLayerGroup || !this.selectedTowersVirtualLayer) return;

        // Clear existing selected layer
        this.selectedLayerGroup.clearLayers();

        if (this.selectedTowers.size === 0) {
            // Remove from map if no towers selected
            if (this.mapRef.hasLayer(this.selectedLayerGroup)) {
                this.mapRef.removeLayer(this.selectedLayerGroup);
            }
            this.selectedTowersVirtualLayer.featureCount = 0;
            this.selectedTowersVirtualLayer.is_visible = false;
            return;
        }

        // Update feature count
        this.selectedTowersVirtualLayer.featureCount = this.selectedTowers.size;

        // Add selected layer to map if visibility is enabled
        if (this.selectedTowersVirtualLayer.is_visible && !this.mapRef.hasLayer(this.selectedLayerGroup)) {
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
                        <path d="M-6,-2 A8,8 0 0,1 6,-2" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
                        <path d="M-4,-1 A5,5 0 0,1 4,-1" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
                        <path d="M-2,0 A2.5,2.5 0 0,1 2,0" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
                        
                        <!-- Center dot -->
                        <circle cx="0" cy="1" r="1" fill="white"/>
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

        if (data && data.features) {
            data.features.forEach((feature: any) => {
                if (feature.geometry?.type === 'Point') {
                    const [lng, lat] = feature.geometry.coordinates;
                    const marker = L.marker([lat, lng], {
                        icon: createSelectedTowerIcon()
                    });

                    // Find the original selected tower data
                    const selectedTower = Array.from(this.selectedTowers.values())
                        .find(tower => tower.coordinates[0] === lat && tower.coordinates[1] === lng);

                    if (selectedTower) {
                        const popupContent = createTowerPopupHTML(
                            feature.properties || {},
                            'Selected',
                            'Selected Towers',
                            -1,
                            true // isSelected = true
                        );
                        marker.bindPopup(popupContent);
                    }

                    this.selectedLayerGroup!.addLayer(marker);
                }
            });
        }
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

    private notifyLayerUpdate() {
        if (this.onLayerUpdateCallback) {
            this.onLayerUpdateCallback(this.selectedTowersVirtualLayer);
        }
    }
}

// Create global instance
export const selectedTowersManager = new SelectedTowersManager();