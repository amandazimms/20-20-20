let titleStatus = $('#titleStatus');
let countdownTag = $('#countdownTag');
let breakButton = $('#breakButton');

let settingsIcon = $('#settingsIcon');
let settingsArea = $('#settingsArea');

let workSlider = $('#workDuration');
let workSliderVal = $('#workDurationValue');
let workSeconds = $('#workSeconds');
let workMinutes = $('#workMinutes')
let workTimeUnits = [workSeconds, workMinutes];
let currentWorkTimeUnit = 'minutes';

let breakSlider = $('#breakDuration');
let breakSliderVal = $('#breakDurationValue');
let breakSeconds = $('#breakSeconds');
let breakMinutes = $('#breakMinutes')
let breakTimeUnits = [breakSeconds, breakMinutes];
let currentBreakTimeUnit = 'seconds';

let homeIcon = $('#homeIcon');
let homeArea = $('#homeArea');

let statsIcon = $('#statsIcon');
let statsArea = $('#statsArea');
let totalBreaksLabel = $('#totalBreaksLabel');
let totalBreaks;

let infoIcon = $('#infoIcon');
let infoArea = $('#infoArea');

$( document ).ready( function(){
  updatePopupDOM();
  checkStatus();
  breakButton.on('click', takeBreak);

  homeIcon.on('click', openHome);
  statsIcon.on('click', openStats);
  settingsIcon.on('click', openSettings);
  infoIcon.on('click', openInfo);


  workSeconds.on('click', {clicked: 'seconds'}, toggleWorkTimeUnit); 
  workMinutes.on('click', {clicked: 'minutes'}, toggleWorkTimeUnit); 
  breakSeconds.on('click', {clicked: 'seconds'}, toggleBreakTimeUnit); 
  breakMinutes.on('click', {clicked: 'minutes'}, toggleBreakTimeUnit); 
});


function toggleWorkTimeUnit (timeUnit){ 
  let clicked = timeUnit.data.clicked; //unit of time that was clicked (seconds or minutes)

  if (currentWorkTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentWorkTimeUnit = clicked;
    sendDataToBG("changeSettings", { workDuration: workSlider.val(), workTimeUnit: currentWorkTimeUnit });
    toggleSettingsCSS(this, workTimeUnits);
  }
}

function toggleBreakTimeUnit (timeUnit){ 
  let clicked = timeUnit.data.clicked; //unit of time that was clicked (seconds or minutes)

  if (currentBreakTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentBreakTimeUnit = clicked;
    sendDataToBG("changeSettings", { breakDuration: breakSlider.val(), breakTimeUnit: currentBreakTimeUnit });
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
  sendDataToBG("changeSettings", { workDuration: $(this).val(), workTimeUnit: currentWorkTimeUnit });
});


breakSlider.on('input', function () {
  //input fires constantly, i.e. while mouse is still down the value will change
  breakSliderVal.html(`${$(this).val()}`);
});

breakSlider.on('change', function () {
  //change fires only after mouse is released
  sendDataToBG("changeSettings", { breakDuration: +$(this).val(), breakTimeUnit: currentBreakTimeUnit });
});

function openHome(){
  settingsArea.hide();
  statsArea.hide();
  infoArea.hide();
  homeArea.show();
}

function openStats(){
  settingsArea.hide();
  homeArea.hide();
  infoArea.hide();
  statsArea.show();
}

function openSettings(){
  homeArea.hide();
  statsArea.hide();
  infoArea.hide();
  settingsArea.show();
}

function openInfo(){
  homeArea.hide();
  statsArea.hide();
  settingsArea.hide();
  infoArea.show();
}

function takeBreak(){ 
  //runs when user clicks "take a break (or take a break early)"
  chrome.notifications.clear('timeToBreak');

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
    totalBreaks = res.data.totalBreaks;
    totalBreaksLabel.text(`Total Breaks Taken: ${totalBreaks}`)

    let clockTime = new Date(0, 0, 0, 0, 0, currentTimer, 0);
    let minutes = `${clockTime.getMinutes() < 10 ? '0' : ''}${clockTime.getMinutes()}`;
    let seconds = `${clockTime.getSeconds() < 10 ? '0' : ''}${clockTime.getSeconds()}`;

    if(!isTakingBreak) {   //if it's WORK TIME
      breakButton.show(); 
        
      if (currentTimer > 0) {
        titleStatus.text(`It's Work Time`);
        countdownTag.show();
        countdownTag.text(`Time until next break: ${minutes}:${seconds}`);
        breakButton.text(`Take A Break Early`); //if it's not time to take a break yet, update this button wording
      }
      else  {
        titleStatus.text(`It's Break Time`);
        countdownTag.hide();
        breakButton.text(`Take A Break`); //change the button wording to remove 'early'
      } 
    }
  
    else {                //if it's BREAK TIME
      breakButton.hide(); //if we're already taking a break, hide this button 
      
      if (currentTimer > 0) { //actively during break countdown
        titleStatus.text(`It's Break Time`);
        countdownTag.show();
        countdownTag.text(`Keep looking away for: ${minutes}:${seconds}`);
      } else  { //break has ended - 
        titleStatus.text(`It's Work Time`);
        breakButton.hide();
      }
    }
    return true;
  })
}
