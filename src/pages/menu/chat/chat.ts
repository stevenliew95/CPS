import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { NavController, Content } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthenticatorService } from "../../../providers/authenticator";
import { Loader } from '../../../providers/loader';
import { User } from "../../../providers/user";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
  @ViewChild(Content) content: Content;

  userDetails: User;
  chatControl: any;

  messages: FirebaseListObservable<any[]>;
  subscription: Subscription;
  message: string = '';

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    private loader: Loader,
    private formBuilder: FormBuilder,
    private authenticatorService: AuthenticatorService
  ) {
    // Get messages and join with user details
    this.messages = <FirebaseListObservable<any>> db.list('messages', {
      query: { limitToLast: 20, orderByKey: true }
    });
  }
    // xxxxxxx('/EntityNameInFirebase')
  sendMessage() {
    console.debug("sending message to chat " + this.constructor.name);
    this.db.list('/messages')
    .push({
      fullName: this.userDetails.fullName,
      provider: this.userDetails.provider,
      avatar: this.userDetails.avatar,
      userUid: this.userDetails.uid,
      value: this.message
    });
    this.message = '';
  }

  ionViewDidLoad() {
    this.subscription = this.messages.subscribe(() => {
      setTimeout(() => this.content.scrollToBottom(500), 250);
    });
  }

  ionViewWillLoad() {
    this.chatControl = this.formBuilder.group({
      message: ['', Validators.required]
    });
    this.userDetails = new User(this.authenticatorService.getUser().uid);
  }

  ionViewWillUnload() {
    this.subscription.unsubscribe();
  }

  logout() {
    this.afAuth.auth.signOut();
    this.navCtrl.pop();
  }
}
