var keymap = {};
var prev, curr;

function msg(title, msg, timeout) {
  var notification = webkitNotifications.createNotification('icon.png', title, msg);
  notification.show();
  setTimeout(function() { notification.cancel(); }, timeout || 1500);
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    /*console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");*/
    var a = request.action;
    if (a == "mark") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
        // console.dir(tab);
        keymap[request.key] = tab[0].id;
        msg('Tab Monkey', 'Marking this tab as #' + String.fromCharCode(request.key));
      });
    }
    else if (a == "jump") {
      if (request.key in keymap) {
        chrome.tabs.update(keymap[request.key], {active: true});
      }
    }
    else if (a == "last") {
      if (prev) {
        chrome.tabs.update(prev, {active: true});
      }
    }
});

chrome.tabs.onSelectionChanged.addListener(function(tab) {
  if (prev == null) {
    prev = tab;
  }

  if (curr == null) {
    curr = tab;
  } else {
    prev = curr;
    curr = tab;
  }
});
