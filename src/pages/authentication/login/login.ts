import { Component } from '@angular/core';
import { ModalController, NavController, Platform } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthenticatorService } from "../../../providers/authenticator";
import { RegistrationPage } from '../registration/registration';
import { AlertController, Events } from 'ionic-angular';

/*
  Generated class for the Login page.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  userFormBuilder: any;

  constructor(
    private events: Events,
    public navCtrl: NavController,
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private platform: Platform,
    private authenticator: AuthenticatorService
  ) {
  }

  ionViewWillLoad() {
    this.userFormBuilder = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  doSomethingAfterUserLogin(user) {
    console.info('Do something after login :)');
  }

  // Anonymous user login
  anonymousUser() {
    this.authenticator.anonymousUser()
    .then((user) => {
      this.doSomethingAfterUserLogin(user);
    })
    .catch((e) => {
      let prompt = this.alertCtrl.create({
        title: 'Error',
        message: `Failed to login.`,
        buttons: [{ text: 'Ok' }]
      });
      prompt.present();
    });
  }

  signInWithOAuth(provider: string) {
    this.platform.is('cordova') ? this.authenticator.signInWithOAuth(provider) : this.authenticator.signInWithOAuthBrowserMode(provider)
    .then((user) => {
      this.doSomethingAfterUserLogin(user);
    })
    .catch((e) => {
      let prompt = this.alertCtrl.create({
        title: 'Error',
        message: `Failed to login`,
        buttons: [{ text: 'Ok' }]
      });
      prompt.present();
    });
  }

  // Perform login using user and password
  login() {
    let email = this.userFormBuilder.controls.email.value;
    let password = this.userFormBuilder.controls.password.value;
    this.authenticator.login(email, password)
    .then((user) => {
      this.doSomethingAfterUserLogin(user);
    })
    .catch((e) => {
      this.alertCtrl.create({
        title: 'Error',
        message: `Make sure your password is entered correctly.`,
        buttons: [{ text: 'Ok' }]
      }).present();
    });
  }

  // Push registration view
  signUp() {
    this.navCtrl.push(RegistrationPage);
  }

  // Reset password
  resetPassword() {
    this.alertCtrl.create({
      title: 'Reset your password',
      message: "Enter your email so we can send you a link to reset your password",
      inputs: [ { type: 'email', name: 'email', placeholder: 'Email' } ],
      buttons: [
        { text: 'Cancel', handler: data => {} },
        {
          text: 'Done',
          handler: data => {
            this.authenticator.resetPassword(data.email)
            .then(() => {
              this.alertCtrl.create({
                title: 'Success',
                message: 'Your password has been reset - Please check your email for further instructions.',
                buttons: [{ text: 'Ok' }]
              }).present();
            })
            .catch((e) => {
              this.alertCtrl.create({
                title: 'Error',
                message: `Make sure your email address is typed correctly.`,
                buttons: [{ text: 'Ok' }]
              }).present();
            });
          }
        }
      ]
    }).present();
  }

}
