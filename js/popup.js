//#region jquery variables setup
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

let breakSlider = $('#breakDuration');
let breakSliderVal = $('#breakDurationValue');
let breakSeconds = $('#breakSeconds');
let breakMinutes = $('#breakMinutes')
let breakTimeUnits = [breakSeconds, breakMinutes];

let homeIcon = $('#homeIcon');
let homeArea = $('#homeArea');

let statsIcon = $('#statsIcon');
let statsArea = $('#statsArea');
let totalBreaksLabel = $('#totalBreaksLabel');
let totalBreaks;

let infoIcon = $('#infoIcon');
let infoArea = $('#infoArea');

let playButton = $('#playButton');
let playButtonImage = $('#playButtonImage')
let pauseButton = $('#pauseButton');
let pauseButtonImage = $('#pauseButtonImage')
let pauseDescriptionText = $('#pauseDescriptionText');

let currentStatus = {};
let currentSettings = {};
//#endregion

$( document ).ready( function(){
  getDataThen(updateHomeDOM);
  getDataThen(updateSettingsDOM);

  checkStatus();

  breakButton.on('click', takeBreak);

  homeIcon.on('click', openHome);
  statsIcon.on('click', openStats);
  settingsIcon.on('click', openSettings);
  infoIcon.on('click', openInfo);

  playButton.on('click', pressPlay);
  pauseButton.on('click', pressPause);

  workSeconds.on('click', {clicked: 'seconds'}, toggleWorkTimeUnit); 
  workMinutes.on('click', {clicked: 'minutes'}, toggleWorkTimeUnit); 
  breakSeconds.on('click', {clicked: 'seconds'}, toggleBreakTimeUnit); 
  breakMinutes.on('click', {clicked: 'minutes'}, toggleBreakTimeUnit); 
});

function pressPlay(){
  sendDataToBG("changeSettings", { breakDuration: +$(this).val(), breakTimeUnit: currentSettings.breakTimeUnit });

  currentStatus.isPaused = false;
  sendDataToBG("isPaused", false);
  playButtonImage.attr('src','./images/Play.png');
  pauseButtonImage.attr('src','./images/PauseUnselected.png');
  pauseDescriptionText.text('');
}

function pressPause(){
  currentStatus.isPaused = true;
  sendDataToBG("isPaused", true);
  playButtonImage.attr('src','./images/PlayUnselected.png');
  pauseButtonImage.attr('src','./images/Pause.png');
  pauseDescriptionText.text('Twenty is now paused');
}


function getDataThen(functionToRunAfterData){
  //GETTING SETTINGS/STATUS/COUNDTOWN DATA FROM BG. VARIOUS FUNCTIONS RUN THIS

  //POPUP INITIATES an ask to BG. Results in BG sending both current data objects, so we can set them locally
  chrome.runtime.sendMessage({method: "popupImportDataFromBG", data: ""}, function (res){  
    currentStatus = {...currentStatus, ...res.data.currentStatus};
    currentSettings = {...currentSettings, ...res.data.currentSettings};
    functionToRunAfterData();
    return true;
  });

}

