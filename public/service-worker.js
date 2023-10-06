self.addEventListener("push", function (event) {
  const data = event.data.json();

  var options = {
    body: data.message,
    data: {
      url: data.url,
    },
    // You can add more options like icons, actions, etc. For example:
    // icon: 'path-to-icon.png',
    // badge: 'path-to-badge.png',
    // actions: [
    //   {action: 'explore', title: 'Explore', icon: 'path-to-icon.png'}
    // ]
  };

  event.waitUntil(
    self.registration.showNotification("Tu panel doxadoctor!", options)
  );
});

// Handle the 'notificationclick' event - triggered when a notification is clicked
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Close the notification

  // Handle the click action here. For instance, open a specific URL:
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
