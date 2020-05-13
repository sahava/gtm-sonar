if (chrome) {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            "use strict";
            // Toggle Browser Action icon in active tab upon request from popup.js
            if (request.icon === "on") {
                chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
                    chrome.browserAction.setIcon({tabId : tabs[0].id, path: "icon19on.png"});
                });
            } else if (request.icon === "off") {
                chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
                    chrome.browserAction.setIcon({tabId : tabs[0].id, path: "icon19.png"});
                });
            }
            
            // Toggle Badge number when pushed by debugger.js
            if (request.badge) {
                chrome.browserAction.setBadgeText({tabId : sender.tab.id, text : request.badge.toString()});
                chrome.browserAction.setBadgeBackgroundColor({color : "#0000B8"});
            }
        }
    );
}