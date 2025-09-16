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

  // TODO: replace with your Firebase project settings.
  const firebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const thanksRef = collection(db, "thanks");

  const form = document.getElementById("thanks-form");
  const input = document.getElementById("thanks-input");
  const feedback = document.getElementById("feedback");
  const emptyState = document.getElementById("empty-state");
  const canvas = document.getElementById("word-cloud");

  const THANKS_TIMEOUT_MS = 2500;
  let feedbackTimer = null;

  const showFeedback = (message, isError = false) => {
    feedback.textContent = message;
    feedback.style.color = isError ? "#c53030" : "#2f855a";
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedback.textContent = "";
    }, THANKS_TIMEOUT_MS);
  };

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
    } catch (err) {
      console.error(err);
      showFeedback("Something went wrong. Please try again.", true);
    }
  });

  const renderWordCloud = (entries) => {
    if (!entries.length) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    const list = entries.map(({ text, count }) => [text, count]);
    WordCloud(canvas, {
      list,
      backgroundColor: "rgba(0,0,0,0)",
      color: () => "#343aeb",
      weightFactor: (size) => 16 + size * 8,
      maxRotation: 0,
      shuffle: true,
      rotateRatio: 0,
      drawOutOfBound: false,
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

    const entries = Array.from(aggregates.values()).sort(
      (a, b) => b.count - a.count
    );
    renderWordCloud(entries);
  });