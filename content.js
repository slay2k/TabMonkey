var jumpKey, backKeyCode;

if (navigator.platform.substr(0,3) == 'Mac') {
    jumpKey = 'metaKey';
    backKeyCode = 'B'.charCodeAt(0);
} else {
    jumpKey = 'ctrlKey';
    backKeyCode = 'Q'.charCodeAt(0);
}

window.onkeydown = function(e) {
  // jumpKey 1-9
  if (e[jumpKey] && e.keyCode >= 49 && e.keyCode <= 57) {
      // Alt = store shortcut
      if (e.altKey) {
          // console.log('Marking ' + String.fromCharCode(e.keyCode));
          chrome.extension.sendMessage({action: "mark", key: e.keyCode});
      } else {
          // console.log('Jumping to ' + String.fromCharCode(e.keyCode));
          chrome.extension.sendMessage({action: "jump", key: e.keyCode});
      }
      return false;
  } else if (e[jumpKey] && e.keyCode == backKeyCode) {
    // Handle last-tab request (Cmd-B on Mac, Ctrl-Q elsewhere)
    chrome.extension.sendMessage({action: "last"});
    return false;
  }
}
