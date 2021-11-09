let outputArea = $('#outputArea');
let countdownTag = $('#countdownTag');
let breakButton = $('#breakButton');

let settingsIcom = $('#settingsIcon');
let settingsArea = $('#settingsArea');

let workSlider = $('#workDuration');
let workSliderVal = $('#workDurationValue');
let workSeconds = $('#workSeconds');
let workMinutes = $('#workMinutes')
let currentWorkTimeUnit = 'workSeconds';

let breakSlider = $('#breakDuration');
let breakSliderVal = $('#breakDurationValue');
let breakSeconds = $('#breakSeconds');
let breakMinutes = $('#breakMinutes')
let currentBreakTimeUnit = 'breakSeconds';

let homeIcom = $('#homeIcon');
let homeArea = $('#homeArea');


$( document ).ready( function(){
  updatePopupDOM();
  checkStatus();
  breakButton.on('click', takeBreak);
  settingsIcom.on('click', openSettings);
  homeIcom.on('click', openHome);
  workSeconds.on('click', {thisParam: 'seconds', oppositeParam: 'minutes'}, toggleWorkTimeUnit); 
  workMinutes.on('click', {thisParam: 'minutes', oppositeParam: 'seconds'}, toggleWorkTimeUnit); 
  breakSeconds.on('click', {thisParam: 'seconds', oppositeParam: 'minutes'}, toggleBreakTimeUnit); 
  breakMinutes.on('click', {thisParam: 'minutes', oppositeParam: 'seconds'}, toggleBreakTimeUnit); 
});

function toggleWorkTimeUnit (timeUnit){ 
  // console.log('timeUnit.data:', timeUnit.data);
  // console.log( "timeUnit.data.thisParam:", timeUnit.data.thisParam);
  // console.log( "timeUnit.data.oppositeParam:", timeUnit.data.oppositeParam);

  let clicked = timeUnit.data.thisParam; //unit of time that was clicked (seconds or minutes)
  let notClicked = timeUnit.data.oppositeParam; //unit of time that was NOT clicked (seconds or minutes)

  console.log('clicked: ', clicked, 'not clicked:', notClicked);
  if (currentWorkTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentWorkTimeUnit = clicked;
    sendDataToBG("changeSettings", { workTimeUnit: currentWorkTimeUnit });
    toggleSettingsCSS(this, notClicked);
  }
}

function toggleBreakTimeUnit (oppositeTimeUnit){ 
  let clicked = this.id; //unit of time that was clicked (seconds or minutes)
  let notClicked = oppositeTimeUnit.data.timeParam; //unit of time that was NOT clicked (seconds or minutes)

  if (currentBreakTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentBreakTimeUnit = clicked;
    sendDataToBG("changeSettings", { breakTimeUnit: currentBreakTimeUnit });
    toggleSettingsCSS(this, notClicked);
  }
}

function toggleSettingsCSS(clicked, notClicked){
  //helper that keeps toggleXTimeUnit functions DRY - flip CSS classes for minutes/seconds on settings toggle
  $(clicked).addClass('timeUnitActive');
  $(clicked).removeClass('timeUnitInactive');
  $(`#${notClicked}`).addClass('timeUnitInactive');
  $(`#${notClicked}`).removeClass('timeUnitActive');
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
