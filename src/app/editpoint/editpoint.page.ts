import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';

// Ikon custom
const iconUrl = 'assets/icon/home_marker.png';

const iconDefault = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Semua L.marker otomatis pakai ikon ini, jadi marker-icon-2x.png & marker-shadow.png nggak diminta lagi
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage implements OnInit, OnDestroy {

  key = '';
  name = '';
  coordinates = '';

  map!: L.Map;
  marker!: L.Marker;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') || '';

    if (this.key) {
      this.loadPoint();
    } else {
      console.error('Key point tidak ditemukan di URL.');
    }
  }

  // Mengambil data point dari Firebase
  async loadPoint() {
    try {
      const data: any = await this.dataService.getPoint(this.key);

      console.log('Key point:', this.key);
      console.log('Data point:', data);

      if (!data) {
        await this.showAlert(
          'Data Tidak Ditemukan',
          'Point tidak ditemukan di Firebase.'
        );
        return;
      }

      this.name = data.name || '';
      this.coordinates = data.coordinates || '';

      // Tunggu elemen peta dirender
      setTimeout(() => {
        this.initMap();
      }, 300);

    } catch (error: any) {
      console.error('Gagal mengambil data:', error);

      await this.showAlert(
        'Load Failed',
        error?.message || 'Gagal mengambil data point.'
      );
    }
  }

  // Membuat peta dan marker
  initMap() {
    const coords = this.parseCoordinates(this.coordinates);

    if (!coords) {
      console.error(
        'Koordinat tidak valid:',
        this.coordinates
      );
      return;
    }

    // Hapus peta sebelumnya jika ada
    if (this.map) {
      this.map.remove();
    }

    // Inisialisasi peta
    this.map = L.map('mapedit').setView(
      [coords.lat, coords.lng],
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

    // Marker menggunakan home_marker.png
    this.marker = L.marker(
      [coords.lat, coords.lng],
      {
        draggable: true,
        icon: iconDefault
      }
    ).addTo(this.map);

    this.marker.bindPopup(this.name);

    // Update koordinat setelah marker digeser
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();

      this.coordinates =
        `${position.lat.toFixed(9)},${position.lng.toFixed(9)}`;

      console.log('Koordinat baru:', this.coordinates);
    });

    // Perbarui ukuran peta
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  // Validasi koordinat latitude,longitude
  private parseCoordinates(
    value: string
  ): { lat: number; lng: number } | null {
    if (!value) {
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

    return { lat, lng };
  }

  // Menyimpan perubahan ke Firebase
  async save() {
    if (!this.key) {
      await this.showAlert(
        'Save Failed',
        'Key point tidak ditemukan.'
      );
      return;
    }

    if (!this.name.trim() || !this.coordinates.trim()) {
      await this.showAlert(
        'Data Belum Lengkap',
        'Nama dan koordinat wajib diisi.'
      );
      return;
    }

    const coords = this.parseCoordinates(this.coordinates);

    if (!coords) {
      await this.showAlert(
        'Koordinat Tidak Valid',
        'Gunakan format latitude,longitude.'
      );
      return;
    }

    try {
      await this.dataService.updatePoint(this.key, {
        name: this.name.trim(),
        coordinates: `${coords.lat},${coords.lng}`
      });

      console.log('Point berhasil diperbarui.');

      this.navCtrl.navigateBack(['/tabs/maps']);

    } catch (error: any) {
      console.error('Gagal menyimpan point:', error);

      await this.showAlert(
        'Save Failed',
        error?.message || 'Gagal menyimpan perubahan.'
      );
    }
  }

  // Menampilkan pesan error
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

  // Membersihkan peta saat halaman ditutup
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
