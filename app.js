document.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  setupThemeButtons();
  initStorage();
  protectPages();
  setTodayDate();

  setupCreateHabitForm();
  updateCreatePreview();

  renderHabitsPage();
  renderDashboard();
  renderProfilePage();
  setupProfileForm();

  setupWorkoutForm();
  renderSavedWorkoutPlans();

  setupCalorieTracker();
  renderCalorieTracker();
  renderWeeklyCalorieGraph();
  setupQuickFoodLookup();

  setupNutritionPage();
  renderNutritionPageContent();

  setupRecoveryPage();
  renderRecoveryPlanContent();
});

/* =========================
   GLOBAL USER SYSTEM
   ========================= */

function getUserProfile() {
  return JSON.parse(localStorage.getItem("userProfile")) || {
    weight: 70,
    height: 170,
    goal: "maintain",
    diet: "vegetarian"
  };
}

function saveUserProfile(profile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}

function saveWorkoutProfileFromPage() {
  const profile = getUserProfile();

  const weightFromWorkout =
    document.getElementById("fitnessWeight")?.value ||
    document.getElementById("calcWeight")?.value ||
    profile.weight;

  const heightFromWorkout =
    document.getElementById("fitnessHeight")?.value ||
    document.getElementById("calcHeight")?.value ||
    profile.height;

  const goalFromWorkout =
    document.getElementById("fitnessGoal")?.value ||
    document.getElementById("calcGoal")?.value ||
    profile.goal;

  const dietFromNutrition =
    document.getElementById("dietType")?.value ||
    profile.diet;

  profile.weight = Number(weightFromWorkout) || profile.weight;
  profile.height = Number(heightFromWorkout) || profile.height;
  profile.goal = goalFromWorkout || profile.goal;
  profile.diet = dietFromNutrition || profile.diet;

  saveUserProfile(profile);
}

/* =========================
   CORE APP
   ========================= */

function initStorage() {
  if (!localStorage.getItem("habitxHabits")) {
    localStorage.setItem("habitxHabits", JSON.stringify([]));
  }

  if (!localStorage.getItem("habitxHistory")) {
    localStorage.setItem("habitxHistory", JSON.stringify({}));
  }

  if (!localStorage.getItem("habitxLoggedIn")) {
    localStorage.setItem("habitxLoggedIn", "false");
  }

  if (!localStorage.getItem("habitxSavedWorkoutPlans")) {
    localStorage.setItem("habitxSavedWorkoutPlans", JSON.stringify([]));
  }

  if (!localStorage.getItem("habitxCalorieTracker")) {
    localStorage.setItem("habitxCalorieTracker", JSON.stringify({}));
  }

  if (!localStorage.getItem("recoveryScore")) {
    localStorage.setItem("recoveryScore", "80");
  }
}

function protectPages() {
  const page = document.body.dataset.page;
  const loggedIn = localStorage.getItem("habitxLoggedIn") === "true";

  const protectedPages = [
    "dashboard",
    "habits",
    "create",
    "profile",
    "fitness",
    "workout",
    "calories",
    "nutrition",
    "recovery"
  ];

  if (protectedPages.includes(page) && !loggedIn) {
    window.location.href = "login.html";
  }
}

function setupThemeButtons() {
  const buttons = document.querySelectorAll("#themeToggle");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");
      localStorage.setItem("habitxTheme", isLight ? "light" : "dark");
      updateThemeButtonText();
    });
  });

  updateThemeButtonText();
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("habitxTheme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
}

function updateThemeButtonText() {
  const isLight = document.body.classList.contains("light-mode");
  document.querySelectorAll("#themeToggle").forEach((btn) => {
    btn.textContent = isLight ? "☀️ Theme" : "🌙 Theme";
  });
}

function logout() {
  localStorage.setItem("habitxLoggedIn", "false");
  window.location.href = "index.html";
}

/* =========================
   USER / HABITS / HISTORY
   ========================= */

function getUser() {
  return JSON.parse(localStorage.getItem("habitxUser")) || {
    fullName: "User",
    username: "user"
  };
}

function saveUser(user) {
  localStorage.setItem("habitxUser", JSON.stringify(user));
}

function getHabits() {
  return JSON.parse(localStorage.getItem("habitxHabits")) || [];
}

function saveHabits(habits) {
  localStorage.setItem("habitxHabits", JSON.stringify(habits));
}

function getHistory() {
  return JSON.parse(localStorage.getItem("habitxHistory")) || {};
}

function saveHistory(history) {
  localStorage.setItem("habitxHistory", JSON.stringify(history));
}

/* =========================
   DATE HELPERS
   ========================= */

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatShortDate(dateStr) {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function formatReadableDate(dateStr) {
  const date = new Date(dateStr);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getLast7DatesFrom(dateStr) {
  const base = new Date(dateStr);
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(formatDateKey(d));
  }

  return dates;
}

function formatChartDay(date) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels[date.getDay()];
}

