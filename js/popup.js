let outputArea = $('#outputArea');
let countdownTag = $('#countdownTag');
let breakButton = $('#breakButton');

let settingsIcom = $('#settingsIcon');
let settingsArea = $('#settingsArea');

let workSlider = $('#workDuration');
let workSliderVal = $('#workDurationValue');
let workSeconds = $('#workSeconds');
let workMinutes = $('#workMinutes')
let workTimeUnits = [workSeconds, workMinutes];
let currentWorkTimeUnit = 'seconds';

let breakSlider = $('#breakDuration');
let breakSliderVal = $('#breakDurationValue');
let breakSeconds = $('#breakSeconds');
let breakMinutes = $('#breakMinutes')
let breakTimeUnits = [breakSeconds, breakMinutes];
let currentBreakTimeUnit = 'seconds';

let homeIcom = $('#homeIcon');
let homeArea = $('#homeArea');


$( document ).ready( function(){
  updatePopupDOM();
  checkStatus();
  breakButton.on('click', takeBreak);
  settingsIcom.on('click', openSettings);
  homeIcom.on('click', openHome);
  workSeconds.on('click', {thisParam: 'seconds'}, toggleWorkTimeUnit); 
  workMinutes.on('click', {thisParam: 'minutes'}, toggleWorkTimeUnit); 
  breakSeconds.on('click', {thisParam: 'seconds'}, toggleBreakTimeUnit); 
  breakMinutes.on('click', {thisParam: 'minutes'}, toggleBreakTimeUnit); 
});

function toggleWorkTimeUnit (timeUnit){ 
  let clicked = timeUnit.data.thisParam; //unit of time that was clicked (seconds or minutes)

  if (currentWorkTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentWorkTimeUnit = clicked;
    sendDataToBG("changeSettings", { workTimeUnit: currentWorkTimeUnit });
    toggleSettingsCSS(this, workTimeUnits);
  }
}

function toggleBreakTimeUnit (timeUnit){ 
  let clicked = timeUnit.data.thisParam; //unit of time that was clicked (seconds or minutes)

  if (currentBreakTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentBreakTimeUnit = clicked;
    sendDataToBG("changeSettings", { breakTimeUnit: currentBreakTimeUnit });
    toggleSettingsCSS(this, breakTimeUnits);
  }
}

function toggleSettingsCSS(clickedElement, elementList){
  //helper that keeps toggleXTimeUnit functions DRY - flip CSS classes for minutes/seconds on settings toggle
  for(const element of elementList){ //make all elements inactive
    element.addClass('timeUnitInactive');
    element.removeClass('timeUnitActive');
  }
  $(clickedElement).addClass('timeUnitActive'); //activate only our clicked element
  $(clickedElement).removeClass('timeUnitInactive');
}

function sendDataToBG(_method, _data){
  chrome.runtime.sendMessage({ method: _method, data: _data }, function (res) {
    return true;
  });
}

//todo on refactor day - combine these xSlider.on'input' and xSlider.on'change functions = DRYer
workSlider.on('input', function () {
  //input fires constantly, i.e. while mouse is still down the value will change
  workSliderVal.html(`${$(this).val()}`);
});

workSlider.on('change', function () {
  //change fires only after mouse is released
  sendDataToBG("changeSettings", { workDuration: +$(this).val() });
});


breakSlider.on('input', function () {
  //input fires constantly, i.e. while mouse is still down the value will change
  breakSliderVal.html(`${$(this).val()}`);
});

breakSlider.on('change', function () {
  //change fires only after mouse is released
  sendDataToBG("changeSettings", { breakDuration: +$(this).val() });
});

function openSettings(){
  homeArea.hide();
  settingsArea.show();
}

function openHome(){
  settingsArea.hide();
  homeArea.show();
}

function takeBreak(){ 
  //runs when user clicks "take a break (early)"

  //using this setup to SEND "true" to background (re: click "take a break" = true)
  chrome.runtime.sendMessage({ method: "isTakingBreak", data: true }, function (res) {
    return true;
  });
}


function checkStatus(){ 
  //continually running (2 per second) function that fetches countdown from background.js
  setInterval(() => { 
    updatePopupDOM();
  }, 500); //(ms) - runs twice per second
}


function updatePopupDOM() {
  //using this setup to RECEIVE isTakingBreak from background
  chrome.runtime.sendMessage({ method: "currentStatus", data: "" }, function (res) { 
    let isTakingBreak = res.data.isTakingBreak;
    let currentTimer = res.data.countdown;

    if(!isTakingBreak) {   
      breakButton.show(); //if we're not taking a break, show the 'take a break' button
        
      if (currentTimer > 0) {
        countdownTag.text(`Time until next break: ${currentTimer}`);
        breakButton.text("Take A Break Early"); //if it's not time to take a break yet, update this button wording
      }
      else  {
        countdownTag.text(`It's time for twenty!`);
        breakButton.text("Take A Break"); //change the button wording to remove 'early'
      } 
    }
  
    else {breakButton.hide(); //if we're already taking a break, hide this button 
      
      if (currentTimer > 0)
        countdownTag.text(`Keep looking away for: ${currentTimer}`);
      else  {
        countdownTag.text(`Great work! You can now get back to work :)`);
        breakButton.hide();
      }
    }
    return true;
  })
}