//#region updateDOM with data
function updateHomeDOM() {
  //PLUGGING IN ALL VALUES TO DOM - home area. RUNS EACH TIME POPUP IS OPENED (called via getDataThen in onready and recurring checkStatus())
        //console.log("From POPUP. status:", currentStatus, "settings", currentSettings);
  
  totalBreaksLabel.text(`Total Breaks Taken: ${currentStatus.totalBreaks}`)

  let clockTime = new Date(0, 0, 0, 0, 0, currentStatus.countdown, 0);
  let minutes = `${clockTime.getMinutes() < 10 ? '0' : ''}${clockTime.getMinutes()}`;
  let seconds = `${clockTime.getSeconds() < 10 ? '0' : ''}${clockTime.getSeconds()}`;

        //console.log('cs.countdown', currentStatus.countdown, 'clockTime', clockTime);
  if(!currentStatus.isTakingBreak) {  //if it's WORK TIME
    breakButton.show(); 
      
    if (currentStatus.countdown > 0) {
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

  else {                            //if it's BREAK TIME
    breakButton.hide();
    breakButton.css('background-color','#98BE50');

    if (currentStatus.countdown > 0) { //actively during break countdown
      titleStatus.text(`It's Break Time`);
      countdownTag.show();
      countdownTag.text(`Keep looking away for: ${minutes}:${seconds}`);
    } 
  }
}

function updateSettingsDOM(){
  //PLUGGING IN ALL VALUES TO DOM - settings area. RUNS EACH TIME POPUP IS OPENED (called via getDataThen in onready)

  workSlider.val(currentSettings.workDuration);
  workSliderVal.html(currentSettings.workDuration);
  currentSettings.workTimeUnit === "minutes" ? toggleSettingsCSS(workMinutes, workTimeUnits) : toggleSettingsCSS(workSeconds, workTimeUnits);
  
  breakSlider.val(currentSettings.breakDuration);
  breakSliderVal.html(currentSettings.breakDuration);
  currentSettings.breakTimeUnit === "minutes" ? toggleSettingsCSS(breakMinutes, breakTimeUnits) : toggleSettingsCSS(breakSeconds, breakTimeUnits);
}
//#endregion

//#region toggle time units
function toggleWorkTimeUnit (timeUnit){ 
  //when user clicks 'seconds' or 'minutes' on the work slider, this does the toggling
  let clicked = timeUnit.data.clicked ; //unit of time that was clicked (seconds or minutes)

  if (currentSettings.workTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentSettings.workTimeUnit = clicked;
    //todo our local currentSettings will get updated after .5s anyway, but should set it here too or?
    sendDataToBG("changeSettings", { workDuration: workSlider.val(), workTimeUnit: currentSettings.workTimeUnit });
    toggleSettingsCSS(this, workTimeUnits);
  } 
}

function toggleBreakTimeUnit (timeUnit){ 
  //when user clicks 'seconds' or 'minutes' on the break slider, this does the toggling
  let clicked = timeUnit.data.clicked ; //unit of time that was clicked (seconds or minutes)

  if (currentSettings.breakTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    currentSettings.breakTimeUnit = clicked;
    //todo our local currentSettings will get updated after .5s anyway, but should set it here too or?
    sendDataToBG("changeSettings", { breakDuration: breakSlider.val(), breakTimeUnit: currentSettings.breakTimeUnit });
    toggleSettingsCSS(this, breakTimeUnits);
  } 
}

function toggleSettingsCSS(clickedElement, elementList){
  //flip CSS classes for minutes/seconds on settings toggle

  for(const element of elementList){ //make all elements inactive
    element.addClass('timeUnitInactive');
    element.removeClass('timeUnitActive');
  }
  $(clickedElement).addClass('timeUnitActive'); //activate only our clicked element
  $(clickedElement).removeClass('timeUnitInactive');
}
//#endregion

function sendDataToBG(_method, _data){
  //when user makes any changes, send them back to BG script
  chrome.runtime.sendMessage({ method: _method, data: _data }, function (res) {
    return true;
  });
}

//#region sliders value change
//todo on refactor day - combine these xSlider.on'input' and xSlider.on'change functions = DRYer
workSlider.on('input', function () {//input fires constantly, i.e. while mouse is still down the value will change
  workSliderVal.html(`${$(this).val()}`);
});

workSlider.on('change', function () {//change fires only after mouse is released
  sendDataToBG("changeSettings", { workDuration: +$(this).val(), workTimeUnit: currentSettings.workTimeUnit });
});

breakSlider.on('input', function () { //input fires constantly, i.e. while mouse is still down the value will change
  breakSliderVal.html(`${$(this).val()}`);
});

breakSlider.on('change', function () {//change fires only after mouse is released
  sendDataToBG("changeSettings", { breakDuration: +$(this).val(), breakTimeUnit: currentSettings.breakTimeUnit });
});
//#endregion

//#region open nav icon areas
function openHome(){
  unselectAllIcons();
  homeArea.show()
  homeIcon.attr('src','./images/Home.png');
}

function openStats(){
  // unselectAllIcons();
  // statsArea.show();
  // statsIcon.attr('src',
}

function openSettings(){
  unselectAllIcons();
  settingsArea.show();
  settingsIcon.attr('src','./images/Settings.png');
}

function openInfo(){
  unselectAllIcons();
  infoArea.show();
  infoIcon.attr('src','./images/i.png');
}

function unselectAllIcons(){
  homeArea.hide();
  statsArea.hide();
  settingsArea.hide();
  infoArea.hide();
  //statsIcon.attr('src',
  homeIcon.attr('src','./images/HomeUnselected.png');
  settingsIcon.attr('src','./images/SettingsUnselected.png');
  infoIcon.attr('src','./images/iUnselected.png');
}
//#endregion

function takeBreak(){ 
  //runs when user clicks "take a break (or take a break early)"
  breakButton.css('background-color','#819C50');
  chrome.notifications.clear('timeToBreak');

  currentStatus.isTakingBreak = true;
  sendDataToBG("isTakingBreak", true);
}

function checkStatus(){ 
  //continually running (2 per second) function that fetches countdown from background.js
  setInterval(() => { 
    getDataThen(updateHomeDOM);
  }, 500); //(ms) - runs twice per second
}



// //EXAMPLE of how BACKGROUND INITIATES contact with popup, this is how to begin - but note that popup is not always open!
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.msg === "testMessage") 
//         console.log(request.data);
//   });