import { Component, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="map-container"></div>
  `,
  styles: [`
    #map-container {
      height: 350px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      z-index: 1;
      border: 1px solid #eee;
    }
    ::ng-deep .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 5px;
    }
    ::ng-deep .leaflet-popup-tip {
      background: white;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() address: string = '';
  private map!: L.Map;
  private currentMarker: L.Marker | null = null;

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['address'] && this.address && this.map) {
      this.searchAddress();
    }
  }

  private initMap() {
    // Center of Almaty as default
    this.map = L.map('map-container', {
      zoomControl: true,
      fadeAnimation: true
    }).setView([43.2389, 76.8897], 13);

    // Premium Map Design: CartoDB Voyager
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Initial marker
    this.currentMarker = L.marker([43.2389, 76.8897]).addTo(this.map)
      .bindPopup('<b>OnlineShop Location</b><br>Our main office')
      .openPopup();
  }

  private async searchAddress() {
    try {
      // Real Geocoding restricted to Almaty
      const query = this.address.toLowerCase().includes('алматы') ? this.address : `${this.address}, Алматы`;
      const encodedAddr = encodeURIComponent(query);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddr}&limit=1`;

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const res = data[0];
        const lat = parseFloat(res.lat);
        const lon = parseFloat(res.lon);

        // Remove old marker
        if (this.currentMarker) {
          this.map.removeLayer(this.currentMarker);
        }

        // Move map smoothly
        this.map.flyTo([lat, lon], 17, {
          animate: true,
          duration: 1.5
        });

        // Add new marker
        this.currentMarker = L.marker([lat, lon]).addTo(this.map)
          .bindPopup(`<b>New Shop</b><br>${res.display_name}`)
          .openPopup();
      } else {
        console.warn('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }
}
