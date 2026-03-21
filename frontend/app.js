import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEYRDACSaEG63__aLzU-1_2V6EPqoOZw0",
  authDomain: "salononcall-8363e.firebaseapp.com",
  projectId: "salononcall-8363e",
  storageBucket: "salononcall-8363e.firebasestorage.app",
  messagingSenderId: "245983827313",
  appId: "1:245983827313:web:1059260132837e3d8212d0",
  measurementId: "G-H99Z0PFRQ8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Production-ready API Configuration
const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''; 
const ML_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://your-render-app.onrender.com';
let currentUserId = localStorage.getItem('userId');
let token = localStorage.getItem('token') || null;
let selectedSlot = null;

// Auth State Management
let currentRole = 'customer';
let selectedStyleName = '';

const HAIRSTYLES = [
  { id: 1, name: 'Low Fade', category: 'Fade Styles', length: 'Short Hair', desc: 'A clean and subtle taper popular in tech hubs like Bangalore and Hyderabad.', img: 'fade_haircut_1774081796857.png' },
  { id: 2, name: 'Mid Fade', category: 'Fade Styles', length: 'Short Hair', desc: 'The go-to balanced fade for young professionals across Mumbai and Delhi.', img: 'fade_haircut_1774081796857.png' },
  { id: 3, name: 'High Fade', category: 'Fade Styles', length: 'Short Hair', desc: 'A high-contrast, bold look frequently seen in the vibrant streets of Punjab.', img: 'fade_haircut_1774081796857.png' },
  { id: 4, name: 'Undercut', category: 'Medium Hair', length: 'Medium Hair', desc: 'Bollywood-inspired high contrast style with extreme volume on top.', img: 'undercut_1774081814079.png' },
  { id: 5, name: 'Crew Cut', category: 'Short Hair', length: 'Short Hair', desc: 'A practical, sharp cut favored by the Indian corporate and defense sectors.', img: 'crew_cut_1774081879205.png' },
  { id: 6, name: 'Buzz Cut', category: 'Short Hair', length: 'Short Hair', desc: 'The ultimate minimalist look, perfect for the intense Indian summers.', img: 'buzz_cut_1774081897036.png' },
  { id: 7, name: 'Pompadour', category: 'Medium Hair', length: 'Medium Hair', desc: 'A retro-modern classic seen at luxury weddings and elite clubs in India.', img: 'pompadour_haircut_1774081862472.png' },
  { id: 8, name: 'Quiff', category: 'Medium Hair', length: 'Medium Hair', desc: 'A stylish, voluminous hairstyle perfect for the contemporary Indian groom.', img: 'quiff_haircut_1774081844826.png' },
  { id: 9, name: 'Slick Back', category: 'Medium Hair', length: 'Medium Hair', desc: 'Sophisticated vintage style, a staple for the modern Indian gentleman.', img: 'undercut_1774081814079.png' },
  { id: 10, name: 'Taper Cut', category: 'Fade Styles', length: 'Short Hair', desc: 'A smooth gradient cut that is the backbone of Indian barbering excellence.', img: 'fade_haircut_1774081796857.png' },
  { id: 11, name: 'Textured Crop', category: 'Short Hair', length: 'Short Hair', desc: 'An edgy, urban style widely popular among college students in Pune and Chennai.', img: 'textured_crop_1774081913160.png' },
  { id: 12, name: 'Side Part', category: 'Short Hair', length: 'Short Hair', desc: 'The definitive formal haircut for every Indian professional.', img: 'side_part_haircut_1774081930647.png' },
  { id: 13, name: 'Spiky Hair', category: 'Short Hair', length: 'Short Hair', desc: 'An energetic, youthful classic that remains a favorite in every Indian neighborhood.', img: 'textured_crop_1774081913160.png' },
  { id: 14, name: 'Man Bun', category: 'Long Hair', length: 'Long Hair', desc: 'A rugged, artistic look popular in the creative circles of Kolkata and Goa.', img: 'side_part_haircut_1774081930647.png' },
  { id: 15, name: 'Faux Hawk', category: 'Medium Hair', length: 'Medium Hair', desc: 'A bold, stylish alternative to the mohawk, trendy in Indian music and sports.', img: 'quiff_haircut_1774081844826.png' },
  { id: 16, name: 'Caesar Cut', category: 'Short Hair', length: 'Short Hair', desc: 'A neat, horizontal fringe look becoming increasingly popular in North India.', img: 'crew_cut_1774081879205.png' },
  { id: 17, name: 'Fringe Cut', category: 'Medium Hair', length: 'Medium Hair', desc: 'A soft, textured front-focused style perfect for the modern K-pop trend in India.', img: 'quiff_haircut_1774081844826.png' },
  { id: 18, name: 'Burst Fade', category: 'Fade Styles', length: 'Short Hair', desc: 'A unique circular ear fade, a top choice for sports enthusiasts in India.', img: 'fade_haircut_1774081796857.png' },
  { id: 19, name: 'Top Knot', category: 'Long Hair', length: 'Long Hair', desc: 'A high-fashion variant of the man bun, often seen in the Indian modeling industry.', img: 'undercut_1774081814079.png' },
  { id: 20, name: 'Layered Cut', category: 'Medium Hair', length: 'Medium Hair', desc: 'Natural movement and volume, ideal for the diverse texture of Indian hair.', img: 'quiff_haircut_1774081844826.png' }
];

