
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBR1K_4BpG9yzGst0M_RN_QC9BgScW17f0",
  authDomain: "fitsroster.firebaseapp.com",
  projectId: "fitsroster",
  storageBucket: "fitsroster.firebasestorage.app",
  messagingSenderId: "956578983191",
  appId: "1:956578983191:web:e0c0281eafcc42adee5b52",
  measurementId: "G-BSSLD4HT4H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