function safePercent(value, total) {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function setRingPercent(id, value) {
  const ring = document.getElementById(id);
  if (ring) ring.style.setProperty("--percent", value);
}

function setTodayDate() {
  const input = document.getElementById("selectedDate");
  if (!input) return;

  input.value = formatDateKey(new Date());
  input.addEventListener("change", renderDashboard);
}

/* =========================
   CREATE HABIT
   ========================= */

function setupCreateHabitForm() {
  const form = document.getElementById("createHabitForm");
  if (!form) return;

  const inputs = [
    document.getElementById("habitName"),
    document.getElementById("habitCategory"),
    document.getElementById("habitGoal")
  ];

  inputs.forEach((input) => {
    if (input) input.addEventListener("input", updateCreatePreview);
  });

  document.querySelectorAll(".day-pill input").forEach((checkbox) => {
    checkbox.addEventListener("change", updateCreatePreview);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("habitName").value.trim();
    const category = document.getElementById("habitCategory").value.trim();
    const goal = document.getElementById("habitGoal").value.trim();
    const checkedDays = Array.from(document.querySelectorAll(".day-pill input:checked")).map(
      (item) => item.value
    );
    const message = document.getElementById("createMessage");

    if (!name || !category || !goal || checkedDays.length === 0) {
      if (message) {
        message.style.color = "#ff9db5";
        message.textContent = "Please fill all fields and select at least one day.";
      }
      return;
    }

    const habits = getHabits();

    const newHabit = {
      id: Date.now(),
      name,
      category,
      goal,
      days: checkedDays,
      status: "Pending"
    };

    habits.push(newHabit);
    saveHabits(habits);

    const history = getHistory();
    const todayKey = formatDateKey(new Date());

    if (!history[todayKey]) history[todayKey] = {};
    history[todayKey][newHabit.id] = "Pending";
    saveHistory(history);

    if (message) {
      message.style.color = "#7cffb2";
      message.textContent = "Habit created successfully.";
    }

    form.reset();

    document.querySelectorAll(".day-pill input").forEach((checkbox, index) => {
      checkbox.checked = index < 5;
    });

    updateCreatePreview();

    setTimeout(() => {
      window.location.href = "habits.html";
    }, 700);
  });
}

function updateCreatePreview() {
  const previewName = document.getElementById("previewHabitName");
  const previewCategory = document.getElementById("previewHabitCategory");
  const previewGoal = document.getElementById("previewHabitGoal");
  const previewDays = document.getElementById("previewHabitDays");

  if (!previewName || !previewCategory || !previewGoal || !previewDays) return;

  const name = document.getElementById("habitName")?.value.trim() || "Drink Water";
  const category = document.getElementById("habitCategory")?.value.trim() || "Health";
  const goal = document.getElementById("habitGoal")?.value.trim() || "3 liters";

  const checkedDays = Array.from(document.querySelectorAll(".day-pill input:checked")).map(
    (item) => item.value
  );

  previewName.textContent = name;
  previewCategory.textContent = category;
  previewGoal.textContent = goal;
  previewDays.textContent = checkedDays.length ? checkedDays.join(", ") : "No days selected";
}

/* =========================
   HABITS PAGE
   ========================= */

function renderHabitsPage() {
  const habitsList = document.getElementById("habitsList");
  const emptyState = document.getElementById("emptyState");
  if (!habitsList) return;

  const habits = getHabits();
  const history = getHistory();
  const todayKey = formatDateKey(new Date());

  habitsList.innerHTML = "";

  if (habits.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  habits.forEach((habit) => {
    const todayStatus = history[todayKey]?.[habit.id] || "Pending";

    const card = document.createElement("article");
    card.className = "habit-card glass";

    card.innerHTML = `
      <div class="habit-card-top">
        <div>
          <h3>${escapeHtml(habit.name)}</h3>
          <p>${escapeHtml(habit.category)}</p>
        </div>
        <span class="habit-status-badge">${escapeHtml(todayStatus)}</span>
      </div>

      <div class="habit-card-body">
        <div class="meta-box">
          <span>Goal</span>
          <strong>${escapeHtml(habit.goal)}</strong>
        </div>
        <div class="meta-box">
          <span>Days</span>
          <strong>${escapeHtml(habit.days.join(", "))}</strong>
        </div>
      </div>

      <div class="habit-days">
        ${habit.days.map((day) => `<span>${escapeHtml(day)}</span>`).join("")}
      </div>

      <div class="habit-actions">
        <button class="action-btn done-btn" onclick="markHabitStatus(${habit.id}, 'Done')">✔ Done</button>
        <button class="action-btn miss-btn" onclick="markHabitStatus(${habit.id}, 'Missed')">✘ Missed</button>
      </div>

      <div class="habit-actions">
        <button class="action-btn delete-btn" onclick="deleteHabit(${habit.id})">🗑 Delete</button>
      </div>
    `;

    habitsList.appendChild(card);
  });
}

function markHabitStatus(id, status) {
  const history = getHistory();
  const todayKey = formatDateKey(new Date());

  if (!history[todayKey]) history[todayKey] = {};
  history[todayKey][id] = status;
  saveHistory(history);

  renderHabitsPage();
  renderDashboard();
}

function deleteHabit(id) {
  const habits = getHabits().filter((habit) => habit.id !== id);
  saveHabits(habits);

  const history = getHistory();
  Object.keys(history).forEach((dateKey) => {
    if (history[dateKey] && history[dateKey][id] !== undefined) {
      delete history[dateKey][id];
    }
  });
  saveHistory(history);

  renderHabitsPage();
  renderDashboard();
}

/* =========================
   DASHBOARD
   ========================= */

function getStatsForDate(dateKey, habits, history) {
  const dateHistory = history[dateKey] || {};

  let doneCount = 0;
  let missedCount = 0;

  habits.forEach((habit) => {
    const status = dateHistory[habit.id] || "Pending";
    if (status === "Done") doneCount++;
    if (status === "Missed") missedCount++;
  });

  return {
    doneCount,
    missedCount,
    donePercent: safePercent(doneCount, habits.length || 1),
    missedPercent: safePercent(missedCount, habits.length || 1)
  };
}

function renderChart(chartData) {
  const chartGrid = document.getElementById("chartGrid");
  if (!chartGrid) return;

  chartGrid.innerHTML = "";

  chartData.forEach((item) => {
    const group = document.createElement("div");
    group.className = "chart-bar-group";

    const stack = document.createElement("div");
    stack.className = "chart-bar-stack";

    const doneBar = document.createElement("div");
    doneBar.className = "bar done";

    const missBar = document.createElement("div");
    missBar.className = "bar miss";

    const doneHeight = item.donePercent > 0 ? item.donePercent : 0;
    const missHeight = item.missedPercent > 0 ? item.missedPercent : 0;

    doneBar.style.height = `${doneHeight * 0.5}%`;
    missBar.style.height = `${missHeight * 0.5}%`;

    stack.appendChild(doneBar);
    stack.appendChild(missBar);

    if (doneHeight > 0) {
      const doneLabel = document.createElement("div");
      doneLabel.className = "bar-label done-label";
      doneLabel.textContent = `${doneHeight}%`;
      doneLabel.style.bottom = `calc(50% + ${doneHeight * 1.8}px + 8px)`;
      stack.appendChild(doneLabel);
    }

    if (missHeight > 0) {
      const missLabel = document.createElement("div");
      missLabel.className = "bar-label miss-label";
      missLabel.textContent = `-${missHeight}%`;
      missLabel.style.top = `calc(50% + ${missHeight * 1.8}px + 8px)`;
      stack.appendChild(missLabel);
    }

    const dateLabel = document.createElement("div");
    dateLabel.className = "chart-date";
    dateLabel.textContent = formatShortDate(item.date);

    group.appendChild(stack);
    group.appendChild(dateLabel);
    chartGrid.appendChild(group);
  });
}

function renderDashboard() {
  const totalHabitsEl = document.getElementById("totalHabitsCount");
  const completedTodayEl = document.getElementById("completedTodayCount");
  const missedTodayEl = document.getElementById("missedTodayCount");
  const todayPercentEl = document.getElementById("todayPercent");
  const weekPercentEl = document.getElementById("weekPercent");
  const missPercentEl = document.getElementById("missPercent");
  const overallPerformanceEl = document.getElementById("overallPerformance");
  const selectedDateText = document.getElementById("selectedDateText");
  const selectedDateInput = document.getElementById("selectedDate");
  const dashboardWelcomeName = document.getElementById("dashboardWelcomeName");

  if (dashboardWelcomeName) {
    const user = getUser();
    dashboardWelcomeName.textContent = user.fullName || user.username || "User";
  }

  if (!totalHabitsEl || !selectedDateInput) return;

  const habits = getHabits();
  const history = getHistory();
  const selectedDate = selectedDateInput.value || formatDateKey(new Date());

  const totalHabits = habits.length;
  const selectedStats = getStatsForDate(selectedDate, habits, history);
  const weekDates = getLast7DatesFrom(selectedDate);

  let weeklyDone = 0;
  let weeklyMissed = 0;

  const chartData = weekDates.map((date) => {
    const stats = getStatsForDate(date, habits, history);
    weeklyDone += stats.doneCount;
    weeklyMissed += stats.missedCount;

    return {
      date,
      donePercent: stats.donePercent,
      missedPercent: stats.missedPercent
    };
  });

  const todayPercent = safePercent(selectedStats.doneCount, totalHabits || 1);
  const missPercent = safePercent(selectedStats.missedCount, totalHabits || 1);
  const weekPercent = safePercent(weeklyDone, (totalHabits || 1) * 7);
  const overallPercent = safePercent(weeklyDone, weeklyDone + weeklyMissed || 1);

  totalHabitsEl.textContent = totalHabits;
  if (completedTodayEl) completedTodayEl.textContent = selectedStats.doneCount;
  if (missedTodayEl) missedTodayEl.textContent = selectedStats.missedCount;
  if (todayPercentEl) todayPercentEl.textContent = `${todayPercent}%`;
  if (weekPercentEl) weekPercentEl.textContent = `${weekPercent}%`;
  if (missPercentEl) missPercentEl.textContent = `${missPercent}%`;
  if (overallPerformanceEl) overallPerformanceEl.textContent = `${overallPercent}%`;

  if (selectedDateText) {
    selectedDateText.textContent = `Tracking summary for ${formatReadableDate(selectedDate)}.`;
  }

  setRingPercent("todayRing", todayPercent);
  setRingPercent("weekRing", weekPercent);
  setRingPercent("missRing", missPercent);

  renderChart(chartData);
}

/* =========================
   PROFILE
   ========================= */

function renderProfilePage() {
  const profileName = document.getElementById("profileName");
  if (!profileName) return;

  const user = getUser();
  const fullName = user.fullName || "User";
  const username = user.username || "username";

  const profileUsername = document.getElementById("profileUsername");
  const profileFullName = document.getElementById("profileFullName");
  const profileUserNameText = document.getElementById("profileUserNameText");
  const profileAvatar = document.getElementById("profileAvatar");
  const fullNameInput = document.getElementById("fullName");
  const usernameInput = document.getElementById("profileUsernameInput");

  profileName.textContent = fullName;
  if (profileUsername) profileUsername.textContent = `@${username}`;
  if (profileFullName) profileFullName.textContent = fullName;
  if (profileUserNameText) profileUserNameText.textContent = username;
  if (profileAvatar) profileAvatar.textContent = fullName.charAt(0).toUpperCase();

  if (fullNameInput) fullNameInput.value = fullName;
  if (usernameInput) usernameInput.value = username;
}

function setupProfileForm() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("profileUsernameInput").value.trim();
    const message = document.getElementById("profileMessage");
    const currentUser = getUser();

    if (fullName.length < 2 || username.length < 3) {
      if (message) {
        message.style.color = "#ff9db5";
        message.textContent = "Please enter valid details.";
      }
      return;
    }

    saveUser({
      ...currentUser,
      fullName,
      username
    });

    if (message) {
      message.style.color = "#7cffb2";
      message.textContent = "Profile updated successfully.";
    }

    renderProfilePage();
    renderDashboard();
  });
}

/* =========================
   WORKOUT GENERATOR
   ========================= */

function setupWorkoutForm() {
  const form = document.getElementById("workoutForm");
  if (!form) return;

  const output = document.getElementById("workoutPlanOutput");
  const message = document.getElementById("workoutMessage");

  renderSavedWorkoutPlans();

  const profile = getUserProfile();
  const savedGoal = document.getElementById("fitnessGoal");
  const savedWeight = document.getElementById("fitnessWeight");
  const savedHeight = document.getElementById("fitnessHeight");

  if (savedGoal && profile.goal) savedGoal.value = profile.goal;
  if (savedWeight && profile.weight) savedWeight.value = profile.weight;
  if (savedHeight && profile.height) savedHeight.value = profile.height;

  const savedPlan = JSON.parse(localStorage.getItem("habitxWorkoutPlan") || "null");
  if (savedPlan && output) {
    output.classList.remove("workout-output-empty");
    output.innerHTML = renderWorkoutPlanHTML(savedPlan);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const goal = document.getElementById("fitnessGoal").value;
    const level = document.getElementById("fitnessLevel").value;
    const place = document.getElementById("workoutPlace").value;
    const days = Number(document.getElementById("workoutDays").value);
    const age = Number(document.getElementById("fitnessAge").value);
    const weight = Number(document.getElementById("fitnessWeight").value);
    const height = Number(document.getElementById("fitnessHeight").value);
    const injury = document.getElementById("injuryArea").value;

    if (!goal || !level || !place || !days || !age || !weight || !height) {
      if (message) {
        message.style.color = "#ff9db5";
        message.textContent = "Please fill all workout fields.";
      }
      return;
    }

    saveWorkoutProfileFromPage();

    const plan = generateWorkoutPlan({
      goal,
      level,
      place,
      days,
      age,
      weight,
      height,
      injury
    });

    localStorage.setItem("habitxWorkoutPlan", JSON.stringify(plan));

    if (output) {
      output.classList.remove("workout-output-empty");
      output.innerHTML = renderWorkoutPlanHTML(plan);
    }

    if (message) {
      message.style.color = "#7cffb2";
      message.textContent = "Workout generated successfully.";
    }
  });
}

