var keymap = {};
var prevTab, currentTab;
var MIN_CONTENT_SCRIPT_VERSION = '0.2.4';
var tabVersions;

/*
 * Message popup notification shortcut
 */
function msg(title, msg, timeout) {
  var notification = webkitNotifications.createNotification('img/icon.png', title, msg);
  notification.show();
  setTimeout(function() { notification.cancel(); }, timeout || 1500);
}

/*
 * Exclude chrome:// and other non-http URLs
 */
function isWeb(url) {
    return /^https?:\/\/.*/.exec(url);
}

/*
 * Store tab ids of any tabs that require a reload
 */
function pollTabVersions() {
    tabVersions = {'noresponse': [], 'outdated': [], 'current': [], 'counted': 0}
    chrome.tabs.query({'status': 'complete'}, function(tabs) {
        for (var i=0; i<tabs.length; i++) {
            var tab = tabs[i];
            if (isWeb(tab.url)) {
                // Create a closure here so the 'tab' parameter inside sticks to the calling context
                (function(tab) {
                    chrome.tabs.sendMessage(tab.id, {action: "version", tabid:tab.id}, function(response) {
                        tabVersions['counted']++;
                        if (!response) {
                            tabVersions['noresponse'].push(tab);
                        } else if (response.version < MIN_CONTENT_SCRIPT_VERSION) {
                            tabVersions['outdated'].push(tab);
                        } else {
                            tabVersions['current'].push(tab);
                        }
                    });
                })(tab);
            }
        }
    });
}

/*
 * Do the reloading
 */
function reloadTabs() {
  // Set the previous tab to the last tab in the list, so that back-jump works immediately
  prevTab = tabVersions.outdated.length > 0 ? tabVersions.outdated[0].id : tabVersions.noresponse[0].id;

  var reloadList = tabVersions.noresponse.concat(tabVersions.outdated);
  for (var i=0; i < reloadList.length; i++) {
    chrome.tabs.reload(reloadList[i].id);
  }
}


/*
 * Main controller, called on script load
 */
function init() {

    // Poll open tabs and set a timer such that, if after half a second we find any tabs that need reloading,
    // we display the options page which will suggest a tab reload
    pollTabVersions();
    setTimeout(function() {
        if (tabVersions.current.length != tabVersions.counted) {
            chrome.tabs.create({'url': 'options.html'});
        }
    }, 500);

    // Listen for mark, jump, and last messages from content scripts
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

    // Listen for tab changes and record for future switches
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

}

init();
