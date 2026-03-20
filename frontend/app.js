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

const ML_URL = 'http://localhost:5000';
const BACKEND_URL = 'http://localhost:3000/api';

let currentUserId = localStorage.getItem('userId') || null;
let token = localStorage.getItem('token') || null;
let selectedSlot = null;

// Auth State Management
let currentRole = 'customer';

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

let mediaStream = null;

async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        videoElement.srcObject = mediaStream;
        videoElement.classList.remove('hidden');
        uploadOverlay.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        stopBtn.classList.remove('hidden');
        
        // Start MediaPipe if desired, or just show raw feed
        videoElement.play();
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
    uploadOverlay.classList.remove('hidden');
    captureBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');
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
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#d4af3733', lineWidth: 0.5});
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#d4af37', lineWidth: 1});
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
        uploadOverlay.classList.add('hidden');
        
        // Visualize on canvas
        const img = new Image();
        img.onload = () => {
            canvasElement.width = img.width;
            canvasElement.height = img.height;
            canvasCtx.drawImage(img, 0, 0);
        };
        img.src = base64Image;

        // Call ML Service
        try {
            const res = await axios.post(`${ML_URL}/detect-face`, { image: base64Image });
            displayResults(res.data);
        } catch (err) {
            console.error(err);
            alert("Error analyzing face.");
        }
    };
    reader.readAsDataURL(file);
});

function displayResults(data) {
    document.getElementById('detected-shape').innerText = data.shape;
    const stylesGrid = document.getElementById('styles-grid');
    stylesGrid.innerHTML = '';
    data.recommendations.forEach(style => {
        const div = document.createElement('div');
        div.className = 'glass p-4 rounded-xl text-center border border-amber-500/10 hover:border-amber-500/40 transition cursor-default';
        div.innerText = style;
        stylesGrid.appendChild(div);
    });
    document.getElementById('results-card').classList.remove('hidden');
    
    // Save to backend
    axios.put(`${BACKEND_URL}/users/profile`, {
        userId: currentUserId,
        faceShape: data.shape,
        preferences: data.recommendations
    });
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

