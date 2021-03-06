(function() {
  // Declare utility variables
var toggle = false,
    isJQuery = "no",
    clickStat = false,
    linkStat = false,
	formStat = false,
    injCode = "",
    injElem;

// Add listener to modify Browser Action badge number (dispatched by the injected listener functions)
document.addEventListener("dLLength", function (e) {
    "use strict";
    chrome.runtime.sendMessage({"badge" : e.detail});
});

// Inject script which tests if jQuery exists and dispatches a custom event with information
document.addEventListener("isJQuery", function (e) { "use strict"; isJQuery = e.detail; });
injCode = "(function() { window.__sonar = window.__sonar || {}; if(typeof(window.jQuery)!=='undefined'){var event=new CustomEvent('isJQuery',{detail:'yes'});document.dispatchEvent(event);};})()";
injElem = document.createElement('script');
injElem.setAttribute('type', 'text/javascript');
injElem.innerHTML = injCode;
injElem.id = "jQStatus";
document.head.appendChild(injElem);

// Listen for messages from extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    "use strict";
    // Upon click toggle DOM injection
    if (request.message === "click") {
        if (!toggle && !document.getElementById("debugDLLoader")) {
            injCode = "window.__sonar.startdl=function(){window['debugDL']=window['debugDL']||[];};window.__sonar.startdl();";
            injElem = document.createElement('script');
            if (request.checkC) {
                injCode += "window.__sonar.getClick = function(e){e.preventDefault();window.debugDL.push({'event': 'gtm.click', 'gtm.element': e.target, 'gtm.elementId': e.target.id, 'gtm.elementClasses': e.target.className, 'gtm.elementUrl': e.target.href, 'gtm.elementTarget': e.target.target});var event=new CustomEvent('dLLength',{detail:window.debugDL.length});document.dispatchEvent(event);};";
                injCode += "document.addEventListener('click',window.__sonar.getClick,true);";
                clickStat = true;
            } else if (request.checkL) {
                injCode += "window.__sonar.getLink = function(e){e.preventDefault(); var node = e.target; var link = false; while (node.tagName !== 'BODY') { if (node.tagName === 'A') { link = node; break; } else { node = node.parentElement; } }; if (link) { window.debugDL.push({'event': 'gtm.linkClick', 'gtm.element': link, 'gtm.elementId': link.id, 'gtm.elementClasses': link.className, 'gtm.elementUrl': link.href, 'gtm.elementTarget': link.target});};var event=new CustomEvent('dLLength',{detail:window.debugDL.length});document.dispatchEvent(event);};";
                injCode += "document.addEventListener('click',window.__sonar.getLink,false);";
                linkStat = true;
            } else if (request.checkF) {
                injCode += "window.__sonar.cSubmit = function(e){e.preventDefault();};var f=document.getElementsByTagName('form');for(var i=0;i<f.length;i++){f[i].addEventListener('submit',window.__sonar.cSubmit,false);};";
                injCode += "window.__sonar.getForm = function(e){window.debugDL.push({'event': 'gtm.formSubmit', 'gtm.element': e.target, 'gtm.elementId': e.target.id, 'gtm.elementClasses': e.target.className, 'gtm.elementUrl': e.target.action, 'gtm.elementTarget': e.target.target});var event=new CustomEvent('dLLength',{detail:window.debugDL.length});document.dispatchEvent(event);};";
                injCode += "document.addEventListener('submit',window.__sonar.getForm,false);";
                formStat = true;
            }
            injElem.setAttribute('type', 'text/javascript');
            injElem.innerHTML = injCode;
            injElem.id = "debugDLLoader";
            document.head.appendChild(injElem);
        } else if (toggle && document.getElementById("debugDLLoader")) {
            injCode = "";
            injElem = document.createElement('script');
            var rem1 = document.getElementById("debugDLLoader"),
                rem2 = document.getElementById("debugDLUnloader");
            if (clickStat) {
                injCode += "document.removeEventListener('click',window.__sonar.getClick,true);";
            } else if (linkStat) {
                injCode += "document.removeEventListener('click',window.__sonar.getLink,false);";
            } else if (formStat) {
                injCode += "(function() { var f=document.getElementsByTagName('form');for(var i=0;i<f.length;i++){f[i].removeEventListener('submit',cSubmit,false);} })()";
                injCode += "document.removeEventListener('submit',window.__sonar.getForm,false);";
            }
            injElem.setAttribute('type', 'text/javascript');
            injElem.innerHTML = injCode;
            injElem.id = "debugDLUnloader";
            document.head.appendChild(injElem);
            if (rem1) { rem1.parentNode.removeChild(rem1); }
            if (rem2) { rem2.parentNode.removeChild(rem2); }
            clickStat = false;
            linkStat = false;
            formStat = false;
        }
    
        // Set toggle to its opposite on content script
        toggle = !toggle;
        
    // Send status of toggle, checkboxes and jQuery to popup.js
    } else if (request.message === "getToggle") {
        sendResponse({status : toggle, jStatus : isJQuery, cStatus : clickStat, lStatus : linkStat, fStatus : formStat});
    // Remove jQuery event handlers
    } else if (request.message === "killjquery") {
        injCode = "if(window.jQuery) { jQuery('body').find('*').off(); }";
        injElem = document.createElement('script');
        injElem.setAttribute('type', 'text/javascript');
        injElem.innerHTML = injCode;
        document.head.appendChild(injElem);
        isJQuery = "disabled";
    }
});
})();