function updateAuthState(firebaseUser) {
    const userDisplay = document.getElementById('user-display');
    const authBtn = document.getElementById('nav-auth-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const dashBtn = document.getElementById('nav-dashboard-btn');
    const role = localStorage.getItem('userRole');

    if (firebaseUser) {
        userDisplay.innerText = localStorage.getItem('userName') || firebaseUser.email;
        userDisplay.classList.remove('hidden');
        authBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        if (role === 'barber') {
            dashBtn.classList.remove('hidden');
        } else {
            dashBtn.classList.add('hidden');
        }
    } else {
        userDisplay.classList.add('hidden');
        authBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        dashBtn.classList.add('hidden');
    }
}

// UI Toggles
function handleRoleChange() {
    const role = document.getElementById('reg-role').value;
    currentRole = role;
    const isBarber = role === 'barber';
    
    // Update labels in signup view
    document.querySelectorAll('.auth-role-label').forEach(el => el.innerText = isBarber ? 'Barber' : 'Customer');
    
    // Toggle role-specific fields
    document.getElementById('barber-fields').classList.toggle('hidden', !isBarber);
}

function switchRole(role) {
    // Legacy support if needed, but we use dropdown now
    document.getElementById('reg-role').value = role;
    handleRoleChange();
}

function toggleAuthForm(type) {
    const signin = document.getElementById('signin-container');
    const signup = document.getElementById('signup-container');
    
    if (type === 'signup') {
        signin.classList.add('opacity-0', '-translate-x-20');
        setTimeout(() => {
            signin.classList.add('hidden');
            signup.classList.remove('hidden');
            setTimeout(() => signup.classList.remove('opacity-0', 'translate-x-20'), 10);
        }, 500);
    } else {
        signup.classList.add('opacity-0', 'translate-x-20');
        setTimeout(() => {
            signup.classList.add('hidden');
            signin.classList.remove('hidden');
            setTimeout(() => signin.classList.remove('opacity-0', '-translate-x-20'), 10);
        }, 500);
    }
}

function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Unified Auth Action
async function handleAuth(action) {
    const loader = document.getElementById(`${action}-loader`);
    const btnText = document.getElementById(`${action}-text`);
    
    loader.classList.remove('hidden');
    btnText.classList.add('hidden');

    try {
        if (action === 'signin') {
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Fetch role from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userRole', userData.role);
                
                if (userData.role === 'barber') {
                    showSection('admin');
                } else {
                    showSection('home');
                }
            } else {
                showSection('home');
            }
        } else {
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save to Firestore
            const createdAt = new Date().toISOString();
            const userData = { name, email, role: currentRole, uid: user.uid, createdAt, isOnline: false };
            
            if (currentRole === 'barber') {
                userData.shopName = document.getElementById('reg-shop-name').value;
                userData.experience = document.getElementById('reg-experience').value;
                userData.location = document.getElementById('reg-location').value;
            }

            // Save to Firestore
            await setDoc(doc(db, "users", user.uid), userData);
            
            localStorage.setItem('userName', name);
            localStorage.setItem('userRole', currentRole);
            
            alert("Registration successful! Welcome to SalonOnCall.");
            if (currentRole === 'barber') {
                showSection('admin');
            } else {
                showSection('home');
            }
        }
    } catch (err) {
        console.error(err);
        let msg = "Authentication failed";
        if (err.code === 'auth/weak-password') msg = "Password is too weak.";
        if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
        if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = "Invalid email or password.";
        alert(msg);
    } finally {
        loader.classList.add('hidden');
        btnText.classList.remove('hidden');
    }
}

async function logout() {
    try {
        await signOut(auth);
        localStorage.clear();
        showSection('home');
    } catch (err) {
        console.error("Logout error", err);
    }
}

// Navigation
function showSection(id) {
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`${id}-section`);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Smooth scroll for anchors if in home section
    if (id === 'home' && window.location.hash) {
        const hashTarget = document.querySelector(window.location.hash);
        if (hashTarget) hashTarget.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (id === 'admin') loadBarberProfile();
    if (id === 'booking' || id === 'home') loadNearbyBarbers();
    if (id === 'booking') loadSlots();
}

