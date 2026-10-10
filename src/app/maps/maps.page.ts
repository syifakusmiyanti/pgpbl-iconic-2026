import { Component, OnInit, inject } from '@angular/core';
import { DataService } from '../data.service';

import * as L from 'leaflet';


@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})

export class MapsPage implements OnInit {

  map!: L.Map;

  private dataService = inject(DataService);

  constructor() { }

  ngOnInit() {

    // Langkah 19: konfigurasi icon marker Leaflet
    const iconRetinaUrl = 'assets/icon/home_marker.png';
    const iconUrl = 'assets/icon/home_marker.png';

    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      iconSize: [41, 41],

      // titik koordinat berada di tengah bagian bawah icon
      iconAnchor: [20, 41],

      // posisi popup berada di atas marker
      popupAnchor: [0, -41],

      tooltipAnchor: [16, -28]
    });

    L.Marker.prototype.options.icon = iconDefault;

    if (!this.map) {

      setTimeout(() => {

        // Membuat peta
        this.map = L.map('map').setView([-7.7956, 110.3695], 13);

        // Menambahkan basemap OpenStreetMap
        var osm =
          L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              attribution: '&copy; OpenStreetMap contributors'
            }
          );

        osm.addTo(this.map);

        // Langkah 20: menambahkan marker
        L.marker([-7.7956, 110.3695])
          .addTo(this.map)
          .bindPopup('yogyakarta')
          .openPopup();

        this.loadPoints();

      });

    }
  }

  async loadPoints() {
    const points: any = await this.dataService.getPoints();

    for (const key in points) {
      if (points.hasOwnProperty(key)) {

        const point = points[key];

        const coordinates = point.coordinates
          .split(',')
          .map((c: string) => parseFloat(c));

        const marker = L.marker(
          coordinates as L.LatLngExpression
        ).addTo(this.map);

        marker.bindPopup(`${point.name}`);
      }
    }

    this.map.on('popupopen', (e) => {
      const popup = e.popup;
    });
  }

}
