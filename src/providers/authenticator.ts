import { Injectable } from '@angular/core';
import { Events } from "ionic-angular";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Facebook } from '@ionic-native/facebook'
import { GooglePlus } from '@ionic-native/google-plus'
import { TwitterConnect } from '@ionic-native/twitter-connect'
import { Loader } from './loader';
import { User } from './user';
import { Config } from '../app/config'
import * as firebase from 'firebase';

@Injectable()
export class AuthenticatorService {

  user: User;

  constructor(
    private events: Events,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private facebook: Facebook,
    private twitterConnect: TwitterConnect,
    private googlePlus: GooglePlus,
    private loader: Loader
  ) {}

  invalidateUser(): void {
    this.user = null;
  }

  // Set user in this singleton to be used thru the app
  setUser(user): void {
    this.user = new User(user.uid);
  }

  // Get user in this singleton to be used thru the app
  getUser(): User {
    return this.user;
  }

  anonymousUser(): Promise<any> {
    var promise = new Promise<any>((resolve, reject) => {
      this.loader.show("Logging as Anonymous");
      this.afAuth.auth.signInAnonymously()
      .then((user) => {
        let userRef = this.db.object('/users/' + user.uid);
        userRef.set({ provider: 'anonymous' });
        this.loader.hide();
        this.events.publish('user:login', user);
        resolve(user);
      })
      .catch(e => {
        this.loader.hide();
        console.error(`Anonymous Login Failure:`, e)
        reject(e);
      });
    });
    return promise;
  }

  // BROWSER MODE ON
  // Use this to enable oAuth in browser - eg ionic serve
  // ---------------------------------------------------------
  signInWithOAuthBrowserMode(provider: string): Promise<any> {
    var promise = new Promise<any>((resolve, reject) => {
      this.loader.show(`Logging with ${provider} (Browser Mode)`);
      this.afAuth.auth.signInWithPopup(this.resolveProvider(provider))
      .then((user) => {
        resolve(user);
        this.events.publish('user:login', user);
        this.loader.hide();
        this.saveUserDetails(user.user);
      })
      .catch(e => {
        this.loader.hide();
        console.error(`${provider} Login Failure:`, e)
        reject(e);
      });
    });
    return promise;
  }

  private resolveProvider(provider: string) {
    switch(provider) {
    case "Google":
      return new firebase.auth.GoogleAuthProvider()
    case "Facebook":
      return new firebase.auth.FacebookAuthProvider()
    case "Twitter":
      return new firebase.auth.TwitterAuthProvider()
    }
  }

  // BROWSER MODE OFF
  // oAuth using ionic-native plugins
  // Use this function instead of the one above to run this app on your phone
  signInWithOAuth(provider: string) {
    this.loader.show('Signin...');
    switch(provider) {
      case "Google":
        return this.googlePlus.login(
          {
            'scopes': '',
            'webClientId': Config.WEB_CLIENT_ID,
            'offline': true,
          }).then((result) => {
            let creds = firebase.auth.GoogleAuthProvider.credential(result.idToken);
            this.loader.hide();
            return this.oAuthWithCredential(provider, creds);
          })
          .catch((e) => {
            this.loader.hide();
            return Promise.reject(e);
          });
      case "Facebook":
        return this.facebook.login(["email"]).then((result) => {
          let creds = firebase.auth.FacebookAuthProvider.credential(result.authResponse.accessToken);
          this.loader.hide();
          return this.oAuthWithCredential(provider, creds);
        })
        .catch((e) => {
          this.loader.hide();
          if (e.errorMessage) {
            return Promise.reject(e.errorMessage);
          } else {
            return Promise.reject(e);
          }
        });
      case "Twitter":
        return this.twitterConnect.login().then((result) => {
          let creds = firebase.auth.TwitterAuthProvider.credential(result.token, result.secret);
          this.loader.hide();
          return this.oAuthWithCredential(provider, creds)
        })
        .catch((e) => {
          this.loader.hide();
          return Promise.reject(e);
        });
    }
  }

  // Perform login using user and password
  login(email: string, password: string) {
    var promise = new Promise<any>((resolve, reject) => {
      this.loader.show("Logging with the user/password");
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.loader.hide();
        this.events.publish('user:login', user);
        resolve(user);
      })
      .catch(e => {
        this.loader.hide();
        console.error(`Password Login Failure:`, e)
        reject(e);
      });
    });
    return promise;
  }

  // Reset password
  resetPassword(email) {
    var promise = new Promise<any>((resolve, reject) => {
      this.loader.show("Resetting your password");
      firebase.auth().sendPasswordResetEmail(email).
        then((result: any) => {
        this.loader.hide();
        this.events.publish('user:resetPassword', result);
        resolve();
      }).catch((e: any) => {
        this.loader.hide();
        reject(e);
      });
    });
    return promise;
  }

  private saveUserDetails(user: any): firebase.Promise<any> {
    let userRef = firebase.database().ref('users/' + user.uid)
    return userRef.once('value', (data) => {
      if (!data.val()) {
        return userRef.set({
          provider: user.providerData[0].providerId,
          fullName: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          
          
        });
      } else {
        return userRef.update({
          email: user.email,
          avatar: user.photoURL,
        });
      }
    });
  }

  // Signin with credentials
  private oAuthWithCredential(provider: string, creds: firebase.auth.AuthCredential): Promise<any> {
    var promise = new Promise<any>((resolve, reject) => {
      this.loader.show('oAuth login...');
      this.afAuth.auth.signInWithCredential(creds)
      .then((user) => {
        this.saveUserDetails(user);
        this.events.publish('user:login', user);
        this.loader.hide();
        resolve(user);
      })
      .catch(e => {
        this.loader.hide();
        console.error(`${provider} Login Failure:`, e)
        reject(e);
      });
    });
    return promise;
  }
}
