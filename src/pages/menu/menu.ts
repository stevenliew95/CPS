import { Component, ViewChild } from '@angular/core';
import { Nav } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { ChatPage } from './chat/chat';
import { ProfilePage } from './profile/profile';
import { LoginPage } from '../authentication/login/login';
import { StatusPage } from './status/status';
import { ParkPage } from './park/park';

@Component({
  templateUrl: 'menu.html'
})
export class Menu {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = StatusPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    private afAuth: AngularFireAuth
  ) {
    // Add your pages to be displayed in the menu
    this.pages = [
      { title: 'Profile', component: ProfilePage },
      { title: 'Status', component: StatusPage },
      { title: 'Park', component: ParkPage },
      { title: 'Chat', component: ChatPage }
    ];
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    this.afAuth.auth.signOut();
    this.nav.setRoot(LoginPage);
  }
}