// Scroll Animations & Navbar state
window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (window.scrollY > 50) {
        nav.classList.add('py-2', 'bg-black/90');
        nav.classList.remove('py-4', 'bg-transparent');
    } else {
        nav.classList.add('py-4', 'bg-transparent');
        nav.classList.remove('py-2', 'bg-black/90');
    }
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            // Ensure localStorage is synced if it was cleared or fresh login
            if (!localStorage.getItem('userName')) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    localStorage.setItem('userName', data.name);
                    localStorage.setItem('userRole', data.role);
                    if (data.role === 'barber') {
                        updateAvailabilityUI(data.isOnline);
                    }
                }
            }
            updateAuthState(user);
        } else {
            currentUserId = null;
            updateAuthState(null);
        }
        // Only show home if no specific section is active
        if (document.querySelector('main > section:not(.hidden)') === null) {
            showSection('home');
        }
    });
});

// Barber Specific Logic
async function loadBarberProfile() {
    if (!currentUserId) return;
    try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            document.getElementById('barber-welcome').innerText = `Welcome, ${data.name.split(' ')[0]}`;
            document.getElementById('barber-profile-name').innerText = data.name;
            document.getElementById('barber-profile-shop').innerText = `Shop: ${data.shopName || 'Not Set'}`;
            updateAvailabilityUI(data.isOnline);
        }
        loadAdminData(); // Load queue data
    } catch (err) {
        console.error("Error loading barber profile", err);
    }
}

async function toggleAvailability() {
    if (!currentUserId) return;
    const statusDot = document.getElementById('availability-status');
    const isCurrentlyOnline = statusDot.classList.contains('bg-green-500');
    const nextState = !isCurrentlyOnline;

    try {
        await setDoc(doc(db, "users", currentUserId), { isOnline: nextState }, { merge: true });
        updateAvailabilityUI(nextState);
    } catch (err) {
        alert("Failed to update status");
    }
}

function updateAvailabilityUI(isOnline) {
    const statusDot = document.getElementById('availability-status');
    const statusText = document.getElementById('availability-text');
    
    if (isOnline) {
        statusDot.className = 'w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
        statusText.innerText = 'Online';
        statusText.className = 'text-sm font-bold uppercase text-green-500';
    } else {
        statusDot.className = 'w-3 h-3 rounded-full bg-red-500';
        statusText.innerText = 'Offline';
        statusText.className = 'text-sm font-bold uppercase text-red-500';
    }
}

// Nearby Barbers Logic
async function loadNearbyBarbers() {
    const grid = document.getElementById('barbers-grid');
    if (!grid) return;

    try {
        const q = query(collection(db, "users"), where("role", "==", "barber"), where("isOnline", "==", true));
        const querySnapshot = await getDocs(q);
        
        grid.innerHTML = '';
        
        if (querySnapshot.empty) {
            grid.innerHTML = `
                <div class="col-span-full glass p-12 rounded-[2rem] border-white/5 text-center flex flex-col items-center justify-center h-64">
                    <p class="text-gray-500 italic mb-4">No barbers are currently online.</p>
                    <button onclick="loadNearbyBarbers()" class="text-amber-500 text-xs border border-amber-500/30 px-4 py-2 rounded-full hover:bg-amber-500/10 transition">Check Again</button>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((doc) => {
            const barber = doc.data();
            const card = document.createElement('div');
            card.className = 'glass p-8 rounded-[2rem] border-white/5 glow transition group hover:border-amber-500/30';
            card.innerHTML = `
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-xl">✂️</div>
                    <div>
                        <h4 class="font-bold text-lg">${barber.name}</h4>
                        <p class="text-xs text-amber-500 font-semibold uppercase tracking-widest">${barber.shopName || 'Expert Barber'}</p>
                    </div>
                </div>
                <div class="space-y-3 mb-8">
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>Experience</span>
                        <span class="text-white">${barber.experience || '5+'} Years</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>Location</span>
                        <span class="text-white">${barber.location || 'Downtown'}</span>
                    </div>
                </div>
                <button onclick="showSection('booking')" class="w-full glass py-3 rounded-xl text-sm font-bold border-white/10 group-hover:bg-amber-500 group-hover:text-black transition duration-300">Book Appointment</button>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading barbers", err);
    }
}

// Face Analysis with MediaPipe
const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const uploadOverlay = document.getElementById('upload-overlay');
const captureBtn = document.getElementById('capture-image-btn');
const stopBtn = document.getElementById('stop-camera-btn');
const initialOverlay = document.getElementById('initial-overlay');
const processingOverlay = document.getElementById('processing-overlay');
const metricPoints = document.getElementById('metric-points');
// metricLatency and metricConfidence are handled via latencyEl and confidenceEl if needed, 
// let's unify them to avoid confusion.
const metricLatency = document.getElementById('metric-latency');
const metricConfidence = document.getElementById('metric-confidence');
const resultsInline = document.getElementById('results-inline');

let mediaStream = null;
let activeAnalyzeTab = 'landmarks';

function switchAnalyzeTab(tab) {
    activeAnalyzeTab = tab;
    document.querySelectorAll('.tab-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(tab.toLowerCase().split(' ')[0]));
    });
}

