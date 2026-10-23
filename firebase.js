// Firebase config - ATCB Oficial
const firebaseConfig = {
  apiKey: "AIzaSyACgB7wr_KUsNjXmks3-BQTD_srhX45Ew8",
  authDomain: "atcboficial-catalogo.firebaseapp.com",
  projectId: "atcboficial-catalogo",
  storageBucket: "atcboficial-catalogo.firebasestorage.app",
  messagingSenderId: "380899601633",
  appId: "1:380899601633:web:b816444058a1ce06ae5ba0",
  measurementId: "G-56CFQ2FMQL"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ---------- Helpers ----------
async function uploadImage(file, path) {
  const ref = storage.ref(path);
  await ref.put(file);
  return await ref.getDownloadURL();
}

async function deleteStorageFile(url) {
  if (!url || !url.includes('firebasestorage')) return;
  try {
    const ref = storage.refFromURL(url);
    await ref.delete();
  } catch (e) { /* ignore */ }
}

// ---------- Load all data from Firestore ----------
async function loadFromFirebase() {
  const [configSnap, productsSnap, gallerySnap] = await Promise.all([
    db.collection('config').doc('site').get(),
    db.collection('products').orderBy('id', 'desc').get(),
    db.collection('gallery').orderBy('id', 'desc').get()
  ]);

  if (!configSnap.exists) {
    // First run: seed initial data
    await seedInitialData();
    return loadFromFirebase();
  }

  const cfg = configSnap.data();
  const products = productsSnap.docs.map(d => ({ ...d.data(), _docId: d.id }));
  const gallery = gallerySnap.docs.map(d => ({ ...d.data(), _docId: d.id }));

  return {
    historia: cfg.historia || '',
    phone: cfg.phone || '',
    whatsapp: cfg.whatsapp || '',
    instagram: cfg.instagram || '',
    adminPass: cfg.adminPass || 'atcb2024',
    products,
    gallery
  };
}

async function seedInitialData() {
  // Config
  await db.collection('config').doc('site').set({
    historia: INITIAL_DATA.historia,
    phone: INITIAL_DATA.phone,
    whatsapp: INITIAL_DATA.whatsapp,
    instagram: INITIAL_DATA.instagram,
    adminPass: INITIAL_DATA.adminPass
  });

  // Products (use local images as URLs for seed - user should re-upload later)
  for (const p of INITIAL_DATA.products) {
    await db.collection('products').doc(String(p.id)).set({
      id: p.id,
      name: p.name,
      cat: p.cat,
      price: p.price || 0,
      desc: p.desc,
      img: p.img,
      available: p.available
    });
  }

  // Gallery
  for (const g of INITIAL_DATA.gallery) {
    await db.collection('gallery').doc(String(g.id)).set({
      id: g.id,
      desc: g.desc,
      img: g.img
    });
  }
}

// ---------- Save helpers ----------
async function saveConfigToFb(cfg) {
  await db.collection('config').doc('site').set({
    historia: cfg.historia,
    phone: cfg.phone,
    whatsapp: cfg.whatsapp,
    instagram: cfg.instagram,
    adminPass: cfg.adminPass
  }, { merge: true });
}

async function saveProductToFb(prod) {
  const docId = String(prod.id);
  await db.collection('products').doc(docId).set({
    id: prod.id,
    name: prod.name,
    cat: prod.cat,
    price: prod.price || 0,
    desc: prod.desc,
    img: prod.img,
    available: prod.available
  });
}

async function deleteProductFromFb(id, imgUrl) {
  await db.collection('products').doc(String(id)).delete();
  await deleteStorageFile(imgUrl);
}

async function saveGalleryItemToFb(item) {
  await db.collection('gallery').doc(String(item.id)).set({
    id: item.id,
    desc: item.desc,
    img: item.img
  });
}

async function deleteGalleryFromFb(id, imgUrl) {
  await db.collection('gallery').doc(String(id)).delete();
  await deleteStorageFile(imgUrl);
}
