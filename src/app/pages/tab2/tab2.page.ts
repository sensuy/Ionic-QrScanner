import { Component } from '@angular/core';
import { DataLocalService } from 'src/app/services/data-local.service';
import { Registro } from 'src/app/models/registro.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(
    public dataLocalService: DataLocalService,
  ) { }


  enviarCorreo() {
    this.dataLocalService.enviaCorreo();

  }

  abrirRegistro(registro: Registro) {
    console.log('Registro: ', registro);
    this.dataLocalService.abrirRegistro(registro);
  }

}
