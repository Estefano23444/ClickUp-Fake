import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, get } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCooj7m5bSBa-3y6z7VKrX25s5eDJtJBS0",
  authDomain: "clickup-fake.firebaseapp.com",
  databaseURL: "https://clickup-fake-default-rtdb.firebaseio.com",
  projectId: "clickup-fake",
  storageBucket: "clickup-fake.firebasestorage.app",
  messagingSenderId: "95326813566",
  appId: "1:95326813566:web:b8d377ceaee3ecd8e5872f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'clickup-fake/notes');

// Exposed on window (not `const X = ...`) so the classic, non-module scripts
// that load after this one (store.js etc.) can read it as a real global.
window.RemoteSync = {
  subscribe(callback) {
    onValue(notesRef, (snapshot) => {
      callback(snapshot.val() || {});
    }, (error) => {
      console.warn('RemoteSync subscribe error:', error.message);
    });
  },
  setNote(id, note) {
    set(ref(db, 'clickup-fake/notes/' + id), note).catch((err) => {
      console.warn('RemoteSync setNote failed:', err.message);
    });
  },
  removeNote(id) {
    remove(ref(db, 'clickup-fake/notes/' + id)).catch((err) => {
      console.warn('RemoteSync removeNote failed:', err.message);
    });
  },
  // Only writes the initial dataset if the shared database is still empty,
  // so the first person to ever open the page seeds it for everyone else
  // without repeatedly clobbering real edits on later loads.
  seedIfEmpty(notesById) {
    get(notesRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(notesRef, notesById).catch((err) => {
          console.warn('RemoteSync seed failed:', err.message);
        });
      }
    }).catch((err) => {
      console.warn('RemoteSync seed check failed:', err.message);
    });
  }
};
