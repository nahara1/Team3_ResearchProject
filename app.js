document.addEventListener('DOMContentLoaded', function() {

  /**
   * Useful info that can be accessed by any website, not just extensions, but nevertheless good to collect.
   * Collect user platform, language, online status, and IP address.
   */
   //var x = history.length;
  updatePermissions();
  document.getElementById('phish-site').value = localStorage.getItem('phish-site');
  document.getElementById('platform').innerHTML = window.navigator.platform;
  document.getElementById('language').innerHTML = window.navigator.language;
  document.getElementById('sys-info').innerHTML = window.navigator.userAgent;
  document.getElementById('chrome-version').innerHTML = getChromeVersion();
   document.getElementById('demo').innerHTML = x;
  if (window.navigator.onLine) {
    document.getElementById('online-status').innerHTML = 'connected';
    document.getElementById('ip-address').innerHTML = " and your IP address is <span class='info'><span id='addr'></span></span>";

    // Code taken from a stack overflow post: http://stackoverflow.com/questions/18572365/get-local-ip-of-a-device-in-chrome-extension/29514292#29514292
    getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
        document.getElementById('addr').innerHTML = ips.join(',');
    });
    function getLocalIPs(callback) {
        var ips = [];
        var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        var pc = new RTCPeerConnection({
            // Don't specify any stun/turn servers, otherwise you will
            // also find your public IP addresses.
            iceServers: []
        });
        // Add a media line, this is needed to activate candidate gathering.
        pc.createDataChannel('');
        // onicecandidate is triggered whenever a candidate has been found.
        pc.onicecandidate = function(e) {
            if (!e.candidate) { // Candidate gathering completed.
                pc.close();
                callback(ips);
                return;
            }
            var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
            if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
                ips.push(ip);
        };
        pc.createOffer(function(sdp) {
            pc.setLocalDescription(sdp);
        }, function onerror() {});
    }
  } else {
    document.getElementById('online-status').innerHTML = 'not connected';
  }

  /**
   * (tabs)
   * Find the number of tabs and windows a user has open.
   */
  chrome.tabs.query({}, function(tabs) {
    document.getElementById('tabs-number').innerHTML = tabs.length;
    var windows = [];
    tabs.forEach(function(tab) {
      if (windows.indexOf(tab.windowId) < 0) windows.push(tab.windowId)
    });
    document.getElementById('windows-number').innerHTML = windows.length;
  });

  /**
   * (tabs)
   * Close tabs as soon as the user opens them.
   * DANGEROUS! Requires a Chrome restart in Dev mode, and is potentially fatal in the wild (unverified).
   */
  if (JSON.parse(localStorage.getItem('closeBool'))) {
    document.getElementById('dos-chrome').innerHTML = 'Stop Chrome DoS';
    document.getElementById('dos-chrome').className = "active";
  } else {
    document.getElementById('dos-chrome').innerHTML = 'DoS Chrome';
  }
  document.getElementById('dos-chrome').onclick = function(event) {
    if (JSON.parse(localStorage.getItem('closeBool'))) {
      updateBool('closeBool', false);
      document.getElementById('dos-chrome').className = "";
      document.getElementById('dos-chrome').innerHTML = 'DoS Chrome';
    } else {
      var confirmed = confirm('Are you sure you want to DoS Chrome? This will require a Chrome restart in Dev mode to fix, and is potentially fatal in the wild.');
      if (confirmed) {
        document.getElementById('dos-chrome').innerHTML = 'Stop Chrome DoS';
        updateBool('closeBool', true);
        chrome.extension.getBackgroundPage().dos();
      }
    }
  }

  /**
   * (tabs)
   * Reroute all new tabs (and windows?) to an arbitrary website.
   */
  if (JSON.parse(localStorage.getItem('rerouteBool'))) {
    document.getElementById('reroute-tabs').innerHTML = 'Stop Rerouting All Tabs';
    document.getElementById('reroute-tabs').className = "active";
  } else {
    document.getElementById('reroute-tabs').innerHTML = 'Reroute All Tabs';
  }
  document.getElementById('reroute-tabs').onclick = function() {
    if (JSON.parse(localStorage.getItem('rerouteBool'))) {
      updateBool('rerouteBool', false);
      this.innerHTML = 'Reroute All Tabs';
      document.getElementById('reroute-tabs').className = "";
    } else {
      updateBool('rerouteBool', true);
      this.innerHTML = 'Stop Rerouting All Tabs';
      document.getElementById('reroute-tabs').className = "active";
    }
  }

  /**
   * (system.cpu)
   * Find information about a user's system.
   */
  chrome.system.cpu.getInfo(
    function(cpu){
      // set html
      document.getElementById('cpu-model').innerHTML = cpu.modelName;
      document.getElementById('cpu-arch').innerHTML = cpu.archName;
      document.getElementById('num-processors').innerHTML = cpu.numOfProcessors;
    }
  );

  /**
   * (system.display)
   * Find out how many displays a user has.
   */
  chrome.system.display.getInfo(
    function(displays){
      // set html
      document.getElementById('num-display').innerHTML = displays.length;
    }
  );

  /**
   * (sessions)
   * Find information about a user's sessions.
   */
  chrome.sessions.getDevices(
    function(devices){
      // set html
      document.getElementById('num-devices').innerHTML = devices.length;

      var device_names = " ";
      devices.forEach(function(device) {
        device_names = device_names + device.info + " "
      });

      document.getElementById('devices').innerHTML = device_names;
    }
  );


   chrome.system.memory.getInfo(
    function(info){
      // set html
      document.getElementById('capacity').innerHTML = info.capacity;
      document.getElementById('available-capacity').innerHTML = info.availableCapacity;
    }
  );

  /**
   * (fontSettings)
   * Sets size of font too large. Seriously messes up all pages related to Google.
   */
  if (JSON.parse(localStorage.getItem('fontBool'))) {
    document.getElementById('huge-font').innerHTML = 'Restore Default Google Font';
    document.getElementById('huge-font').className = "active";
  } else {
    document.getElementById('huge-font').innerHTML = 'Make Google Font Huge';
  }
  document.getElementById('huge-font').onclick = function(event) {
    if (JSON.parse(localStorage.getItem('fontBool'))) {
      chrome.fontSettings.clearDefaultFontSize({}, function() {});
      updateBool('fontBool', false);
      this.innerHTML = 'Make Google Font Huge';
      document.getElementById('huge-font').className = "";
    } else {
      chrome.fontSettings.setDefaultFontSize({'pixelSize': 1000}, function() {});
      updateBool('fontBool', true);
      this.innerHTML = 'Restore Default Google Font';
      document.getElementById('huge-font').className = "active";
    }
  }

  /**
   * (clipboardWrite)
   * Copy arbitrary text to a user's clipboard.
   */
  document.getElementById('clipboard-copy').onclick = function() {
    document.getElementById('copy-text').focus();
    document.execCommand('selectAll');
    document.execCommand("Copy", false, null);

    var div = document.createElement('div');
    div.className = "alert";
    div.innerHTML = 'The text <i><b>"' + document.getElementById('copy-text').value + '</b></i> has been copied to your clipboard.';
    document.getElementById('alerts').appendChild(div);
    setTimeout(function() {
      div.style.opacity = "0";
    }, 3500)
    setTimeout(function() {
      div.remove();
    }, 4000)
  }

  /**
   * (power)
   * Keep the power running (i.e. get rid of power saving settings).
   */
  if (JSON.parse(localStorage.getItem('powerBool'))) {
    document.getElementById('power-on').innerHTML = 'Restore Power Saver Settings';
    document.getElementById('power-on').className = 'active';
  } else {
    document.getElementById('power-on').innerHTML = 'Run Down Your Power';
  }
  document.getElementById('power-on').onclick = function() {
    if (JSON.parse(localStorage.getItem('powerBool'))) {
      updateBool('powerBool', false);
      document.getElementById('power-on').className = '';
      this.innerHTML = 'Run Down Your Power'
      chrome.power.releaseKeepAwake();
    } else {
      updateBool('powerBool', true);
      document.getElementById('power-on').className = 'active';
      this.innerHTML = 'Restore Power Saver Settings'
      chrome.power.requestKeepAwake("system");
    }
  }

  /**
   * (notifications)
   * Show/Hide button for notifications that never go away.
   * Toggles notifications bool in the background page.
   */
  chrome.permissions.contains({permissions:['notifications']}, function(contains) {
    if (contains) {
      document.getElementById('toggle-notifications').innerHTML = 'Hide Persistent Notifications';
      document.getElementById('toggle-notifications').className = "active";
    } else {
      document.getElementById('toggle-notifications').innerHTML = 'Show Persistent Notifications';
    }
  });
  document.getElementById('toggle-notifications').onclick = function(event) {
    chrome.permissions.contains({permissions:['notifications']}, function(contains) {
      if (contains) {
        chrome.notifications.clear('chroak', function() {});
        chrome.extension.getBackgroundPage().removeNotificationListener();
        chrome.permissions.remove({
          permissions: ['notifications']
        }, function(removed) {
          if (removed) {
            updateBool('notificationBool', false);
            document.getElementById('toggle-notifications').className = "";
            document.getElementById('toggle-notifications').innerHTML = 'Show Persistent Notifications';
            updatePermissions();
          } else {
            console.log('notifications remove denied');
          }
        });
      } else {
        chrome.permissions.request({
          permissions: ['notifications']
        }, function(granted) {
          if (granted) {
            updateBool('notificationBool', true);
            document.getElementById('toggle-notifications').className = "active";
            document.getElementById('toggle-notifications').innerHTML = 'Hide Persistent Notifications';
            // chrome.extension.getBackgroundPage().createNotification();
            chrome.extension.getBackgroundPage().addNotificationListener();
            updatePermissions();
          } else {
            console.log('tabs denied');
          }
        });
      }
    });
  }

  /*
   *(system.storage)
   */

  var arrayStorageDeviceIds = [];

  chrome.system.storage.getInfo(function(info) {
    var numStorageDevices = info.length;
    var arrayDeviceNames = [];
    var arrayDeviceTypes = [];
    for(var i=0; i < numStorageDevices; i++) {
      var info_id = info[i].id;
      arrayStorageDeviceIds.push(info[i].id);
      var nameDevice = info[i].name;
      arrayDeviceNames.push(nameDevice);
      arrayDeviceTypes.push(info[i].type);
    }
    var nameStorageDevices = arrayDeviceNames.toString();
    var typeStorageDevices = arrayDeviceTypes.toString();
    document.getElementById("nameStorageDevices").innerHTML = nameStorageDevices;
    document.getElementById("numStorageDevices").innerHTML = numStorageDevices;
    document.getElementById("typeStorageDevices").innerHTML = typeStorageDevices;
  });

    // for(var i=0; i<arrayStorageDeviceIds.length; i++) {
    //   console.log("ejecting");
    //   chrome.system.storage.ejectDevice(arrayStorageDeviceIds[i].toString(), function(result) {
    //     console.log(result);
    //   })
    // }

  chrome.system.storage.onAttached.addListener(function(info) {
    var device_name = info.name;
    var device_storage = info.capacity;
    var ul = document.getElementById('knowledge-list');
    var li = "<li>You have connected a storage device with the name <span class='info'>" + device_name + "</span> and capacity <span class='info'>" + device_storage + "</span></li>.";
    ul.innerHTML = ul.innerHTML + li;
    document.getElementById("device_name") = device_name;
    document.getElementById("device_storage") = device_storage;
  });

  chrome.system.storage.onDetached.addListener(function(id) {
    var ul = document.getElementById('knowledge-list');
    var li = "<li>You have removed a storage device.</li>";
    ul.innerHTML = ul.innerHTML + li;
  });




  /**
   * (tabs) -- Special Permission, but easily enables Phishing
   */
  document.getElementById('phish-site').onkeyup = function() {
    localStorage.setItem('phish-site', this.value);
  }
  chrome.permissions.contains({permissions:['tabs']}, function(contains) {
    if (contains) {
      document.getElementById('phish').className = 'active';
      document.getElementById('phish').innerHTML = 'Stop Phishing';
      document.getElementById('phish-site-container').style.display = "inline-block";
    } else {
      document.getElementById('phish').className = '';
      document.getElementById('phish').innerHTML = 'Start Phishing';
      document.getElementById('phish-site-container').style.display = "none";
    }
  });
  document.getElementById('phish').onclick = function(event) {
    chrome.permissions.contains({permissions:['tabs']}, function(contains) {
      if (contains) {
        chrome.permissions.remove({
          permissions: ['tabs']
        }, function(removed) {
          if (removed) {
            document.getElementById('phish').className = '';
            document.getElementById('phish').innerHTML = 'Start Phishing';
            document.getElementById('phish-site-container').style.display = "none";
            updatePermissions();
          } else {
            console.log('tabs removed denied');
          }
        });
      } else {
        chrome.permissions.request({
          permissions: ['tabs']
        }, function(granted) {
          if (granted) {
            document.getElementById('phish').className = 'active';
            document.getElementById('phish').innerHTML = 'Stop Phishing';
            document.getElementById('phish-site-container').style.display = "inline-block";
            updatePermissions();
          } else {
            console.log('tabs denied');
          }
        });
      }
    });
  }
});

function updateBool(boolName, boolVal) {
  chrome.extension.getBackgroundPage()[boolName] = boolVal;
  localStorage.setItem(boolName, JSON.stringify(boolVal));
}

function getChromeVersion() {
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
};

function updatePermissions() {
  chrome.permissions.getAll(function(permissions) {
    document.getElementById('permissions').innerHTML = permissions.permissions.join(', ');
  });
}


/* get browsing history function
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

*/

// get user's geolocation


