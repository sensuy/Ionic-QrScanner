import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File as IonFile } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  public guardados: Registro[] = [];

  constructor(
    private storage: Storage,
    private navCtrl: NavController,
    private inAppBrowser: InAppBrowser,
    private file: IonFile,
    private emailComposer: EmailComposer
  ) {
    // cargar registros
    this.cargarStorage();
  }

  async cargarStorage() {
    this.guardados = await this.storage.get('registros') || [];
    console.log('getGuardadosFrom storage: ', this.guardados);

  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarStorage();
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    console.log('this.guardados: ', this.guardados);
    await this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
  }

  abrirRegistro(registro: Registro) {

    this.navCtrl.navigateForward('/tabs/tab2');

    switch (registro.type) {
      case 'http':
        this.inAppBrowser.create(registro.text, '_system');
        break;
      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;
      default:
        break;
    }
  }

  enviaCorreo() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrTemp.push(titulos);

    this.guardados.forEach(registro => {
      const linea = `${registro.type},${registro.format},${registro.created},${registro.text.replace(',', ' ')}\n`;

      arrTemp.push(linea);
    });

    this.crearArchivoFisico(arrTemp.join(''));

  }

  crearArchivoFisico(text: string) {
    this.file.checkFile(this.file.dataDirectory, 'registro.csv')
      .then(existe => {
        console.log('Existe archivo? ', existe);
        return this.escribirEnArchivo(text);
      })
      .catch(err => {
        console.log('err: ', err);
        return this.file.createFile(this.file.dataDirectory, 'registro.csv', false)
          .then(creado => {
            console.log('creado: ', creado);
            this.escribirEnArchivo(text);
          })
          .catch(err2 => {
            console.log('No se pudo crear el archivo: ', err2);
          });
      });
  }

  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, 'registro.csv', text);
    console.log('Archivo creado: ');

    console.log(this.file.dataDirectory + 'registro.csv');
    const archivo = `${this.file.dataDirectory}/registro.csv`;

    const email = {
      to: 'sensuijunior@hotmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo
      ],
      subject: 'Backup de scans',
      body: 'Aqui tienen sus backups de los scans - <strong>ScanApp</strong>',
      isHtml: true
    };

    // Send a text message using default options
    this.emailComposer.open(email)
      .then(resp => {
        console.log('resp: ', resp);
      });


  }
}
