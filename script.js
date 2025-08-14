// Queue class implementation
class Queue {
  constructor() {
    this.items = [];
  }

  // Add element to the rear of queue
  enqueue(element) {
    this.items.push(element);
  }

  // Remove element from the front of queue
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  // Get the front element without removing it
  front() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  // Check if queue is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Get the size of queue
  size() {
    return this.items.length;
  }

  // Get all items in queue
  getItems() {
    return [...this.items];
  }

  // Clear the queue
  clear() {
    this.items = [];
  }

  // Filter items based on condition
  filter(callback) {
    this.items = this.items.filter(callback);
  }
}

// Simple user credentials for validation
const validUsers = {
  "admin@test.com": "admin123",
  "demo@demo.com": "demo123",
};

// Rate limiting queue and variables
let requestQueue = new Queue();
const MAX_REQUESTS = 5;
const TIME_WINDOW = 60000; // 1 minute in milliseconds
let currentUser = null;

// DOM elements
const loginPage = document.getElementById("loginPage");
const messagingPage = document.getElementById("messagingPage");
const loginForm = document.getElementById("loginForm");
const messageForm = document.getElementById("messageForm");
const loginMessage = document.getElementById("loginMessage");
const messageResponse = document.getElementById("messageResponse");
const logoutBtn = document.getElementById("logoutBtn");

// Rate limit display elements
const requestCountEl = document.getElementById("requestCount");
const queueLengthEl = document.getElementById("queueLength");
const queueDebugEl = document.getElementById("queueDebug");

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Login form handler
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Simple validation using if-then logic
    if (validUsers[email] && validUsers[email] === password) {
      currentUser = email;
      showMessage(loginMessage, "Login successful! Redirecting...", "success");

      setTimeout(() => {
        loginPage.classList.add("hidden");
        messagingPage.classList.remove("hidden");
        updateRateLimitDisplay();
      }, 1000);
    } else {
      showMessage(
        loginMessage,
        "Invalid email or password. Try: demo@demo.com / demo123",
        "error"
      );
    }
  });

  // Message form handler
  messageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const messageText = document.getElementById("messageText").value;

    if (checkRateLimit()) {
      showMessage(messageResponse, "Message sent successfully!", "success");
      document.getElementById("messageText").value = "";
    } else {
      showMessage(
        messageResponse,
        "Rate limit exceeded! Please wait before sending another message.",
        "error"
      );
    }

    updateRateLimitDisplay();
  });

  // Logout handler
  logoutBtn.addEventListener("click", function () {
    currentUser = null;
    requestQueue.clear();

    // Clear forms
    loginForm.reset();
    messageForm.reset();

    // Clear messages
    loginMessage.innerHTML = "";
    messageResponse.innerHTML = "";

    // Switch pages
    messagingPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
  });

  // Update rate limit display every second
  setInterval(updateRateLimitDisplay, 1000);
});

// Rate limiting function using queue approach
function checkRateLimit() {
  const currentTime = Date.now();

  if (requestQueue.size() < MAX_REQUESTS) {
    requestQueue.enqueue(currentTime);
    return true;
  }

  const oldestRequest = requestQueue.front();
  const timeDifference = currentTime - oldestRequest;

  if (timeDifference >= TIME_WINDOW) {
    requestQueue.dequeue();
    requestQueue.enqueue(currentTime);
    return true;
  }

  return false;
}

// Update rate limit display
function updateRateLimitDisplay() {
  const currentTime = Date.now();

  requestCountEl.textContent = requestQueue.size();
  queueLengthEl.textContent = requestQueue.size();

  queueDebugEl.innerHTML = "";

  const queueItems = requestQueue.getItems();
  if (queueItems.length === 0) {
    queueDebugEl.innerHTML = '<div class="queue-item">Queue is empty</div>';
  } else {
    queueItems.forEach((timestamp, index) => {
      const timeAgo = Math.round((currentTime - timestamp) / 1000);
      const remaining = Math.max(
        0,
        Math.ceil((TIME_WINDOW - (currentTime - timestamp)) / 1000)
      );

      const queueItem = document.createElement("div");
      queueItem.className = "queue-item";

      // Highlight the oldest request
      if (index === 0) {
        queueItem.classList.add("oldest-request");
        queueItem.textContent = `Oldest (controls limit) → ${timeAgo}s ago (expires in ${remaining}s)`;
      } else {
        queueItem.textContent = `Request ${
          index + 1
        }: ${timeAgo}s ago (expires in ${remaining}s)`;
      }

      queueDebugEl.appendChild(queueItem);
    });
  }
}

// Utility function to show messages
function showMessage(element, message, type) {
  element.innerHTML = `<div class="${type}">${message}</div>`;
  setTimeout(() => {
    element.innerHTML = "";
  }, 5000);
}