async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        videoElement.srcObject = mediaStream;
        videoElement.classList.remove('hidden');
        if (initialOverlay) initialOverlay.classList.add('opacity-0', 'pointer-events-none');
        if (processingOverlay) processingOverlay.classList.remove('opacity-0');
        
        const cameraControls = document.getElementById('camera-controls');
        if (cameraControls) cameraControls.classList.remove('hidden');
        
        videoElement.play();
        
        // Start MediaPipe processing
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                const startTime = performance.now();
                await faceMesh.send({image: videoElement});
                const endTime = performance.now();
                if (metricLatency) metricLatency.innerText = `${Math.round(endTime - startTime)}ms`;
            },
            width: 1280,
            height: 720
        });
        camera.start();

    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure you have given permission.");
    }
}

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    videoElement.classList.add('hidden');
    if (initialOverlay) initialOverlay.classList.remove('opacity-0', 'pointer-events-none');
    if (processingOverlay) processingOverlay.classList.add('opacity-0');
    
    const cameraControls = document.getElementById('camera-controls');
    if (cameraControls) cameraControls.classList.add('hidden');
    
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

async function captureImage() {
    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Draw current frame
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    const base64Image = canvasElement.toDataURL('image/jpeg');
    
    // Stop camera immediately after capture
    stopCamera();
    
    // Send to ML Service
    try {
        const res = await axios.post(`${ML_URL}/detect-face`, { image: base64Image });
        displayResults(res.data);
    } catch (err) {
        console.error(err);
        alert("Error analyzing captured image.");
    }
}

const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
faceMesh.onResults(onResults);

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Set canvas size to match result image
    canvasElement.width = results.image.width;
    canvasElement.height = results.image.height;
    
    // Draw background (subtle video)
    canvasCtx.globalAlpha = 0.3;
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalAlpha = 1.0;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        if (metricPoints) metricPoints.innerText = landmarks.length;
        if (metricConfidence) {
            metricConfidence.innerText = 'High';
            metricConfidence.className = 'text-lg font-bold text-green-500';
        }

        // Draw enhanced high-tech mesh
        if (activeAnalyzeTab === 'landmarks' || activeAnalyzeTab === 'mesh') {
            drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#d4af3722', lineWidth: 0.5});
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#d4af3788', lineWidth: 1.5});
            
            // Draw glowing dots
            landmarks.forEach((pt, index) => {
                // Draw only a subset for "high-tech" look or all depending on tab
                if (index % 5 === 0 || activeAnalyzeTab === 'landmarks') {
                    canvasCtx.beginPath();
                    canvasCtx.arc(pt.x * canvasElement.width, pt.y * canvasElement.height, 1, 0, 2 * Math.PI);
                    canvasCtx.fillStyle = index % 10 === 0 ? '#fcf6ba' : '#d4af37';
                    canvasCtx.shadowBlur = 5;
                    canvasCtx.shadowColor = '#d4af37';
                    canvasCtx.fill();
                    canvasCtx.shadowBlur = 0;
                }
            });
        }
        
        if (activeAnalyzeTab === 'biometrics') {
            // Draw specific biometric lines (e.g., eye to eye, height)
            canvasCtx.strokeStyle = '#00f7ff';
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            const leftEye = landmarks[133];
            const rightEye = landmarks[362];
            canvasCtx.moveTo(leftEye.x * canvasElement.width, leftEye.y * canvasElement.height);
            canvasCtx.lineTo(rightEye.x * canvasElement.width, rightEye.y * canvasElement.height);
            canvasCtx.stroke();
            
            canvasCtx.fillStyle = '#00f7ff';
            canvasCtx.font = '10px Outfit';
            canvasCtx.fillText('Interpupillary: 64mm', leftEye.x * canvasElement.width, leftEye.y * canvasElement.height - 10);
        }
    } else {
        if (metricPoints) metricPoints.innerText = '0';
        if (metricConfidence) {
            metricConfidence.innerText = 'None';
            metricConfidence.className = 'text-lg font-bold text-red-500';
        }
    }
    canvasCtx.restore();
}

// MediaPipe Helper (simulated/imported via script tags)
function drawConnectors(ctx, landmarks, connections, style) {
    if (!landmarks) return;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    connections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        ctx.beginPath();
        ctx.moveTo(p1.x * canvasElement.width, p1.y * canvasElement.height);
        ctx.lineTo(p2.x * canvasElement.width, p2.y * canvasElement.height);
        ctx.stroke();
    });
}

