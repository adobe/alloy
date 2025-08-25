console.log("HELLO FROM PUSH NOTIFICATIONS SERVICE WORKER");

// Make sure you have basic event listeners
self.addEventListener("install", (event) => {
  console.log("PUSH NOTIFICATIONS SERVICE WORKER INSTALLED");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("PUSH NOTIFICATIONS SERVICE WORKER ACTIVATED");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push received:", event);
});
