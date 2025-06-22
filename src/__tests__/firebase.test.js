import * as firebase from "../component/firebase";

test("firebase exports all required modules", () => {
    expect(firebase.auth).toBeDefined();
    expect(firebase.db).toBeDefined();
    expect(firebase.googleProvider).toBeDefined();
});
