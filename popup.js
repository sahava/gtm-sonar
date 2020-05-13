// Run JavaScript only after DOM of popup has loaded
window.addEventListener("DOMContentLoaded", function () {
    "use strict";
    
    // Code to tailor instructions in pop-up for mac vs. win
    document.documentElement.classList.add(navigator.userAgent.match(/Mac OS X/) ? 'mac' : 'win');

    // Utility variables
    var trigger = document.getElementById("trigger"),
        status = document.getElementById("status"),
        jQ = document.getElementById("jQuery"),
        checkClick = document.getElementById("click"),
        checkLink = document.getElementById("linkclick"),
        checkForm = document.getElementById("formsubmit"),
	    v = chrome.runtime.getManifest().version,
        heading = document.getElementById("heading"),
        toggle;
    
    if (heading && v) { 
        heading.innerHTML = "GTM Sonar v" + v;
    }
    
    // Utility function to change state of pop-up upon activation / deactivation
    function switchBut(state) {
        if (state) {
            trigger.innerHTML = "Switch Off";
            status.style.color = "#04B431";
            status.innerHTML = "Enabled";
            checkClick.disabled = true;
            checkLink.disabled = true;
			checkForm.disabled = true;
        } else if (!state) {
            trigger.innerHTML = "Switch On";
            status.style.color = "#f00";
            status.innerHTML = "Disabled";
            checkClick.disabled = false;
            checkLink.disabled = false;
			checkForm.disabled = false;
        }
    }
    
    // Send message to Content Script requesting status of debugger (consider migrating to Storage API)
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "getToggle"}, function (response) {
            try {
                if (response.jStatus && response.jStatus === "yes") {
                    jQ.disabled = false;
                    jQ.innerHTML = "Click to turn off jQuery listeners";
                } else if (response.jStatus && response.jStatus === "no") {
                    jQ.disabled = true;
                    jQ.innerHTML = "jQuery not detected on page";
                } else if (response.jStatus && response.jStatus === "disabled") {
                    jQ.disabled = true;
                    jQ.innerHTML = "jQuery events disabled";
                }
                switchBut(response.status);
                checkClick.checked = response.cStatus;
                checkLink.checked = response.lStatus;
                checkForm.checked = response.fStatus;
                toggle = response.status;
            } catch (e) {
                document.getElementById("content").innerHTML = "<p class='error'>Oops! This extension will not work with the current page.<br/><br/>Error: " + e.message + "</p>";
            }
        });
    });
    
    // Add event listener to popup Switch button
    trigger.addEventListener("click", function (response) {

        // Toggle Browser Action icon and button text with each click
        if (!toggle) {
            chrome.runtime.sendMessage({icon : "on"});
            switchBut(true);
        } else if (toggle) {
            chrome.runtime.sendMessage({icon : "off"});
            switchBut(false);
        }
    
        // Send a "Click" message to the Content Script with status of radio buttons
        chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message : "click", checkC : checkClick.checked, checkL : checkLink.checked, checkF : checkForm.checked});
        });

        // Set toggle to its opposite for popup.html
        toggle = !toggle;
    });

    // If jQuery kill switch is toggled, send message to Content Script
    jQ.addEventListener("click", function (e) {
        chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message : "killjquery"});
        });
        jQ.disabled = true;
        jQ.innerHTML = "jQuery events disabled";
    });

});