function generateWorkoutPlan(data) {
  const { goal, level, place, days, injury } = data;
  const recoveryScore = Number(localStorage.getItem("recoveryScore")) || 80;

  const planName = getPlanName(goal, days, level);
  const exercises = getExerciseLibrary(place, injury);

  let split = [];

  if (days === 3) {
    split = [
      { day: "Day 1", focus: "Push", items: exercises.push },
      { day: "Day 2", focus: "Pull", items: exercises.pull },
      { day: "Day 3", focus: "Legs + Core", items: exercises.legs }
    ];
  } else if (days === 4) {
    split = [
      { day: "Day 1", focus: "Upper Body", items: exercises.upper },
      { day: "Day 2", focus: "Lower Body", items: exercises.lower },
      { day: "Day 3", focus: "Push", items: exercises.push },
      { day: "Day 4", focus: "Pull + Core", items: exercises.pull }
    ];
  } else if (days === 5) {
    split = [
      { day: "Day 1", focus: "Chest + Triceps", items: exercises.push },
      { day: "Day 2", focus: "Back + Biceps", items: exercises.pull },
      { day: "Day 3", focus: "Legs", items: exercises.legs },
      { day: "Day 4", focus: "Shoulders + Core", items: exercises.shoulders },
      { day: "Day 5", focus: "Full Body Conditioning", items: exercises.full }
    ];
  } else {
    split = [
      { day: "Day 1", focus: "Chest + Triceps + Shoulders", items: exercises.push },
      { day: "Day 2", focus: "Back + Biceps", items: exercises.pull },
      { day: "Day 3", focus: "Legs", items: exercises.legs },
      { day: "Day 4", focus: "Chest + Triceps + Shoulders", items: exercises.push },
      { day: "Day 5", focus: "Back + Biceps", items: exercises.pull },
      { day: "Day 6", focus: "Legs + Core", items: exercises.lower }
    ];
  }

  const repStyle = getRepScheme(goal, level, recoveryScore);
  const notes = getWorkoutNotes(goal, level, place, injury, recoveryScore);

  return {
    title: planName,
    subtitle: `${capitalize(goal.replaceAll("_", " "))} • ${capitalize(level)} • ${capitalize(place)} • ${days} days/week`,
    repStyle,
    notes,
    split
  };
}

function getPlanName(goal, days, level) {
  const goalMap = {
    muscle_gain: "Muscle Building Plan",
    fat_loss: "Fat Loss Training Plan",
    body_recomp: "Body Recomposition Plan",
    strength: "Strength Focused Plan",
    endurance: "Endurance Fitness Plan"
  };

  return `${goalMap[goal] || "Workout Plan"} - ${days} Day ${capitalize(level)} Split`;
}

function getRepScheme(goal, level, recoveryScore = 80) {
  if (recoveryScore < 50) return "2-3 sets × 10-12 reps";

  if (goal === "strength") {
    return level === "beginner" ? "3-4 sets × 5-8 reps" : "4-5 sets × 4-6 reps";
  }

  if (goal === "fat_loss" || goal === "endurance") {
    return "3-4 sets × 12-15 reps";
  }

  return "3-4 sets × 8-12 reps";
}

function getExerciseLibrary(place, injury) {
  const gym = {
    push: [
      "Barbell Bench Press",
      "Incline Dumbbell Press",
      "Machine Chest Press",
      "Cable Lateral Raises",
      "Triceps Pushdown"
    ],
    pull: [
      "Lat Pulldown",
      "Seated Cable Row",
      "Single Arm Dumbbell Row",
      "Face Pulls",
      "EZ Bar Bicep Curl"
    ],
    legs: [
      "Barbell Squat",
      "Leg Press",
      "Romanian Deadlift",
      "Leg Curl",
      "Standing Calf Raise"
    ],
    upper: [
      "Bench Press",
      "Lat Pulldown",
      "Shoulder Press",
      "Seated Row",
      "Bicep Curl"
    ],
    lower: [
      "Squat",
      "Leg Press",
      "Romanian Deadlift",
      "Walking Lunges",
      "Plank"
    ],
    shoulders: [
      "Seated Dumbbell Press",
      "Lateral Raises",
      "Rear Delt Fly",
      "Upright Row",
      "Hanging Knee Raises"
    ],
    full: [
      "Goblet Squat",
      "Push Ups",
      "Cable Row",
      "Dumbbell Shoulder Press",
      "Mountain Climbers"
    ]
  };

  const home = {
    push: [
      "Push Ups",
      "Incline Push Ups",
      "Pike Push Ups",
      "Chair Dips",
      "Resistance Band Chest Press"
    ],
    pull: [
      "Resistance Band Rows",
      "Towel Rows",
      "Rear Delt Band Pulls",
      "Band Bicep Curls",
      "Superman Holds"
    ],
    legs: [
      "Bodyweight Squats",
      "Reverse Lunges",
      "Glute Bridges",
      "Wall Sit",
      "Standing Calf Raises"
    ],
    upper: [
      "Push Ups",
      "Band Rows",
      "Pike Push Ups",
      "Band Curls",
      "Chair Dips"
    ],
    lower: [
      "Bodyweight Squats",
      "Walking Lunges",
      "Single Leg Glute Bridge",
      "Wall Sit",
      "Dead Bug"
    ],
    shoulders: [
      "Pike Push Ups",
      "Arm Circles",
      "Band Lateral Raises",
      "Rear Delt Band Pulls",
      "Plank Shoulder Taps"
    ],
    full: [
      "Squats",
      "Push Ups",
      "Band Rows",
      "Jumping Jacks",
      "Plank"
    ]
  };

  const base = JSON.parse(JSON.stringify(place === "home" ? home : gym));

  if (injury === "shoulder") {
    base.push = base.push
      .filter((e) => !/Press|Push Ups|Pike/i.test(e))
      .concat(["Light Cable Fly", "Triceps Kickback"]);
    base.shoulders = [
      "Band External Rotations",
      "Scaption Raises",
      "Rear Delt Band Pulls",
      "Wall Slides",
      "Dead Bug"
    ];
  }

  if (injury === "knee") {
    base.legs = ["Glute Bridge", "Romanian Deadlift", "Seated Hamstring Curl", "Calf Raise", "Core Breathing"];
    base.lower = ["Glute Bridge", "Hip Hinge Drill", "Hamstring Curl", "Calf Raise", "Plank"];
  }

  if (injury === "lower_back") {
    base.legs = ["Leg Press", "Split Squat", "Hamstring Curl", "Calf Raise", "Bird Dog"];
    base.lower = ["Step Ups", "Hamstring Curl", "Leg Extension", "Calf Raise", "Dead Bug"];
  }

  if (injury === "wrist") {
    base.push = base.push
      .filter((e) => !/Push Ups|Bench/i.test(e))
      .concat(["Machine Chest Press", "Cable Fly"]);
  }

  if (injury === "ankle") {
    base.legs = ["Leg Press", "Hamstring Curl", "Glute Bridge", "Leg Extension", "Seated Core Work"];
  }

  return base;
}

function getWorkoutNotes(goal, level, place, injury, recoveryScore = 80) {
  const notes = [
    `Rep range: ${getRepScheme(goal, level, recoveryScore)}`,
    "Warm up for 5-10 minutes before each workout.",
    "Rest 60-90 seconds between most sets.",
    place === "gym"
      ? "Focus on controlled form instead of lifting too heavy too soon."
      : "Use tempo control and short rest periods to increase difficulty at home."
  ];

  if (goal === "muscle_gain") notes.push("Try progressive overload weekly by increasing reps, sets, or weight.");
  if (goal === "fat_loss") notes.push("Keep rest shorter and maintain daily step count for better calorie burn.");
  if (goal === "body_recomp") notes.push("Prioritize protein intake and consistent strength training.");
  if (goal === "strength") notes.push("Keep compound lifts as the priority and track your top sets.");
  if (goal === "endurance") notes.push("Use steady pacing and add conditioning finishers if recovery allows.");

  if (injury !== "none") {
    notes.push(`Training adjusted for ${capitalize(injury.replaceAll("_", " "))} limitation.`);
    notes.push("Stop any exercise that causes sharp pain and favor controlled movement patterns.");
  }

  if (recoveryScore < 50) {
    notes.push("Recovery score is low today, so use lighter volume and prioritize recovery.");
  }

  return notes;
}