// Handle Image Upload
document.getElementById('image-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Image = event.target.result;
        if (initialOverlay) initialOverlay.classList.add('opacity-0', 'pointer-events-none');
        if (processingOverlay) processingOverlay.classList.remove('opacity-0');
        
        // Visualize on canvas
        const img = new Image();
        img.onload = async () => {
            canvasElement.width = img.width;
            canvasElement.height = img.height;
            canvasCtx.drawImage(img, 0, 0);
            
            // Call ML Service with standardized endpoint
            try {
                const response = await axios.post(`${ML_URL}/api/analyze-face`, { image: base64Image });
                const data = response.data;
                
                if (data.success) {
                    // Update UI with face analysis data
                    displayResults(data.data.shape_info);
                    
                    // Update Metrics
                    if (metricPoints) metricPoints.innerText = data.metrics.points_tracked;
                    if (metricLatency) metricLatency.innerText = data.metrics.processing_latency_ms + 'ms';
                    if (metricConfidence) {
                        metricConfidence.innerText = data.metrics.face_confidence;
                        metricConfidence.className = `text-lg font-bold ${data.metrics.face_confidence === 'High' ? 'text-green-500' : 'text-amber-500'}`;
                    }
                } else {
                    alert("Analysis issue: " + (data.error || "Please try again with a clearer photo."));
                }
            } catch (err) {
                console.error("API Error:", err);
                alert("The AI service is currently unavailable. Please check the backend connection.");
            } finally {
                if (processingOverlay) processingOverlay.classList.add('opacity-0');
            }
        };
        img.src = base64Image;
    };
    reader.readAsDataURL(file);
});

