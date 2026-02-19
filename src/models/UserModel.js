export class UserModel {
  constructor(uid, displayName, email, photoURL) {
    this.uid = uid;
    this.displayName = displayName;
    this.email = email;
    this.photoURL = photoURL;
  }

  static fromFirebaseUser(firebaseUser) {
    return new UserModel(
      firebaseUser.uid,
      firebaseUser.displayName,
      firebaseUser.email,
      firebaseUser.photoURL,
    );
  }
}