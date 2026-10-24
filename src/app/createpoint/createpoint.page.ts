import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';

// Ikon marker custom
const iconUrl = 'assets/icon/home_marker.png';

const iconDefault = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit, OnDestroy {

  name = '';
  coordinates = '';
  description = '';

  map!: L.Map;
  marker!: L.Marker;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private dataService: DataService
  ) { }

  ngOnInit() {
    // Membuat peta setelah halaman selesai dirender
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  // Membuat peta
  initMap() {

    // Hindari peta dibuat dua kali
    if (this.map) {
      this.map.remove();
    }

    // Posisi awal peta
    const defaultLat = -7.7956;
    const defaultLng = 110.3695;

    this.map = L.map('mapcreate').setView(
      [defaultLat, defaultLng],
      15
    );

    // Basemap OpenStreetMap
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    ).addTo(this.map);

    // Marker awal
    this.marker = L.marker(
      [defaultLat, defaultLng],
      {
        draggable: true,
        icon: iconDefault
      }
    ).addTo(this.map);

    // Koordinat awal
    this.coordinates =
      `${defaultLat.toFixed(9)},${defaultLng.toFixed(9)}`;

    // Update koordinat ketika marker digeser
    this.marker.on('dragend', () => {

      const position = this.marker.getLatLng();

      this.coordinates =
        `${position.lat.toFixed(9)},${position.lng.toFixed(9)}`;

      console.log(
        'Koordinat baru:',
        this.coordinates
      );
    });

    // Perbarui ukuran peta
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  // Validasi format latitude,longitude
  private parseCoordinates(
    value: string
  ): { lat: number; lng: number } | null {

    if (!value || typeof value !== 'string') {
      return null;
    }

    const parts = value.split(',');

    if (parts.length !== 2) {
      return null;
    }

    const lat = Number(parts[0].trim());
    const lng = Number(parts[1].trim());

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    return {
      lat,
      lng
    };
  }

  // Menyimpan point baru ke Firebase
  async save() {

    // Validasi nama
    if (!this.name.trim()) {
      await this.showAlert(
        'Data Belum Lengkap',
        'Nama point wajib diisi.'
      );
      return;
    }

    // Validasi koordinat
    if (!this.coordinates.trim()) {
      await this.showAlert(
        'Data Belum Lengkap',
        'Koordinat point wajib diisi.'
      );
      return;
    }

    // Validasi koordinat
    const coords = this.parseCoordinates(
      this.coordinates
    );

    if (!coords) {
      await this.showAlert(
        'Koordinat Tidak Valid',
        'Gunakan format latitude,longitude. Contoh: -7.7956,110.3695'
      );
      return;
    }

    try {

      // Menyimpan point BARU ke Firebase
      await this.dataService.savePoint({
        name: this.name.trim(),
        coordinates: `${coords.lat},${coords.lng}`,
        description: this.description.trim()
      });

      console.log(
        'Point baru berhasil disimpan.'
      );

      await this.showAlert(
        'Berhasil',
        'Point berhasil ditambahkan.'
      );

      // Kembali ke halaman Maps
      this.navCtrl.navigateBack(['/tabs/maps']);

    } catch (error: any) {

      console.error(
        'Gagal menyimpan point:',
        error
      );

      await this.showAlert(
        'Save Failed',
        error?.message ||
        'Gagal menyimpan point ke Firebase.'
      );
    }
  }

  // Menampilkan alert
  private async showAlert(
    header: string,
    message: string
  ) {

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Membersihkan peta ketika halaman ditutup
  ngOnDestroy() {

    if (this.map) {
      this.map.remove();
    }
  }
}
