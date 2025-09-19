import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL = "https://btpdbblbchfrlmqaysib.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cGRiYmxiY2hmcmxtcWF5c2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTAzNzYsImV4cCI6MjA3MzY4NjM3Nn0.tUpl7Lq3WrYOXE36b-pjWk86hAEK3Kdo2imnGAl2Oa8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let timerInterval;
let startTime;
let elapsed = 0;

const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resultPopup = document.getElementById("result-popup");
const finalTimeEl = document.getElementById("final-time");
const timeDiffEl = document.getElementById("time-diff");
const startScreen = document.getElementById("start-screen");
const registrationScreen = document.getElementById("registration-screen");
const gameScreen = document.getElementById("game-screen");
const startGameBtn = document.getElementById("start-game-btn");
const registrationForm = document.getElementById("registration-form");

const tryAgainBtn = document.getElementById("try-again-btn");
const saveProgressBtn = document.getElementById("save-progress-btn");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const leaderboardTable = document.getElementById("leaderboard-table").querySelector("tbody");
const backToGameBtn = document.getElementById("back-to-game-btn");
const toGameBtn = document.getElementById("to-game-btn"); 
const playAgainBtn = backToGameBtn;

let lastResult = { time: 0, diff: 0 };
const userData = localStorage.getItem("timerUser");
startGameBtn.addEventListener("click", () => {
  if (userData) {
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
  } else {
    startScreen.classList.add("hidden");
    registrationScreen.classList.remove("hidden");
  }
});
registrationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const country = document.getElementById("country").value.trim();
  const city = document.getElementById("city").value.trim();

  if (name && country && city) {
    localStorage.setItem("timerUser", JSON.stringify({ name, country, city }));
    registrationScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
  }
});

startBtn.addEventListener("click", () => {
  elapsed = 0;
  startTime = Date.now();
  startBtn.disabled = true;
  stopBtn.disabled = false;

  timerInterval = setInterval(() => {
    elapsed = (Date.now() - startTime) / 1000;
    timerDisplay.textContent = elapsed.toFixed(3) + "s";
  }, 10);
});

stopBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  stopBtn.disabled = true;

  const finalTime = elapsed;
  const diff = (finalTime - 3).toFixed(3);

  lastResult = { time: finalTime.toFixed(3), diff };

  setTimeout(() => {
    finalTimeEl.textContent = lastResult.time;
    timeDiffEl.textContent = lastResult.diff;
    resultPopup.classList.remove("hidden");
  }, 1500);
});

tryAgainBtn.addEventListener("click", () => {
  resultPopup.classList.add("hidden");
  startBtn.disabled = false;
  stopBtn.disabled = true;
  timerDisplay.textContent = "0.000s";
});
saveProgressBtn.addEventListener("click", async () => {
  const user = JSON.parse(localStorage.getItem("timerUser"));
  if (!user) return;

  const { data: existing } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("name", user.name)
    .eq("country", user.country)
    .eq("city", user.city)
    .single();

  if (existing) {
    await supabase
      .from("leaderboard")
      .update({ time: lastResult.time, diff: lastResult.diff })
      .eq("id", existing.id);
  } else {
    await supabase.from("leaderboard").insert([
      { name: user.name, country: user.country, city: user.city, time: lastResult.time, diff: lastResult.diff }
    ]);
  }

  showLeaderboard('play'); 
});
async function showLeaderboard(mode) {
  resultPopup.classList.add("hidden");
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");

  if (mode === 'back') {
    toGameBtn.classList.remove("hidden");
    backToGameBtn.classList.add("hidden");
  } else if (mode === 'play') {
    toGameBtn.classList.add("hidden");
    backToGameBtn.classList.remove("hidden");
  }

  leaderboardTable.innerHTML = "";

  const { data: leaderboard } = await supabase.from("leaderboard").select("*");
  leaderboard.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));

  leaderboard.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.city}</td>
      <td>${entry.time}</td>
      <td>${entry.diff}</td>
    `;
    leaderboardTable.appendChild(row);
  });
}

toGameBtn.addEventListener("click", () => {
  leaderboardScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startBtn.disabled = false;
  stopBtn.disabled = true;
  timerDisplay.textContent = "0.000s";
});

backToGameBtn.addEventListener("click", () => {
  leaderboardScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startBtn.disabled = false;
  stopBtn.disabled = true;
  timerDisplay.textContent = "0.000s";
});

const leaderboardBtn = document.getElementById("leaderboard-btn");
leaderboardBtn.addEventListener("click", () => {
  showLeaderboard('back'); 
});
