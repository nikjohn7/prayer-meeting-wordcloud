import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMuXqYfxJ_hR9jDh-qDDRIrHnJya1k-dc",
  authDomain: "gcb-prayer.firebaseapp.com",
  projectId: "gcb-prayer",
  storageBucket: "gcb-prayer.firebasestorage.app",
  messagingSenderId: "836560759878",
  appId: "1:836560759878:web:6b28043c4863236ba9ae47",
  measurementId: "G-VJ6NNBFBN8"
};



const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const thanksRef = collection(db, "thanks");

const form = document.getElementById("thanks-form");
const input = document.getElementById("thanks-input");
const feedback = document.getElementById("feedback");
const emptyState = document.getElementById("empty-state");
const canvas = document.getElementById("word-cloud");
const stageForm = document.getElementById("stage-form");
const stageCloud = document.getElementById("stage-cloud");
const addMoreBtn = document.getElementById("add-more");

const THANKS_TIMEOUT_MS = 2500;
let feedbackTimer = null;
let latestEntries = [];

const showFeedback = (message, isError = false) => {
  feedback.textContent = message;
  feedback.style.color = isError ? "#c53030" : "#2f855a";
  clearTimeout(feedbackTimer);
  if (!message) return;
  feedbackTimer = setTimeout(() => {
    feedback.textContent = "";
  }, THANKS_TIMEOUT_MS);
};

const showStage = (stage) => {
  if (stage === "form") {
    stageCloud.hidden = true;
    stageForm.hidden = false;
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
  } else {
    stageForm.hidden = true;
    stageCloud.hidden = false;
    requestAnimationFrame(() => renderWordCloud(latestEntries));
  }
};

const colorPalette = [
  "#4f46e5",
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#ef4444",
];

addMoreBtn.addEventListener("click", () => {
  showFeedback("");
  showStage("form");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawText = (input.value || "").trim();
  if (!rawText) return;

  const normalized = rawText.toLowerCase();
  try {
    await addDoc(thanksRef, {
      text: rawText,
      normalized,
      createdAt: serverTimestamp(),
    });
    input.value = "";
    showFeedback("Thank you for sharing!");
    showStage("cloud");
  } catch (err) {
    console.error(err);
    showFeedback("Something went wrong. Please try again.", true);
  }
});

const renderWordCloud = (entries) => {
  if (stageCloud.hidden) {
    return;
  }

  if (!entries.length) {
    emptyState.style.display = "grid";
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  emptyState.style.display = "none";
  const wrapperRect = canvas.parentElement.getBoundingClientRect();
  const targetWidth = Math.max(wrapperRect.width, 360);
  const computedHeight = parseFloat(getComputedStyle(canvas).height) || 380;
  canvas.width = targetWidth;
  canvas.height = computedHeight;

  const list = entries.map(({ text, count }) => [text, count]);
  WordCloud(canvas, {
    list,
    backgroundColor: "rgba(0,0,0,0)",
    color: () => colorPalette[Math.floor(Math.random() * colorPalette.length)],
    weightFactor: (size) => 16 + size * 9,
    maxRotation: 0,
    shuffle: true,
    rotateRatio: 0,
    drawOutOfBound: false,
    clearCanvas: true,
  });
};

const thanksQuery = query(thanksRef, orderBy("createdAt", "asc"));
onSnapshot(thanksQuery, (snapshot) => {
  const aggregates = new Map();

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data?.normalized) return;
    const current = aggregates.get(data.normalized) || {
      text: data.text,
      count: 0,
    };
    current.count += 1;
    aggregates.set(data.normalized, current);
  });

  latestEntries = Array.from(aggregates.values()).sort(
    (a, b) => b.count - a.count
  );
  renderWordCloud(latestEntries);
});

window.addEventListener("resize", () => {
  if (!stageCloud.hidden && latestEntries.length) {
    renderWordCloud(latestEntries);
  }
});

showStage("form");
