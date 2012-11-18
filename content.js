document.body.onkeydown = function(e) {
  // Cmd 1-9
  if (e.metaKey && e.keyCode >= 49 && e.keyCode <= 57) {
      // Alt = store shortcut
      if (e.altKey) {
          console.log('Marking ' + String.fromCharCode(e.keyCode));
          chrome.extension.sendMessage({action: "mark", key: e.keyCode});
      } else {
          console.log('Jumping to ' + String.fromCharCode(e.keyCode));
          chrome.extension.sendMessage({action: "jump", key: e.keyCode});
      }
      return false;
  } else if (e.metaKey && e.keyCode == 66) { // cmd-B
    chrome.extension.sendMessage({action: "last"});
    return false;
  }
}
