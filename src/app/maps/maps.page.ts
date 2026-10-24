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
        this.map = L.map('map').setView(
          [-7.7956, 110.3695],
          13
        );

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
    const points: any =
      await this.dataService.getPoints();

    for (const key in points) {

      if (points.hasOwnProperty(key)) {

        const point = points[key];

        const coordinates = point.coordinates
          .split(',')
          .map((c: string) => parseFloat(c));

        const marker = L.marker(
          coordinates as L.LatLngExpression
        ).addTo(this.map);

        marker.bindPopup(`
          <div
            style="
              min-width: 145px;
              text-align: center;
              padding: 2px 2px 1px 2px;
              font-family: Arial, sans-serif;
            "
          >

            <!-- Nama point -->
            <div
              style="
                font-size: 14px;
                font-weight: 600;
                color: #333333;
                margin-bottom: 11px;
                line-height: 18px;
              "
            >
              ${point.name}
            </div>

            <!-- Tombol Edit dan Delete -->
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
              "
            >

              <!-- EDIT -->
              <a
                href="/editpoint/${key}"
                title="Edit point"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;

                  padding: 5px 9px;

                  background: #fff8df;
                  border: 1px solid #efd98b;
                  border-radius: 8px;

                  color: #a97900;
                  font-size: 12px;
                  font-weight: 500;

                  text-decoration: none;
                  line-height: 16px;

                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "
              >

                <!-- Icon Edit -->
                <span
                  style="
                    width: 22px;
                    height: 22px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: #ffeaa7;
                    border-radius: 50%;
                  "
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a97900"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M12 20h9"
                    ></path>

                    <path
                      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
                    ></path>
                  </svg>
                </span>

                <span>Edit</span>

              </a>


              <!-- DELETE -->
              <a
                href="#"
                class="delete-link"
                data-key="${key}"
                title="Delete point"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;

                  padding: 5px 9px;

                  background: #fff1ef;
                  border: 1px solid #efb6b0;
                  border-radius: 8px;

                  color: #c65349;
                  font-size: 12px;
                  font-weight: 500;

                  text-decoration: none;
                  line-height: 16px;

                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "
              >

                <!-- Icon Delete -->
                <span
                  style="
                    width: 22px;
                    height: 22px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: #ffdeda;
                    border-radius: 50%;
                  "
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c65349"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline
                      points="3 6 5 6 21 6"
                    ></polyline>

                    <path
                      d="M19 6l-1 14H6L5 6"
                    ></path>

                    <path
                      d="M10 11v6"
                    ></path>

                    <path
                      d="M14 11v6"
                    ></path>

                    <path
                      d="M9 6V4h6v2"
                    ></path>
                  </svg>
                </span>

                <span>Delete</span>

              </a>

            </div>

          </div>
        `);
      }
    }

    this.map.on('popupopen', (e) => {

      const popup = e.popup;

      // Langkah 4: menjalankan deletePoint ketika link Delete diklik
      const deleteLink = popup.getElement()
        ?.querySelector<HTMLAnchorElement>('.delete-link');

      if (deleteLink) {

        deleteLink.addEventListener(
          'click',
          async (event) => {

            event.preventDefault();

            const key =
              deleteLink.dataset['key'];

            if (key) {

              await this.deletePoint(
                key,
                popup.getLatLng()
              );

              this.map.closePopup();
            }
          }
        );
      }
    });
  }

  // Langkah 3: menghapus data titik dari Firebase dan marker dari peta
  async deletePoint(
    key: string,
    latLng?: L.LatLng
  ) {

    await this.dataService.deletePoint(key);

    if (latLng) {

      this.map.eachLayer((layer) => {

        if (layer instanceof L.Marker) {

          if (
            layer.getLatLng().equals(latLng)
          ) {

            this.map.removeLayer(layer);
          }
        }
      });
    }
  }

}
