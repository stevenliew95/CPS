import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParkPage } from './park';

@NgModule({
  declarations: [
    ParkPage,
  ],
  imports: [
    IonicPageModule.forChild(ParkPage),
  ],
})
export class ParkPageModule {}
