var keymap = {};
var prevTab, currentTab;

function msg(title, msg, timeout) {
  var notification = webkitNotifications.createNotification('icon.png', title, msg);
  notification.show();
  setTimeout(function() { notification.cancel(); }, timeout || 1500);
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "mark") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
        keymap[request.key] = tab[0].id;
        msg('Tab Monkey', 'Marking this tab as #' + String.fromCharCode(request.key));
      });
    }
    else if (request.action  == "jump") {
      if (request.key in keymap) {
        chrome.tabs.update(keymap[request.key], {active: true});
      }
    }
    else if (request.action == "last") {
      if (prevTab) {
        chrome.tabs.update(prevTab, {active: true});
      }
    }
});

chrome.tabs.onSelectionChanged.addListener(function(newTab) {
  if (prevTab == null) {
    prevTab = newTab;
  }

  if (currentTab == null) {
    currentTab = newTab;
  } else {
    prevTab = currentTab;
    currentTab = newTab;
  }
});