function renderWorkoutPlanHTML(plan) {
  return `
    <div class="workout-plan">
      <div class="workout-plan-top">
        <h3>${escapeHtml(plan.title)}</h3>
        <p>${escapeHtml(plan.subtitle)}</p>
        <p><strong>${escapeHtml(plan.repStyle)}</strong></p>
      </div>

      <div class="workout-days-list">
        ${plan.split.map((day) => `
          <div class="workout-day-card">
            <h4>${escapeHtml(day.day)} - ${escapeHtml(day.focus)}</h4>
            <ol class="workout-exercise-list">
              ${day.items.map((item) => `
                <li>
                  <strong>${escapeHtml(item)}</strong>
                  <span class="rep-style">${escapeHtml(plan.repStyle)}</span>
                </li>
              `).join("")}
            </ol>
          </div>
        `).join("")}
      </div>

      <div class="workout-notes">
        <h4>Training Notes</h4>
        <ul>
          ${plan.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function saveGeneratedWorkout() {
  const raw = localStorage.getItem("habitxWorkoutPlan");
  if (!raw) return;

  const plan = JSON.parse(raw);
  const saved = JSON.parse(localStorage.getItem("habitxSavedWorkoutPlans") || "[]");

  saved.unshift({
    id: Date.now(),
    title: plan.title,
    subtitle: plan.subtitle,
    plan
  });

  localStorage.setItem("habitxSavedWorkoutPlans", JSON.stringify(saved.slice(0, 5)));
  renderSavedWorkoutPlans();
}

function renderSavedWorkoutPlans() {
  const container = document.getElementById("savedWorkoutPlans");
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem("habitxSavedWorkoutPlans") || "[]");

  if (!saved.length) {
    container.innerHTML = `<p class="muted" style="margin-top:12px;">No saved plans yet.</p>`;
    return;
  }

  container.innerHTML = saved.map((item) => `
    <div class="workout-day-card" style="margin-top:12px;">
      <h4>${escapeHtml(item.title)}</h4>
      <p class="muted">${escapeHtml(item.subtitle)}</p>
      <button type="button" class="secondary-action-btn" onclick="loadSavedWorkoutPlan(${item.id})">Load Plan</button>
    </div>
  `).join("");
}

function loadSavedWorkoutPlan(id) {
  const saved = JSON.parse(localStorage.getItem("habitxSavedWorkoutPlans") || "[]");
  const found = saved.find((item) => item.id === id);
  const output = document.getElementById("workoutPlanOutput");

  if (!found || !output) return;

  localStorage.setItem("habitxWorkoutPlan", JSON.stringify(found.plan));
  output.classList.remove("workout-output-empty");
  output.innerHTML = renderWorkoutPlanHTML(found.plan);
}

/* =========================
   CALORIE TRACKER
   ========================= */

function getCalorieTrackerData() {
  return JSON.parse(localStorage.getItem("habitxCalorieTracker") || "{}");
}

function saveCalorieTrackerData(data) {
  localStorage.setItem("habitxCalorieTracker", JSON.stringify(data));
}

function setupCalorieTracker() {
  const form = document.getElementById("calorieForm");
  const dateInput = document.getElementById("calorieDate");
  if (!form || !dateInput) return;

  if (!dateInput.value) {
    dateInput.value = formatDateKey(new Date());
  }

  const profile = getUserProfile();
  const targetInput = document.getElementById("dailyCalorieTarget");
  if (targetInput && !targetInput.value) {
    targetInput.value = String(getProfileTargetCalories(profile));
  }

  dateInput.addEventListener("change", renderCalorieTracker);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const mealName = document.getElementById("mealName").value.trim();
    const mealType = document.getElementById("mealType").value;
    const calories = Number(document.getElementById("mealCalories").value);
    const protein = Number(document.getElementById("mealProtein").value);
    const carbs = Number(document.getElementById("mealCarbs").value);
    const fats = Number(document.getElementById("mealFats").value);
    const target = Number(document.getElementById("dailyCalorieTarget").value);
    const dateKey = dateInput.value;
    const message = document.getElementById("calorieMessage");

    if (!mealName || !mealType || calories < 0 || protein < 0 || carbs < 0 || fats < 0 || target < 500) {
      if (message) {
        message.style.color = "#ff9db5";
        message.textContent = "Please fill all calorie fields properly.";
      }
      return;
    }

    saveWorkoutProfileFromPage();

    const data = getCalorieTrackerData();

    if (!data[dateKey]) {
      data[dateKey] = {
        targetCalories: target,
        meals: []
      };
    }

    data[dateKey].targetCalories = target;
    data[dateKey].meals.push({
      id: Date.now(),
      mealName,
      mealType,
      calories,
      protein,
      carbs,
      fats
    });

    saveCalorieTrackerData(data);
    form.reset();
    document.getElementById("dailyCalorieTarget").value = target;

    if (message) {
      message.style.color = "#7cffb2";
      message.textContent = "Meal added successfully.";
    }

    renderCalorieTracker();
  });
}

function renderCalorieTracker() {
  const dateInput = document.getElementById("calorieDate");
  const list = document.getElementById("mealLogList");
  const empty = document.getElementById("mealLogEmpty");
  const targetInput = document.getElementById("dailyCalorieTarget");

  if (!dateInput || !list || !empty) return;

  if (!dateInput.value) {
    dateInput.value = formatDateKey(new Date());
  }

  const dateKey = dateInput.value;
  const data = getCalorieTrackerData();
  const profile = getUserProfile();
  const dayData = data[dateKey] || { targetCalories: getProfileTargetCalories(profile), meals: [] };
  const meals = dayData.meals || [];

  if (targetInput) {
    targetInput.value = dayData.targetCalories || getProfileTargetCalories(profile);
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  meals.forEach((meal) => {
    totalCalories += Number(meal.calories || 0);
    totalProtein += Number(meal.protein || 0);
    totalCarbs += Number(meal.carbs || 0);
    totalFats += Number(meal.fats || 0);
  });

  const targetCalories = Number(dayData.targetCalories || getProfileTargetCalories(profile));
  const remainingCalories = Math.max(targetCalories - totalCalories, 0);
  const progressPercent = Math.min(Math.round((totalCalories / targetCalories) * 100) || 0, 100);

  updateText("calorieTotal", totalCalories);
  updateText("proteinTotal", `${totalProtein}g`);
  updateText("carbTotal", `${totalCarbs}g`);
  updateText("fatTotal", `${totalFats}g`);

  updateText("calorieTotalTag", `${totalCalories} kcal`);
  updateText("proteinTotalTag", `${totalProtein}g protein`);
  updateText("carbTotalTag", `${totalCarbs}g carbs`);
  updateText("fatTotalTag", `${totalFats}g fats`);
  updateText("mealCountTag", `${meals.length} meals`);
  updateText("remainingCaloriesTag", `${remainingCalories} left`);
  updateText("calorieTargetDisplay", `${targetCalories} kcal`);
  updateText("calorieGoalPercentText", `${progressPercent}%`);

  const goalBar = document.getElementById("calorieGoalBar");
  if (goalBar) goalBar.style.width = `${progressPercent}%`;

  list.innerHTML = "";

  if (!meals.length) {
    empty.style.display = "flex";
    renderWeeklyCalorieGraph();
    return;
  }

  empty.style.display = "none";

  meals.forEach((meal) => {
    const card = document.createElement("div");
    card.className = "meal-log-card";

    card.innerHTML = `
      <div class="meal-log-top">
        <div>
          <h4>${escapeHtml(meal.mealName)}</h4>
          <p>${escapeHtml(meal.mealType)}</p>
        </div>
        <span class="meal-kcal-badge">${escapeHtml(String(meal.calories))} kcal</span>
      </div>

      <div class="meal-macro-row">
        <div class="meal-macro-box">
          <span>Protein</span>
          <strong>${escapeHtml(String(meal.protein))}g</strong>
        </div>
        <div class="meal-macro-box">
          <span>Carbs</span>
          <strong>${escapeHtml(String(meal.carbs))}g</strong>
        </div>
        <div class="meal-macro-box">
          <span>Fats</span>
          <strong>${escapeHtml(String(meal.fats))}g</strong>
        </div>
      </div>

      <div class="meal-log-actions">
        <button class="meal-delete-btn" onclick="deleteMealEntry(${meal.id}, '${dateKey}')">Delete</button>
      </div>
    `;

    list.appendChild(card);
  });

  renderWeeklyCalorieGraph();
}

function deleteMealEntry(id, dateKey) {
  const data = getCalorieTrackerData();
  if (!data[dateKey]) return;

  data[dateKey].meals = (data[dateKey].meals || []).filter((meal) => meal.id !== id);
  saveCalorieTrackerData(data);
  renderCalorieTracker();
}

function getProfileTargetCalories(profile) {
  let target = (profile.weight || 70) * 30;
  if (profile.goal === "fat_loss") target -= 400;
  if (profile.goal === "muscle_gain") target += 400;
  return Math.round(target);
}

function renderWeeklyCalorieGraph() {
  const chart = document.getElementById("calorieChart");
  const dateInput = document.getElementById("calorieDate");

  if (!chart || !dateInput) return;

  const data = getCalorieTrackerData();
  const selectedDate = new Date(dateInput.value || new Date());

  const days = [];
  let targetCalories = getProfileTargetCalories(getUserProfile());

  for (let i = 6; i >= 0; i--) {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() - i);

    const key = formatDateKey(d);
    const dayData = data[key] || { meals: [], targetCalories };

    const totalCalories = (dayData.meals || []).reduce((sum, meal) => {
      return sum + Number(meal.calories || 0);
    }, 0);

    targetCalories = dayData.targetCalories || targetCalories;

    days.push({
      label: formatChartDay(d),
      calories: totalCalories
    });
  }

  const maxCalories = Math.max(...days.map((d) => d.calories), targetCalories, 2000);
  const targetHeight = (targetCalories / maxCalories) * 100;

  chart.innerHTML = `
    <div class="calorie-target-line" style="bottom:${targetHeight}%"></div>
  `;

  chart.innerHTML += days.map((day) => {
    const height = day.calories > 0
      ? Math.max((day.calories / maxCalories) * 100, 6)
      : 4;

    const isOver = day.calories > targetCalories;

    return `
      <div class="calorie-bar-group">
        <div class="calorie-bar-value">${escapeHtml(String(day.calories))}</div>

        <div class="calorie-bar-wrap">
          <div class="calorie-bar ${isOver ? "over" : "good"}"
               style="height:${height}%;">
          </div>
        </div>

        <div class="calorie-bar-date">${escapeHtml(day.label)}</div>
      </div>
    `;
  }).join("");
}

/* =========================
   QUICK FOOD LOOKUP
   ========================= */

function getQuickFoodDatabase() {
  return {
    banana: { name: "Banana", type: "Snack", calories: 105, protein: 1.3, carbs: 27, fats: 0.3, serving: "1 medium banana" },
    apple: { name: "Apple", type: "Snack", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, serving: "1 medium apple" },
    oats: { name: "Oats", type: "Breakfast", calories: 389, protein: 16.9, carbs: 66.3, fats: 6.9, serving: "100g oats" },
    rice: { name: "Cooked Rice", type: "Lunch", calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "100g cooked rice" },
    roti: { name: "Roti", type: "Lunch", calories: 120, protein: 3, carbs: 18, fats: 3, serving: "1 medium roti" },
    dal: { name: "Dal", type: "Lunch", calories: 198, protein: 12, carbs: 27, fats: 4, serving: "1 cup dal" },
    milk: { name: "Milk", type: "Breakfast", calories: 150, protein: 8, carbs: 12, fats: 8, serving: "250ml milk" },
    curd: { name: "Curd", type: "Snack", calories: 98, protein: 11, carbs: 3.4, fats: 4.3, serving: "100g curd" },
    paneer: { name: "Paneer", type: "Dinner", calories: 265, protein: 18, carbs: 3, fats: 20, serving: "100g paneer" },
    egg: { name: "Egg", type: "Breakfast", calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, serving: "1 whole egg" },
    chicken: { name: "Chicken Breast", type: "Lunch", calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "100g chicken breast" },
    peanut_butter: { name: "Peanut Butter", type: "Snack", calories: 94, protein: 4, carbs: 3, fats: 8, serving: "1 tablespoon" },
    bread: { name: "Bread", type: "Breakfast", calories: 140, protein: 6, carbs: 24, fats: 2, serving: "2 slices bread" },
    potato: { name: "Boiled Potato", type: "Lunch", calories: 87, protein: 1.9, carbs: 20, fats: 0.1, serving: "100g boiled potato" },
    almonds: { name: "Almonds", type: "Snack", calories: 70, protein: 2.6, carbs: 2.5, fats: 6.1, serving: "10 almonds" },

    poha: { name: "Poha", type: "Breakfast", calories: 250, protein: 5, carbs: 45, fats: 5, serving: "1 plate (~200g)" },
    upma: { name: "Upma", type: "Breakfast", calories: 220, protein: 6, carbs: 38, fats: 6, serving: "1 bowl" },
    idli: { name: "Idli", type: "Breakfast", calories: 130, protein: 4, carbs: 28, fats: 1, serving: "2 pieces" },
    dosa: { name: "Dosa", type: "Breakfast", calories: 168, protein: 4, carbs: 30, fats: 3.7, serving: "1 plain dosa" },
    masala_dosa: { name: "Masala Dosa", type: "Breakfast", calories: 290, protein: 6, carbs: 40, fats: 10, serving: "1 piece" },
    uttapam: { name: "Uttapam", type: "Breakfast", calories: 210, protein: 6, carbs: 32, fats: 6, serving: "1 medium uttapam" },
    paratha: { name: "Paratha", type: "Breakfast", calories: 260, protein: 5, carbs: 30, fats: 13, serving: "1 piece" },
    aloo_paratha: { name: "Aloo Paratha", type: "Breakfast", calories: 300, protein: 6, carbs: 38, fats: 13, serving: "1 piece" },
    chai: { name: "Chai", type: "Snack", calories: 120, protein: 3, carbs: 15, fats: 5, serving: "1 cup" },
    samosa: { name: "Samosa", type: "Snack", calories: 250, protein: 4, carbs: 30, fats: 12, serving: "1 piece" },

    rajma_chawal: { name: "Rajma Chawal", type: "Lunch", calories: 430, protein: 14, carbs: 68, fats: 10, serving: "1 plate" },
    chole_bhature: { name: "Chole Bhature", type: "Lunch", calories: 520, protein: 14, carbs: 60, fats: 24, serving: "1 plate" },
    khichdi: { name: "Khichdi", type: "Lunch", calories: 230, protein: 8, carbs: 38, fats: 5, serving: "1 bowl" },
    pulao: { name: "Veg Pulao", type: "Lunch", calories: 320, protein: 6, carbs: 52, fats: 9, serving: "1 plate" },
    biryani_veg: { name: "Veg Biryani", type: "Lunch", calories: 390, protein: 8, carbs: 52, fats: 16, serving: "1 plate" },
    biryani_chicken: { name: "Chicken Biryani", type: "Lunch", calories: 520, protein: 24, carbs: 52, fats: 24, serving: "1 plate" },
    dal_rice: { name: "Dal Rice", type: "Lunch", calories: 350, protein: 11, carbs: 55, fats: 8, serving: "1 plate" },
    roti_sabzi: { name: "Roti Sabzi", type: "Lunch", calories: 320, protein: 9, carbs: 42, fats: 12, serving: "2 roti + sabzi" },
    paneer_butter_masala: { name: "Paneer Butter Masala", type: "Dinner", calories: 420, protein: 14, carbs: 12, fats: 34, serving: "1 serving" },
    chicken_curry: { name: "Chicken Curry", type: "Dinner", calories: 310, protein: 27, carbs: 8, fats: 18, serving: "1 serving" },
    fish_curry: { name: "Fish Curry", type: "Dinner", calories: 260, protein: 24, carbs: 6, fats: 14, serving: "1 serving" },

    maggi: { name: "Maggi", type: "Snack", calories: 385, protein: 8, carbs: 52, fats: 17, serving: "1 packet prepared" },
    pav_bhaji: { name: "Pav Bhaji", type: "Snack", calories: 400, protein: 8, carbs: 48, fats: 18, serving: "1 plate" },
    bhel_puri: { name: "Bhel Puri", type: "Snack", calories: 180, protein: 4, carbs: 32, fats: 4, serving: "1 plate" },
    dahi_puri: { name: "Dahi Puri", type: "Snack", calories: 220, protein: 5, carbs: 28, fats: 8, serving: "1 plate" },

    lassi: { name: "Sweet Lassi", type: "Snack", calories: 180, protein: 6, carbs: 24, fats: 6, serving: "1 glass" },
    buttermilk: { name: "Buttermilk", type: "Snack", calories: 60, protein: 3, carbs: 6, fats: 2, serving: "1 glass" },
    coconut_water: { name: "Coconut Water", type: "Snack", calories: 45, protein: 1, carbs: 9, fats: 0, serving: "1 glass" },

    tofu: { name: "Tofu", type: "Dinner", calories: 144, protein: 15.7, carbs: 3.9, fats: 8.7, serving: "100g tofu" },
    sprouts: { name: "Sprouts Salad", type: "Snack", calories: 120, protein: 9, carbs: 18, fats: 1.5, serving: "1 bowl" },
    soy_chunks: { name: "Soy Chunks", type: "Dinner", calories: 173, protein: 26, carbs: 15, fats: 0.5, serving: "50g dry soy chunks" }
  };
}

function setupQuickFoodLookup() {
  const select = document.getElementById("quickFoodSelect");
  const qtyInput = document.getElementById("quickFoodQty");
  const useBtn = document.getElementById("useQuickFoodBtn");

  if (!select || !qtyInput || !useBtn) return;

  const profile = getUserProfile();
  const nutritionDiet = document.getElementById("dietType");
  if (nutritionDiet && profile.diet) {
    nutritionDiet.value = profile.diet;
  }

  select.addEventListener("change", renderQuickFoodPreview);
  qtyInput.addEventListener("input", renderQuickFoodPreview);

  useBtn.addEventListener("click", () => {
    const db = getQuickFoodDatabase();
    const selectedKey = select.value;
    const qty = Math.max(Number(qtyInput.value || 1), 1);

    if (!selectedKey || !db[selectedKey]) return;

    const item = db[selectedKey];
    const calculated = multiplyFoodValues(item, qty);

    const mealName = document.getElementById("mealName");
    const mealType = document.getElementById("mealType");
    const mealCalories = document.getElementById("mealCalories");
    const mealProtein = document.getElementById("mealProtein");
    const mealCarbs = document.getElementById("mealCarbs");
    const mealFats = document.getElementById("mealFats");

    if (mealName) mealName.value = qty > 1 ? `${item.name} x${qty}` : item.name;
    if (mealType) mealType.value = item.type;
    if (mealCalories) mealCalories.value = calculated.calories;
    if (mealProtein) mealProtein.value = calculated.protein;
    if (mealCarbs) mealCarbs.value = calculated.carbs;
    if (mealFats) mealFats.value = calculated.fats;
  });

  renderQuickFoodPreview();
}

function changeQty(change) {
  const input = document.getElementById("quickFoodQty");
  if (!input) return;

  let value = Number(input.value || 1);
  value += change;

  if (value < 1) value = 1;

  input.value = value;
  renderQuickFoodPreview();
}

function multiplyFoodValues(item, qty) {
  return {
    calories: roundValue(item.calories * qty),
    protein: roundValue(item.protein * qty),
    carbs: roundValue(item.carbs * qty),
    fats: roundValue(item.fats * qty)
  };
}

function renderQuickFoodPreview() {
  const select = document.getElementById("quickFoodSelect");
  const qtyInput = document.getElementById("quickFoodQty");

  const quickServing = document.getElementById("quickServing");
  const quickCalories = document.getElementById("quickCalories");
  const quickProtein = document.getElementById("quickProtein");
  const quickCarbs = document.getElementById("quickCarbs");
  const quickFats = document.getElementById("quickFats");

  if (!select || !qtyInput || !quickServing || !quickCalories || !quickProtein || !quickCarbs || !quickFats) return;

  const db = getQuickFoodDatabase();
  const selectedKey = select.value;
  const qty = Math.max(Number(qtyInput.value || 1), 1);

  if (!selectedKey || !db[selectedKey]) {
    quickServing.textContent = "Serving: —";
    quickCalories.textContent = "0";
    quickProtein.textContent = "0g";
    quickCarbs.textContent = "0g";
    quickFats.textContent = "0g";
    return;
  }

  const item = db[selectedKey];
  const values = multiplyFoodValues(item, qty);

  quickServing.textContent = `Serving: ${item.serving}`;
  quickCalories.textContent = String(values.calories);
  quickProtein.textContent = `${values.protein}g`;
  quickCarbs.textContent = `${values.carbs}g`;
  quickFats.textContent = `${values.fats}g`;
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
}

/* =========================
   CALORIE GOAL CALCULATOR
   ========================= */

function calculateCalories() {
  const age = Number(document.getElementById("calcAge")?.value);
  const weight = Number(document.getElementById("calcWeight")?.value);
  const height = Number(document.getElementById("calcHeight")?.value);
  const gender = document.getElementById("calcGender")?.value;
  const goal = document.getElementById("calcGoal")?.value;

  if (!age || !weight || !height || !gender || !goal) {
    alert("Please fill all fields");
    return;
  }

  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const maintenance = Math.round(bmr * 1.55);

  let target = maintenance;
  if (goal === "fat_loss") target = maintenance - 400;
  if (goal === "muscle_gain") target = maintenance + 300;

  updateText("maintainCalories", `${maintenance} kcal`);
  updateText("targetCalories", `${target} kcal`);

  const targetInput = document.getElementById("dailyCalorieTarget");
  if (targetInput) targetInput.value = target;

  const profile = getUserProfile();
  profile.weight = weight;
  profile.height = height;
  profile.goal = goal;
  saveUserProfile(profile);
}

/* =========================
   NUTRITION PAGE
   ========================= */

function setupNutritionPage() {
  const goal = document.getElementById("nutritionGoal");
  const diet = document.getElementById("dietType");
  const button = document.getElementById("generateNutritionPlanBtn");

  if (!goal || !diet) return;

  const profile = getUserProfile();
  if (profile.goal) goal.value = profile.goal;
  if (profile.diet) diet.value = profile.diet;

  goal.addEventListener("change", renderNutritionPageContent);
  diet.addEventListener("change", renderNutritionPageContent);

  if (button) {
    button.addEventListener("click", renderNutritionPageContent);
  }
}

function renderNutritionPageContent() {
  const goalSelect = document.getElementById("nutritionGoal");
  const dietSelect = document.getElementById("dietType");

  if (!goalSelect || !dietSelect) return;

  const goal = goalSelect.value;
  const diet = dietSelect.value;

  const profile = getUserProfile();
  profile.goal = goal;
  profile.diet = diet;
  saveUserProfile(profile);

  const weight = profile.weight || 70;
  let proteinGrams = Math.round(weight * 1.6);
  let calories = Math.round(weight * 30);

  const goalMap = {
    fat_loss: {
      protein: "1.8-2.2 g/kg",
      carbs: "Moderate",
      fats: "Moderate-Low",
      water: "3-4 L",
      calorie: "Stay in calorie deficit with high satiety foods.",
      proteinText: "High protein to preserve muscle.",
      carbText: "Control carbs, focus around workouts.",
      fatText: "Moderate fats from healthy sources."
    },
    muscle_gain: {
      protein: "1.6-2.0 g/kg",
      carbs: "High",
      fats: "Moderate",
      water: "3-4.5 L",
      calorie: "Calorie surplus for growth.",
      proteinText: "Consistent protein intake.",
      carbText: "High carbs for performance.",
      fatText: "Moderate fats for hormones."
    },
    body_recomp: {
      protein: "2.0-2.2 g/kg",
      carbs: "Moderate",
      fats: "Moderate",
      water: "3-4 L",
      calorie: "Maintenance calories with high protein.",
      proteinText: "Very high protein needed.",
      carbText: "Balanced carbs.",
      fatText: "Balanced fats."
    },
    maintain: {
      protein: "1.6-2.0 g/kg",
      carbs: "Balanced",
      fats: "Balanced",
      water: "2.5-3.5 L",
      calorie: "Maintain stable intake.",
      proteinText: "Consistent intake.",
      carbText: "Balanced carbs.",
      fatText: "Balanced fats."
    }
  };

  if (goal === "fat_loss") {
    proteinGrams = Math.round(weight * 2.0);
    calories -= 400;
  }
  if (goal === "muscle_gain") {
    proteinGrams = Math.round(weight * 1.8);
    calories += 400;
  }
  if (goal === "body_recomp") {
    proteinGrams = Math.round(weight * 2.2);
  }
  if (goal === "maintain") {
    proteinGrams = Math.round(weight * 1.6);
  }

  const meals = {
    vegetarian: {
      fat_loss: [
        { title: "Breakfast", text: "Oats with skim milk and fruit." },
        { title: "Lunch", text: "Rice, dal, salad, paneer (controlled)." },
        { title: "Dinner", text: "Roti, sabzi, curd." },
        { title: "Snack", text: "Fruit or roasted chana." },
        { title: "Pre-Workout", text: "Banana or coffee." },
        { title: "Post-Workout", text: "Low-fat milk or paneer." }
      ],
      muscle_gain: [
        { title: "Breakfast", text: "Oats, milk, banana, peanut butter." },
        { title: "Lunch", text: "Rice, dal, paneer, curd." },
        { title: "Dinner", text: "Roti, sabzi, paneer bhurji." },
        { title: "Snack", text: "Fruits + nuts." },
        { title: "Pre-Workout", text: "Banana + bread." },
        { title: "Post-Workout", text: "Milk or protein shake." }
      ],
      body_recomp: [
        { title: "Breakfast", text: "Oats + milk + fruit." },
        { title: "Lunch", text: "Rice, dal, paneer (moderate)." },
        { title: "Dinner", text: "Roti, sabzi, curd." },
        { title: "Snack", text: "Fruit or sprouts." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Milk or paneer." }
      ],
      maintain: [
        { title: "Breakfast", text: "Oats + milk." },
        { title: "Lunch", text: "Rice, dal, paneer." },
        { title: "Dinner", text: "Roti, sabzi." },
        { title: "Snack", text: "Fruit or nuts." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Milk." }
      ]
    },

    vegan: {
      fat_loss: [
        { title: "Breakfast", text: "Oats + soy milk." },
        { title: "Lunch", text: "Rice, dal, tofu." },
        { title: "Dinner", text: "Roti + vegetables." },
        { title: "Snack", text: "Fruit or sprouts." },
        { title: "Pre-Workout", text: "Dates." },
        { title: "Post-Workout", text: "Soy milk." }
      ],
      muscle_gain: [
        { title: "Breakfast", text: "Oats + soy milk + nuts." },
        { title: "Lunch", text: "Rice + tofu + dal." },
        { title: "Dinner", text: "Roti + soy chunks." },
        { title: "Snack", text: "Peanuts or fruit." },
        { title: "Pre-Workout", text: "Banana + peanut butter." },
        { title: "Post-Workout", text: "Soy protein shake." }
      ],
      body_recomp: [
        { title: "Breakfast", text: "Oats + soy milk." },
        { title: "Lunch", text: "Rice + tofu." },
        { title: "Dinner", text: "Roti + vegetables." },
        { title: "Snack", text: "Fruit." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Soy milk." }
      ],
      maintain: [
        { title: "Breakfast", text: "Oats + soy milk." },
        { title: "Lunch", text: "Rice + dal." },
        { title: "Dinner", text: "Roti + vegetables." },
        { title: "Snack", text: "Fruit." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Soy milk." }
      ]
    },

    non_vegetarian: {
      fat_loss: [
        { title: "Breakfast", text: "Eggs + fruit." },
        { title: "Lunch", text: "Rice + chicken + salad." },
        { title: "Dinner", text: "Roti + fish/chicken." },
        { title: "Snack", text: "Boiled eggs." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Eggs or chicken." }
      ],
      muscle_gain: [
        { title: "Breakfast", text: "Eggs + bread + milk." },
        { title: "Lunch", text: "Rice + chicken + dal." },
        { title: "Dinner", text: "Roti + chicken/fish." },
        { title: "Snack", text: "Eggs or nuts." },
        { title: "Pre-Workout", text: "Banana + toast." },
        { title: "Post-Workout", text: "Chicken + rice." }
      ],
      body_recomp: [
        { title: "Breakfast", text: "Eggs + oats." },
        { title: "Lunch", text: "Rice + chicken." },
        { title: "Dinner", text: "Roti + fish." },
        { title: "Snack", text: "Eggs or fruit." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Eggs or milk." }
      ],
      maintain: [
        { title: "Breakfast", text: "Eggs + bread." },
        { title: "Lunch", text: "Rice + chicken." },
        { title: "Dinner", text: "Roti + fish." },
        { title: "Snack", text: "Fruit." },
        { title: "Pre-Workout", text: "Banana." },
        { title: "Post-Workout", text: "Milk." }
      ]
    }
  };

  const supplements = [
    {
      name: "Whey Protein",
      about: "Convenient way to increase daily protein intake, especially around workouts or when meals are low in protein.",
      use: "Best for people struggling to reach protein targets from food alone.",
      dose: "Usually 1 scoop as needed.",
      timing: "Any time, commonly post-workout or between meals.",
      caution: "Optional. Whole food protein is still the priority."
    },
    {
      name: "Creatine Monohydrate",
      about: "Supports strength, performance, recovery, and muscle fullness.",
      use: "Useful for resistance training, strength work, and muscle gain phases.",
      dose: "3-5 g daily.",
      timing: "Any time daily, consistency matters more than timing.",
      caution: "Drink enough water. Choose plain creatine monohydrate."
    },
    {
      name: "Multivitamin",
      about: "General micronutrient support when diet quality is inconsistent.",
      use: "Helpful as backup support, not a replacement for fruits and vegetables.",
      dose: "As directed on label.",
      timing: "Usually with a meal.",
      caution: "Avoid megadoses unless prescribed."
    },
    {
      name: "Omega-3",
      about: "Supports general health, inflammation management, and recovery.",
      use: "Useful if fatty fish intake is low.",
      dose: "As directed on product.",
      timing: "With meals.",
      caution: "Check product quality and consult if on medication."
    },
    {
      name: "Vitamin D",
      about: "Supports bones, recovery, and general health.",
      use: "Useful if sun exposure is low or deficiency is common.",
      dose: "As advised by doctor or product guidance.",
      timing: "With a meal.",
      caution: "Do not overuse without testing or guidance."
    },
    {
      name: "Vitamin B12",
      about: "Important for energy metabolism and nervous system support.",
      use: "Especially relevant for vegetarian and vegan diets.",
      dose: "As directed on product.",
      timing: "Any convenient time.",
      caution: "More relevant when intake from animal foods is low."
    }
  ];

  const selectedGoal = goalMap[goal];
  if (!selectedGoal) return;

  updateText("nutritionProtein", `${proteinGrams}g`);
  updateText("nutritionCarbs", selectedGoal.carbs);
  updateText("nutritionFats", selectedGoal.fats);
  updateText("nutritionWater", selectedGoal.water);
  updateText("nutritionCalories", `${calories} kcal`);

  updateText("nutritionCalorieStrategy", selectedGoal.calorie);
  updateText("nutritionProteinStrategy", selectedGoal.proteinText);
  updateText("nutritionCarbStrategy", selectedGoal.carbText);
  updateText("nutritionFatStrategy", selectedGoal.fatText);

  const mealGrid = document.getElementById("mealSuggestionsGrid");
  if (mealGrid) {
    const selectedMeals = meals[diet]?.[goal] || [];
    mealGrid.innerHTML = selectedMeals.map((meal) => `
      <div class="meal-suggestion-card">
        <h4>${escapeHtml(meal.title)}</h4>
        <p>${escapeHtml(meal.text)}</p>
      </div>
    `).join("");
  }

  const supplementGrid = document.getElementById("supplementGrid");
  if (supplementGrid) {
    supplementGrid.innerHTML = supplements.map((supp) => `
      <div class="supplement-card">
        <h4>${escapeHtml(supp.name)}</h4>
        <p>${escapeHtml(supp.about)}</p>
        <div class="supplement-meta">
          <span><strong>Use:</strong> ${escapeHtml(supp.use)}</span>
          <span><strong>Dose:</strong> ${escapeHtml(supp.dose)}</span>
          <span><strong>Timing:</strong> ${escapeHtml(supp.timing)}</span>
          <span><strong>Caution:</strong> ${escapeHtml(supp.caution)}</span>
        </div>
      </div>
    `).join("");
  }
}

/* =========================
   RECOVERY PAGE
   ========================= */

function setupRecoveryPage() {
  const button = document.getElementById("generateRecoveryPlanBtn");
  const inputs = [
    "recoveryArea",
    "recoveryPainLevel",
    "recoveryType",
    "recoveryPhase",
    "sleepHours",
    "activityReadiness",
    "flagSharpPain",
    "flagSwelling",
    "flagNumbness",
    "flagInstability",
    "flagLongPain"
  ];

  if (button) {
    button.addEventListener("click", renderRecoveryPlanContent);
  }

  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", renderRecoveryPlanContent);
  });
}

function renderRecoveryPlanContent() {
  const area = document.getElementById("recoveryArea")?.value;
  const painLevel = Number(document.getElementById("recoveryPainLevel")?.value || 1);
  const issueType = document.getElementById("recoveryType")?.value;
  const phase = document.getElementById("recoveryPhase")?.value;
  const sleep = document.getElementById("sleepHours")?.value;
  const readiness = document.getElementById("activityReadiness")?.value;

  if (!area || !issueType || !phase || !sleep || !readiness) return;

  const redFlags = {
    sharpPain: document.getElementById("flagSharpPain")?.checked || false,
    swelling: document.getElementById("flagSwelling")?.checked || false,
    numbness: document.getElementById("flagNumbness")?.checked || false,
    instability: document.getElementById("flagInstability")?.checked || false,
    longPain: document.getElementById("flagLongPain")?.checked || false
  };

  const redFlagCount = Object.values(redFlags).filter(Boolean).length;

  const areaContent = getRecoveryAreaContent(area);
  const basePlan = getRecoveryBasePlan(issueType, phase, painLevel, readiness, sleep, redFlagCount);

  updateText("recoveryDoToday", `${basePlan.doToday} ${areaContent.doToday}`);
  updateText("recoveryAvoidToday", `${basePlan.avoidToday} ${areaContent.avoidToday}`);
  updateText("recoveryMobilityToday", `${basePlan.mobility} ${areaContent.mobility}`);
  updateText("recoveryReturnTraining", `${basePlan.returnTraining} ${areaContent.returnTraining}`);
  updateText("recoveryReduceExercises", areaContent.reduceExercises);
  updateText("recoveryAlternativeExercises", areaContent.alternatives);

  const sleepSupport = getSleepSupportText(sleep);
  const trainingStatus = getTrainingStatusText(readiness, painLevel, redFlagCount);

  const score = calculateRecoveryScore(painLevel, sleep, readiness, redFlagCount);
  const status = getRecoveryStatus(score);

  localStorage.setItem("recoveryScore", String(score));

  updateText("recoveryScoreText", `${score}/100`);
  updateText("recoveryStatusText", status);
  updateText("sleepSupportText", sleepSupport);
  updateText("trainingStatusText", trainingStatus);

  updateRecoveryAlertBox(redFlagCount, redFlags);

  const bar = document.getElementById("recoveryReadinessBar");
  const text = document.getElementById("recoveryReadinessText");
  if (bar) bar.style.width = `${Math.max(12, score)}%`;
  if (text) text.textContent = status;
}

function getRecoveryBasePlan(issueType, phase, painLevel, readiness, sleep, redFlagCount) {
  let doToday = "Use a calm, controlled recovery day with hydration, protein intake, and pain-aware movement.";
  let avoidToday = "Avoid forcing painful ranges, sudden explosive work, and ego lifting.";
  let mobility = "Use gentle mobility and low-stress movement instead of aggressive stretching.";
  let returnTraining = "Return gradually and keep 1-2 reps in reserve until symptoms clearly improve.";

  if (issueType === "soreness") {
    doToday = "Focus on light movement, easy walking, hydration, and recovery meals.";
    mobility = "Use gentle stretching, light mobility, and easy range-of-motion work.";
  }

  if (issueType === "strain") {
    doToday = "Reduce load, use controlled movement, and keep effort conservative.";
    avoidToday = "Avoid aggressive loading, fast tempo work, and painful repetition.";
  }

  if (issueType === "joint_pain") {
    doToday = "Prioritize joint-friendly movement, support work, and reduced range if needed.";
    avoidToday = "Avoid unstable, deep, or high-impact positions that provoke symptoms.";
  }

  if (issueType === "stiffness") {
    doToday = "Use repeated light mobility sessions through the day and longer warm-up time.";
    mobility = "Use low-intensity mobility, positional breathing, and easy movement prep.";
  }

  if (issueType === "mobility_limit") {
    doToday = "Train around restrictions and improve comfort before pushing intensity.";
    mobility = "Use assisted range-of-motion work and movement pattern practice.";
  }

  if (phase === "acute") {
    doToday += " In the acute phase, protect the area and keep recovery conservative.";
    returnTraining = "Use rest, walking, or very light recovery work until pain clearly settles.";
  }

  if (phase === "improving") {
    doToday += " Since symptoms are improving, gradually reintroduce safe movement.";
    returnTraining = "Use controlled volume and lower loads while checking symptoms daily.";
  }

  if (phase === "return_training") {
    returnTraining = "Return with reduced intensity, good form, and stop if symptoms sharply worsen.";
  }

  if (painLevel >= 7) {
    doToday += " Pain is high, so prioritize recovery over performance today.";
    avoidToday += " Heavy training is not advised at this pain level.";
  }

  if (readiness === "full_rest") {
    returnTraining = "Take a full rest day or only perform light walking and gentle mobility.";
  }

  if (readiness === "light_only") {
    returnTraining = "Use only light activity such as walking, mobility, or easy machine work.";
  }

  if (readiness === "modified_training") {
    returnTraining = "Modified training is possible: reduce load, avoid pain triggers, and shorten volume.";
  }

  if (readiness === "almost_normal") {
    returnTraining = "You may train close to normal, but avoid painful movement and monitor next-day response.";
  }

  if (sleep === "lt6") {
    doToday += " Sleep recovery is low, so reduce training stress and prioritize earlier sleep tonight.";
  }

  if (redFlagCount > 0) {
    doToday = "One or more red flags are present. Reduce training stress and prioritize professional evaluation if symptoms persist.";
    avoidToday = "Avoid pushing through pain, testing limits, or using heavy compound exercises until symptoms are clearer.";
    returnTraining = "Use only symptom-free light movement unless cleared to progress.";
  }

  return { doToday, avoidToday, mobility, returnTraining };
}

function getRecoveryAreaContent(area) {
  const content = {
    shoulder: {
      doToday: "Use controlled shoulder range, scapular movement, and avoid unstable pressing.",
      avoidToday: "Avoid overhead pressing, painful lateral raises, deep dips, and aggressive chest work.",
      mobility: "Use wall slides, band external rotation, and light scapular control drills.",
      returnTraining: "Reintroduce pressing slowly and prefer stable machine or incline patterns first.",
      reduceExercises: "Overhead Press, Heavy Bench Press, Deep Dips, Upright Rows.",
      alternatives: "Machine Chest Press, Cable Fly (pain-free range), External Rotations, Scaption Raises."
    },
    knee: {
      doToday: "Use pain-free lower body range and emphasize controlled tempo.",
      avoidToday: "Avoid deep painful squats, jumping, sprinting, and unstable pivots.",
      mobility: "Use quad/hamstring warm-up, glute activation, and easy knee-friendly mobility.",
      returnTraining: "Return with reduced squat depth and prioritize pain-free patterns.",
      reduceExercises: "Deep Squats, Jump Lunges, Box Jumps, High-Impact Running.",
      alternatives: "Leg Press (comfortable range), Glute Bridges, Hamstring Curl, Step-Ups (controlled)."
    },
    lower_back: {
      doToday: "Keep the spine calm, brace well, and use low-stress movement patterns.",
      avoidToday: "Avoid heavy hinging, rounded-back pulling, and explosive spinal loading.",
      mobility: "Use breathing drills, bird dog, dead bug, and gentle hip mobility.",
      returnTraining: "Reintroduce hinges gradually only when you can brace and move without symptom increase.",
      reduceExercises: "Heavy Deadlifts, Good Mornings, Bent-Over Rows, Max Squats.",
      alternatives: "Bird Dog, Dead Bug, Leg Press, Supported Rows, Split Squats."
    },
    wrist: {
      doToday: "Use neutral grip positions and reduce direct wrist strain.",
      avoidToday: "Avoid painful push-up positions, heavy curls, and extended wrist loading.",
      mobility: "Use gentle wrist circles and light mobility without forcing end range.",
      returnTraining: "Return with neutral-grip exercises and stable handles where possible.",
      reduceExercises: "Push-Ups on Flat Palm, Heavy Barbell Curls, Wrist-Loaded Front Rack.",
      alternatives: "Neutral-Grip Dumbbells, Machine Press, Cable Work, Forearm Mobility."
    },
    ankle: {
      doToday: "Use controlled foot loading and low-impact movement.",
      avoidToday: "Avoid sprinting, jumping, hard landings, and unstable change of direction.",
      mobility: "Use calf mobility, ankle circles, and gentle dorsiflexion work.",
      returnTraining: "Rebuild with low-impact patterns before returning to explosive lower body work.",
      reduceExercises: "Sprints, Box Jumps, Broad Jumps, High-Impact Conditioning.",
      alternatives: "Bike, Leg Press, Seated Lower Body Work, Controlled Calf Raises."
    },
    general: {
      doToday: "Use active recovery, hydration, easy walking, and a lighter training day.",
      avoidToday: "Avoid max-effort sets, junk volume, and poor recovery habits.",
      mobility: "Use full-body mobility, breathing work, and light stretching.",
      returnTraining: "Return based on soreness reduction and overall readiness.",
      reduceExercises: "Max Lifts, Failure Sets, Extra Volume, High Fatigue Finishers.",
      alternatives: "Walking, Light Mobility, Easy Pump Work, Reduced-Load Technique Sets."
    }
  };

  return content[area] || content.general;
}

function getSleepSupportText(sleep) {
  const map = {
    lt6: "Low sleep support",
    "6to7": "Moderate sleep support",
    "7to9": "Good sleep support",
    gt9: "Strong sleep support"
  };

  return map[sleep] || "Moderate sleep support";
}

function getTrainingStatusText(readiness, painLevel, redFlagCount) {
  if (redFlagCount > 0) return "Medical caution";
  if (painLevel >= 8) return "Do not push training";

  const map = {
    full_rest: "Full rest advised",
    light_only: "Light activity only",
    modified_training: "Modified training",
    almost_normal: "Near normal training"
  };

  return map[readiness] || "Modified training";
}

function calculateRecoveryScore(painLevel, sleep, readiness, redFlagCount) {
  let score = 100;

  score -= painLevel * 6;
  score -= redFlagCount * 12;

  if (sleep === "lt6") score -= 18;
  if (sleep === "6to7") score -= 8;
  if (sleep === "7to9") score += 0;
  if (sleep === "gt9") score -= 2;

  if (readiness === "full_rest") score -= 20;
  if (readiness === "light_only") score -= 12;
  if (readiness === "modified_training") score -= 6;
  if (readiness === "almost_normal") score += 0;

  if (score < 5) score = 5;
  if (score > 100) score = 100;

  return score;
}

function getRecoveryStatus(score) {
  if (score >= 80) return "Good Readiness";
  if (score >= 60) return "Moderate Readiness";
  if (score >= 40) return "Low Readiness";
  return "Recovery Priority";
}

function updateRecoveryAlertBox(redFlagCount, redFlags) {
  const box = document.getElementById("recoveryAlertBox");
  if (!box) return;

  if (redFlagCount === 0) {
    box.textContent = "No major alerts selected. Continue with symptom-aware recovery and gradual progression.";
    return;
  }

  const activeFlags = [];

  if (redFlags.sharpPain) activeFlags.push("sharp pain");
  if (redFlags.swelling) activeFlags.push("swelling");
  if (redFlags.numbness) activeFlags.push("numbness or tingling");
  if (redFlags.instability) activeFlags.push("joint instability");
  if (redFlags.longPain) activeFlags.push("long-lasting pain");

  box.textContent = `Red flag alert: ${activeFlags.join(", ")}. Reduce training load and consider professional assessment, especially if symptoms are worsening.`;
}

/* =========================
   HELPERS
   ========================= */

function updateText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
/* =========================
   AUTH HELPERS
   ========================= */

function getStoredUsers() {
  return JSON.parse(localStorage.getItem("habitxUsers")) || [];
}

function saveStoredUsers(users) {
  localStorage.setItem("habitxUsers", JSON.stringify(users));
}

function registerUser(fullName, username, password) {
  const users = getStoredUsers();

  const alreadyExists = users.some(
    (user) => (user.username || "").toLowerCase() === username.toLowerCase()
  );

  if (alreadyExists) {
    return { ok: false, message: "Username already exists." };
  }

  users.push({
    id: Date.now(),
    fullName,
    username,
    password
  });

  saveStoredUsers(users);

  return { ok: true, message: "Account created successfully." };
}

function loginUser(username, password) {
  const users = getStoredUsers();

  const foundUser = users.find(
    (user) =>
      (user.username || "").toLowerCase() === username.toLowerCase() &&
      user.password === password
  );

  if (!foundUser) {
    return { ok: false, message: "Invalid username or password." };
  }

  localStorage.setItem("habitxLoggedIn", "true");

  localStorage.setItem(
    "habitxUser",
    JSON.stringify({
      fullName: foundUser.fullName,
      username: foundUser.username
    })
  );

  return { ok: true, message: "Login successful." };
}

function resetPassword() {
  const usernameInput = document.getElementById("resetUsername");
  const passwordInput = document.getElementById("newPassword");
  const message = document.getElementById("resetMessage");

  if (!usernameInput || !passwordInput || !message) return;

  const username = usernameInput.value.trim();
  const newPassword = passwordInput.value.trim();

  if (!username || !newPassword) {
    message.style.color = "#ff9db5";
    message.textContent = "Please enter username and new password.";
    return;
  }

  const users = getStoredUsers();

  const foundUser = users.find(
    (user) => (user.username || "").toLowerCase() === username.toLowerCase()
  );

  if (!foundUser) {
    message.style.color = "#ff9db5";
    message.textContent = "User not found.";
    return;
  }

  foundUser.password = newPassword;
  saveStoredUsers(users);

  message.style.color = "#7cffb2";
  message.textContent = "Password reset successful. You can login now.";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
}