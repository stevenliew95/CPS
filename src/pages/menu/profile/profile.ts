import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { AuthenticatorService } from "../../../providers/authenticator";
import { Loader } from '../../../providers/loader';
import { User } from "../../../providers/user";
/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-profile',  
  templateUrl: 'profile.html'
})
export class ProfilePage {

  userFormBuilder: any;
  userDetails: User;

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loader: Loader,
    private alertCtrl: AlertController,
    private authenticatorService: AuthenticatorService
  ) {
    let uid = authenticatorService.getUser().uid;
    this.userDetails = new User(uid);
  }

  ionViewWillLoad() {
    console.debug("prepare form control " + this.constructor.name);
    this.userFormBuilder = this.formBuilder.group({
      fullName: ['', Validators.required],
      stuid: ['', Validators.compose([Validators.required, Validators.minLength(10),Validators.pattern('[0-9]*')])]
    });
  }

  updateUserSettings() {
    console.debug("updating user details on firebase " + this.constructor.name);
    let fullName = this.userDetails.fullName;
    let stuid = this.userDetails.stuid;
    this.loader.show("Updating your settings...");
    this.userDetails.update({ fullName: fullName })
    this.userDetails.update({ stuid: stuid })
    .then((user) => {
        this.loader.hide();
        this.alertCtrl.create({
          title: 'Success',
          message: 'Details updated',
          buttons: [{ text: 'Ok' }]
        }).present();
    })
    .catch((e) => {
      this.loader.hide();
      console.error(`Password Login Failure:`, e)
      this.alertCtrl.create({
        title: 'Error',
        message: `Failed to update details.`,
        buttons: [{ text: 'Ok' }]
      }).present();
    });
  }

}