async function displayResults(data) {
    if (!data) return;

    const shapeEl = document.getElementById('detected-shape');
    const homeShapeEl = document.getElementById('home-detected-shape');
    const homeRecommendations = document.getElementById('ai-recommendations-home');
    const homeGrid = document.getElementById('home-recommendations-grid');

    if (shapeEl) {
        shapeEl.innerText = data.shape;
        shapeEl.classList.add('fade-in');
    }
    
    if (homeShapeEl) homeShapeEl.innerText = data.shape;

    const stylesGrid = document.getElementById('styles-grid');
    if (stylesGrid) {
        stylesGrid.innerHTML = '';
        data.recommendations.forEach((style, index) => {
            const div = document.createElement('div');
            div.className = 'glass p-4 rounded-xl text-center border border-amber-500/10 hover:border-amber-500/40 transition cursor-default shadow-lg text-[10px] font-bold uppercase tracking-wider fade-in';
            div.style.animationDelay = `${index * 0.1}s`;
            div.innerText = style;
            stylesGrid.appendChild(div);
        });
    }

    const resultsInline = document.getElementById('results-inline');
    if (resultsInline) {
        resultsInline.classList.remove('hidden');
        resultsInline.classList.add('fade-in');
    }

    // Enrich recommendations with real data and display at top of Home
    if (homeRecommendations && homeGrid) {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/haircuts`);
            const allHaircuts = response.data;
            
            homeGrid.innerHTML = '';
            homeRecommendations.classList.remove('hidden');
            
            // Filter haircuts that match the AI recommendations
            const matches = allHaircuts.filter(h => 
                data.recommendations.some(rec => h.name.toLowerCase().includes(rec.toLowerCase()) || rec.toLowerCase().includes(h.name.toLowerCase()))
            );

            // If no direct matches, use first few recommendations as placeholders with sample data
            const finalStyles = matches.length > 0 ? matches : data.recommendations.map(name => ({
                name,
                price: 200,
                image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
                category: "AI Recommended"
            }));

            finalStyles.slice(0, 4).forEach((style, index) => {
                const card = document.createElement('div');
                card.className = 'premium-card fade-in';
                card.style.animationDelay = `${index * 0.2}s`;
                card.innerHTML = `
                    <div class="premium-badge">AI RECOMMENDED</div>
                    <div class="premium-img-container">
                        <img src="${style.image}" class="premium-img" alt="${style.name}">
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-white mb-2">${style.name}</h3>
                        <p class="text-xs text-amber-500 mb-4 font-bold uppercase">Perfect for ${data.shape} faces</p>
                        <div class="flex justify-between items-center mt-6">
                            <span class="price-tag">₹${style.price}</span>
                            <button onclick="showSection('booking'); selectedStyleName='${style.name}'" 
                                class="dark-btn px-6 py-2 rounded-xl text-[10px] font-bold">Book Now</button>
                        </div>
                    </div>
                `;
                homeGrid.appendChild(card);
            });
        } catch (err) {
            console.error("Enrichment error:", err);
        }
    }
    
    // Save to backend if user is logged in
    if (currentUserId) {
        axios.put(`${BACKEND_URL}/api/users/profile`, {
            userId: currentUserId,
            faceShape: data.shape,
            preferences: data.recommendations
        }).catch(e => console.error("Profile save error:", e));
    }
}

// Booking Stepper Logic
let currentBookingStep = 1;

function bookingNext(step) {
    if (step > currentBookingStep) {
        // Validation
        if (currentBookingStep === 1 && !document.getElementById('booking-date').value) {
            return alert("Please select a date first.");
        }
        if (currentBookingStep === 2 && !selectedSlot) {
            return alert("Please choose a time slot.");
        }
        if (currentBookingStep === 3) {
            const name = document.getElementById('cust-name').value;
            const email = document.getElementById('cust-email').value;
            if (!name || !email) return alert("Name and Email are required.");
        }
    }

    // Hide all steps
    document.querySelectorAll('[id^="booking-step-"]').forEach(s => {
        s.classList.remove('step-active');
        s.classList.add('step-inactive');
    });

    // Show target step
    const nextStep = document.getElementById(`booking-step-${step}`);
    nextStep.classList.remove('step-inactive');
    nextStep.classList.add('step-active');

    // Update tracking bar and dots
    currentBookingStep = step;
    const progress = ((step - 1) / 3) * 100;
    document.getElementById('step-track').style.width = `${progress}%`;
    
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (i <= step) {
            dot.classList.add('border-amber-500/50', 'bg-black/50');
            dot.classList.remove('bg-zinc-900', 'border-white/5');
            dot.querySelector('svg').classList.add('text-amber-500');
            dot.querySelector('svg').classList.remove('text-gray-500');
        } else {
            dot.classList.remove('border-amber-500/50', 'bg-black/50');
            dot.classList.add('bg-zinc-900', 'border-white/5');
            dot.querySelector('svg').classList.remove('text-amber-500');
            dot.querySelector('svg').classList.add('text-gray-500');
        }
    }

    if (step === 4) updateSummary();
}

function updateSummary() {
    const rawDate = document.getElementById('booking-date').value;
    let formattedDate = 'Not Selected';
    if (rawDate) {
        const dateObj = new Date(rawDate);
        formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    document.getElementById('summary-date').innerText = formattedDate;
    document.getElementById('summary-time').innerText = selectedSlot || 'Not Selected';
    document.getElementById('summary-name').innerText = document.getElementById('cust-name').value || '-';
    document.getElementById('summary-contact').innerText = `${document.getElementById('cust-email').value || '-'} | ${document.getElementById('cust-phone').value || 'No phone'}`;
}

// Booking Logic
async function loadSlots() {
    const grid = document.getElementById('slots-grid');
    grid.innerHTML = '';
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    
    const day = new Date().getDay();
    
    for (const h of hours) {
        const card = document.createElement('div');
        const isBooked = Math.random() > 0.85; // Mock some booked slots
        
        // Call ML service for rush level
        let rushRes = { data: { best_time_to_visit: 'Normal' } };
        try {
            rushRes = await axios.post(`${ML_URL}/predict-rush`, { day, hour: parseInt(h.split(':')[0]) });
        } catch(e) {}

        const isBest = rushRes.data.best_time_to_visit === 'High';
        
        card.className = `slot-card glass p-4 rounded-2xl border border-white/5 cursor-pointer flex flex-col items-center justify-center relative ${isBooked ? 'booked' : 'hover:border-amber-500/50'}`;
        card.innerHTML = `
            <span class="text-xs text-gray-500 mb-1 uppercase tracking-tighter">${isBooked ? 'Busy' : 'Available'}</span>
            <span class="text-lg font-bold ${isBest ? 'text-amber-400' : ''}">${h}</span>
            ${isBest ? '<div class="absolute -top-2 -right-2 bg-amber-500 text-[8px] font-bold px-2 py-0.5 rounded-full text-black">BEST</div>' : ''}
        `;

        if (!isBooked) {
            card.onclick = () => {
                document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedSlot = h;
            };
        }
        grid.appendChild(card);
    }
}

document.getElementById('confirm-booking').onclick = async () => {
    const date = document.getElementById('booking-date').value;
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value;

    const loader = document.getElementById('booking-loader');
    const btnText = document.getElementById('confirm-text');
    
    loader.classList.remove('hidden');
    btnText.classList.add('hidden');

    try {
        await axios.post(`${BACKEND_URL}/bookings`, {
            userId: currentUserId,
            customerDetails: { name, email, phone },
            date,
            time: selectedSlot
        });
        
        // Success feedback
        document.getElementById('success-modal').classList.remove('hidden');
    } catch (err) {
        alert(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
        loader.classList.add('hidden');
        btnText.classList.remove('hidden');
    }
};

function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
    bookingNext(1);
    showSection('home');
    // Clear inputs
    document.getElementById('booking-date').value = '';
    document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
    selectedSlot = null;
}


// Admin Dashboard
async function loadAdminData() {
    try {
        const res = await axios.get(`${BACKEND_URL}/analytics`);
        document.getElementById('admin-revenue').innerText = `$${res.data.revenue}`;
        document.getElementById('admin-active').innerText = res.data.activeQueue.length;
        
        const tableBody = document.getElementById('queue-table-body');
        tableBody.innerHTML = '';
        res.data.activeQueue.forEach(b => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-white/5 text-sm hover:bg-white/5 transition';
            tr.innerHTML = `
                <td class="py-4 font-semibold">${b.userId?.name || 'Anonymous'}</td>
                <td class="py-4">${b.barberId?.name}</td>
                <td class="py-4 text-gray-500">${b.slot.date} ${b.slot.time}</td>
                <td class="py-4"><span class="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-xs">${b.status}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

// Hairstyle Gallery Functions
function openHairstyleGallery() {
    const modal = document.getElementById('hairstyle-gallery-modal');
    modal.classList.remove('hidden');
    renderHairstyles('All');
}

function closeHairstyleGallery() {
    document.getElementById('hairstyle-gallery-modal').classList.add('hidden');
}

function renderHairstyles(filter) {
    const grid = document.getElementById('hairstyle-grid');
    grid.innerHTML = '';
    
    const filtered = filter === 'All' ? HAIRSTYLES : HAIRSTYLES.filter(s => s.category === filter || s.length === filter);
    
    filtered.forEach(style => {
        const card = document.createElement('div');
        card.className = 'style-item-card fade-in';
        card.onclick = () => showStyleDetails(style.id);
        card.innerHTML = `
            <div class="overflow-hidden h-32">
                <img src="${style.img}" class="style-item-img" alt="${style.name}">
            </div>
            <div class="p-4 text-center">
                <h4 class="text-xs font-bold text-amber-500 mb-1">${style.name}</h4>
                <p class="text-[9px] text-gray-500 line-clamp-2">${style.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterHairstyles(category, btn) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    renderHairstyles(category);
}

function showStyleDetails(id) {
    const style = HAIRSTYLES.find(s => s.id === id);
    if (!style) return;
    
    document.getElementById('detail-img').src = style.img;
    document.getElementById('detail-name').innerText = style.name;
    document.getElementById('detail-category').innerText = style.category;
    document.getElementById('detail-desc').innerText = style.desc;
    
    selectedStyleName = style.name;
    document.getElementById('style-detail-modal').classList.remove('hidden');
}

function closeStyleDetails() {
    document.getElementById('style-detail-modal').classList.add('hidden');
}

function bookStyleFromDetail() {
    closeStyleDetails();
    closeHairstyleGallery();
    showSection('booking');
    
    // Auto-fill booking style
    if (selectedStyleName) {
        document.getElementById('booking-style-badge').classList.remove('hidden');
        document.getElementById('selected-style-display').innerText = selectedStyleName;
    }
}

function clearSelectedStyle() {
    selectedStyleName = '';
    document.getElementById('booking-style-badge').classList.add('hidden');
}

// Initial Navigation (Now handled in DOMContentLoaded)

// Mock Global Consts for MediaPipe
const FACEMESH_TESSELATION = []; // Shortened for focus
// Expose functions to global scope for HTML onclick handlers
window.switchRole = switchRole;
window.toggleAuthForm = toggleAuthForm;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleAuth = handleAuth;
window.logout = logout;
window.showSection = showSection;
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.captureImage = captureImage;
window.bookingNext = bookingNext;
window.closeSuccessModal = closeSuccessModal;
window.handleRoleChange = handleRoleChange;
window.toggleAvailability = toggleAvailability;
window.loadNearbyBarbers = loadNearbyBarbers;
window.switchAnalyzeTab = switchAnalyzeTab;
window.openHairstyleGallery = openHairstyleGallery;
window.closeHairstyleGallery = closeHairstyleGallery;
window.filterHairstyles = filterHairstyles;
window.showStyleDetails = showStyleDetails;
window.closeStyleDetails = closeStyleDetails;
window.bookStyleFromDetail = bookStyleFromDetail;
window.clearSelectedStyle = clearSelectedStyle;

// Premium Haircuts Integration
async function loadPremiumHaircuts() {
    const grid = document.getElementById('premium-haircuts-grid');
    const loading = document.getElementById('premium-haircuts-loading');
    const error = document.getElementById('premium-haircuts-error');
    
    if (!grid) return;

    // Reset UI
    grid.innerHTML = '';
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    
    // Smooth scroll to section
    document.getElementById('premium-haircuts-section').scrollIntoView({ behavior: 'smooth' });

    try {
        // Fetch from API with 1.5s delay to show off the smooth loading state
        const [response] = await Promise.all([
            axios.get(`${BACKEND_URL}/api/haircuts?category=Premium`),
            new Promise(resolve => setTimeout(resolve, 1200)) 
        ]);

        const haircuts = response.data;
        
        loading.classList.add('hidden');
        
        if (haircuts.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-10 text-center text-gray-500">No premium haircuts available at the moment.</div>';
            return;
        }

        haircuts.forEach((haircut, index) => {
            const card = document.createElement('div');
            card.className = 'premium-card fade-in';
            card.style.animationDelay = `${index * 0.15}s`;
            
            card.innerHTML = `
                <div class="premium-badge">NEW STYLE</div>
                <div class="premium-img-container">
                    <img src="${haircut.image}" class="premium-img" alt="${haircut.name}" loading="lazy">
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-white mb-1">${haircut.name}</h3>
                            <p class="text-xs text-amber-500 font-medium uppercase tracking-widest">${haircut.category}</p>
                        </div>
                        <div class="price-tag">₹${haircut.price}</div>
                    </div>
                    <p class="text-gray-500 text-sm mb-6 leading-relaxed">
                        Precision crafted style designed for a modern, premium aesthetic.
                    </p>
                    <button onclick="showSection('booking'); selectedStyleName='${haircut.name}'" 
                            class="w-full glass py-3 rounded-2xl text-xs font-bold border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all duration-300">
                        Book Now
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error("Fetch error:", err);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
    }
}

// Expose to window for onclick handlers
window.loadPremiumHaircuts = loadPremiumHaircuts;
window.showSection = showSection;
window.handleAuth = handleAuth;
window.toggleAuthForm = toggleAuthForm;
window.handleRoleChange = handleRoleChange;
window.togglePasswordVisibility = togglePasswordVisibility;
window.logout = logout;
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.captureImage = captureImage;
window.switchAnalyzeTab = switchAnalyzeTab;
window.bookingNext = bookingNext;
window.toggleAvailability = toggleAvailability;
window.loadNearbyBarbers = loadNearbyBarbers;
window.loadHaircuts = async function (category = 'All', el = null) {
    const container = document.getElementById("haircut-list");
    const loading = document.getElementById("premium-haircuts-loading");
    const error = document.getElementById("premium-haircuts-error");
    
    if (!container) return;

    // Update active filter chip
    if (el) {
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        el.classList.add('active');
    }

    // Reset UI and show skeletons
    error.classList.add("hidden");
    container.innerHTML = "";
    
    // Render 4 skeleton cards
    for (let i = 0; i < 4; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "netflix-card";
        skeleton.innerHTML = `
            <div class="netflix-img-container skeleton"></div>
            <div class="p-4 space-y-3">
                <div class="h-4 w-3/4 skeleton"></div>
                <div class="h-3 w-1/4 skeleton"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }

    try {
        // Fetch data
        const query = category !== 'All' ? `?category=${category}` : '';
        const [response] = await Promise.all([
            fetch(`${BACKEND_URL}/api/haircuts${query}`),
            new Promise(resolve => setTimeout(resolve, 800)) // Artificial delay for shimmer effect
        ]);

        if (!response.ok) throw new Error("API response error");
        
        const data = await response.json();
        container.innerHTML = ""; // Clear skeletons

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="col-span-full py-20 text-center text-gray-500 italic fade-in">No exclusive styles found in this category.</div>`;
            return;
        }

        data.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "netflix-card fade-in";
            card.style.animationDelay = `${index * 0.1}s`;
            
            const progressValue = 70 + Math.random() * 25;

            card.innerHTML = `
                <div class="netflix-badge">TRENDING</div>
                <div class="netflix-img-container">
                    <img src="${item.image}" class="netflix-img" alt="${item.name}" loading="lazy">
                    <div class="netflix-hover-overlay">
                        <button onclick="showSection('booking'); selectedStyleName='${item.name}'" 
                                class="gold-bg text-black w-full py-3 rounded-xl font-bold text-xs transform hover:scale-105 transition shadow-lg mb-4">
                            Book Now
                        </button>
                        <p class="text-[10px] text-white/60 text-center uppercase tracking-widest">Master Barber Quality</p>
                    </div>
                    <div class="netflix-play-overlay">
                        <div class="play-outer">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="netflix-progress-container">
                    <div class="netflix-progress-bar" style="width: ${progressValue}%"></div>
                </div>
                <div class="netflix-info">
                    <h3 class="netflix-title">${item.name}</h3>
                    <div class="flex justify-between items-center mt-2">
                        <div class="netflix-price">
                            <span class="text-xs">₹</span>${item.price}
                        </div>
                        <span class="text-[9px] text-white/30 uppercase tracking-widest font-bold">Details</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("LoadHaircuts Error:", err);
        container.innerHTML = "";
        error.classList.remove("hidden");
    }
}
