var bg = chrome.extension.getBackgroundPage();
var removeClass = navigator.platform.substr(0,3) == "Mac" ? '.win' : '.mac';

// JS concatenation sucks, so we mimic string substitution
String.prototype.dict = function(o){
  return this.replace(/\${([^{}$]*)}/g, function(a, b){
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
              });
};

// TabMonkey file-local namespace
var TM = {

    showReloadIfHidden: function(firstTimeUser) {
        if ($("#reload").is(":hidden")) {
            $('#reload').show();

            if (firstTimeUser) {
              $('#meat').css('opacity', 0.3);
            } else {
              $("#chrome_comment").hide();
            }
        }
    },

    hideReloadIfVisible: function() {
        if ($("#reload").is(":visible")) {
            $("#reload").hide();
            $('#meat').css('opacity', 1);
        }
    },

    updateMsg: function(msg) {
        $('#msg').text(msg.dict({
            'outdated': bg.tabVersions.outdated.length,
            'current': bg.tabVersions.current.length,
            'noresponse': bg.tabVersions.noresponse.length,
            'reload': bg.tabVersions.noresponse.length + bg.tabVersions.outdated.length
        }));
    },

    init: function() {

        var repeatCount = 0, prevTabCount = 0;

        // Remove whichever OS isn't applicable
        $(removeClass).remove();

        // Add button click handler
        $('button').click(function() {
          bg.reloadTabs();
          $('#reload').hide();
          $('#try_them').show();
          $('#meat').animate({'opacity': 1}, 300);
        });

        bg.pollTabVersions();

        // Set a timer to check tab status every 100ms, in order to determine whether to present a reload option
        // to the user. Timer self-clears when there are no more detectable changes.
        timer = setInterval(function() {
            // Nothing but current tabs? Cool, hide reload area
            if (bg.tabVersions.current.length == bg.tabVersions.counted) {
              TM.hideReloadIfVisible();
            } else {
              // If all we have is non-responsive tabs
              if (bg.tabVersions.noresponse.length == bg.tabVersions.counted) {
                TM.updateMsg("Welcome! I need to reload ${reload} of your tabs to activate TabMonkey.");
                TM.showReloadIfHidden(true);
              } else {
                // We have some combination of outdated + current tabs
                if (bg.tabVersions.outdated.length > 0 && bg.tabVersions.noresponse.length > 0) {
                  TM.updateMsg("${outdated} tabs running an older version, and ${noresponse} not running any. You should reload them.");
                } else if (bg.tabVersions.outdated.length > 0) {
                  TM.updateMsg("${outdated} tabs are running an older version of TabMonkey. You should reload them.");
                } else {
                  TM.updateMsg("${noresponse} tabs aren't running TabMonkey. You should try reloading them.");
                }
                TM.showReloadIfHidden();
              }
            }

          // If the length doesn't change 10 times in a row,
          // we assume all timers have fired and stop checking
          if (bg.tabVersions.counted == prevTabCount) {
            if (++repeatCount == 10) {
              clearInterval(timer);
              console.log('[TabMonkey]: Clearing timer!');
            }
          } else {
            repeatCount = 0;
          }

          prevTabCount = bg.tabVersions.counted;

        }, 100);
    }
}

TM.init();
