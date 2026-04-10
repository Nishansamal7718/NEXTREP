document.addEventListener("DOMContentLoaded", () => {
  setupAuth();
});

function setupAuth() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  initializeDefaultUser();

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      const result = loginUser(username, password);

      if (result.ok) {
        window.location.href = "dashboard.html";
      } else {
        alert(result.message);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullName = document.getElementById("signupFullName").value.trim();
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value.trim();

      if (fullName.length < 2 || username.length < 3 || password.length < 3) {
        alert("Please enter valid details.");
        return;
      }

      const result = registerUser(fullName, username, password);

      if (!result.ok) {
        alert(result.message);
        return;
      }

      localStorage.setItem("habitxLoggedIn", "false");

      alert("Account created successfully. Please login.");
      switchToLogin();

      const loginUsername = document.getElementById("loginUsername");
      if (loginUsername) {
        loginUsername.value = username;
      }

      signupForm.reset();
    });
  }
}

function initializeDefaultUser() {
  const users = JSON.parse(localStorage.getItem("habitxUsers")) || [];

  if (!users.length) {
    const demoUser = {
      id: Date.now(),
      fullName: "Demo User",
      username: "DEV",
      password: "1234"
    };

    localStorage.setItem("habitxUsers", JSON.stringify([demoUser]));

    localStorage.setItem(
      "habitxUser",
      JSON.stringify({
        fullName: demoUser.fullName,
        username: demoUser.username
      })
    );
  }
}

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

  const newUser = {
    id: Date.now(),
    fullName,
    username,
    password
  };

  users.push(newUser);
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

function switchToSignup() {
  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");

  if (loginView) loginView.classList.remove("active");
  if (signupView) signupView.classList.add("active");
}

function switchToLogin() {
  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");

  if (signupView) signupView.classList.remove("active");
  if (loginView) loginView.classList.add("active");
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
}