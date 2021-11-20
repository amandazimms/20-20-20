//EXAMPLE 1: when popup INITIATES CONTACT with background, run this from a FUNCTION here in popup:
chrome.runtime.sendMessage({method: "home", data: "DATA FROM HOME TO BG"}, function (res){
  console.log('back in popup home, we received:', res.data);

  return true;
});



// //EXAMPLE 2: when background INITIATES CONTACT with popup, this is step 2, and runs IF popup is open.
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.msg === "testMessage") {
//         console.log(request.data);
//     }
//   }
// );

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

let playButton = $('#playButton');

let currentStatus = {};
let currentSettings = {};

$( document ).ready( function(){
   getDataThen();
  // updateHomeDOM();
  // updateSettingsDOM();

  // checkStatus();
  // breakButton.on('click', takeBreak);

  homeIcon.on('click', openHome);
  statsIcon.on('click', openStats);
  settingsIcon.on('click', openSettings);
  infoIcon.on('click', openInfo);

  workSeconds.on('click', {clicked: 'seconds'}, toggleWorkTimeUnit); 
  workMinutes.on('click', {clicked: 'minutes'}, toggleWorkTimeUnit); 
  breakSeconds.on('click', {clicked: 'seconds'}, toggleBreakTimeUnit); 
  breakMinutes.on('click', {clicked: 'minutes'}, toggleBreakTimeUnit); 
});



function getDataThen(){
  //GETTING SETTINGS/STATUS/COUNDTOWN DATA FROM BG. VARIOUS FUNCTIONS RUN THIS

  //POPUP initiates an ask to BG. Results in BG sending both current data objects
  chrome.runtime.sendMessage({method: "popupImportDataFromBG", data: ""}, function (res){
    console.log('popup imported this data from background:', res.data);
    
    currentStatus = res.data.currentStatus;
    currentSettings = res.data.currentSettings;
    
    console.log('status:', currentStatus, 'settings', currentSettings);
    //functionToRunAfterData();
    return true;
  });

}



function updateHomeDOM() {
  // console.log('now at home dom. ');
  // //PLUGGING IN ALL VALUES TO DOM - home area. RUNS EACH TIME POPUP IS OPENED
  // console.log('currentSettings:', currentSettings);
  // console.log('currentStatus:', currentStatus);

  // totalBreaksLabel.text(`Total Breaks Taken: ${currentStatus.totalBreaks}`)

  // let clockTime = new Date(0, 0, 0, 0, 0, currentStatus.countdown, 0);
  // let minutes = `${clockTime.getMinutes() < 10 ? '0' : ''}${clockTime.getMinutes()}`;
  // let seconds = `${clockTime.getSeconds() < 10 ? '0' : ''}${clockTime.getSeconds()}`;

  // if(!currentStaus.isTakingBreak) {  //if it's WORK TIME
  //   breakButton.show(); 
      
  //   if (currentStatus.countdown > 0) {
  //     titleStatus.text(`It's Work Time`);
  //     countdownTag.show();
  //     countdownTag.text(`Time until next break: ${minutes}:${seconds}`);
  //     breakButton.text(`Take A Break Early`); //if it's not time to take a break yet, update this button wording
  //   }
  //   else  {
  //     titleStatus.text(`It's Break Time`);
  //     countdownTag.hide();
  //     breakButton.text(`Take A Break`); //change the button wording to remove 'early'
  //   } 
  // }

  // else {                            //if it's BREAK TIME
  //   breakButton.hide();
  //   breakButton.css('background-color','#98BE50');

  //   if (currentStatus.countdown > 0) { //actively during break countdown
  //     titleStatus.text(`It's Break Time`);
  //     countdownTag.show();
  //     countdownTag.text(`Keep looking away for: ${minutes}:${seconds}`);
  //   } 
  // }
}

// function updateSettingsDOM(){
//   //PLUGGING IN ALL VALUES TO DOM - settings area. RUNS EACH TIME POPUP IS OPENED

//   //using this setup to RECEIVE settings values from background for display on settings sliders
//   chrome.runtime.sendMessage({ method: "sendSettingsToPopup", data: "" }, function (res) { 
//     //console.log('popup received this data from sendSettingsToPopup:', res);
   
//     workSlider.val(res.data.workDuration);
//     workSliderVal.html(res.data.workDuration);
//     res.data.workTimeUnit === "minutes" ? toggleSettingsCSS(workMinutes, workTimeUnits) : toggleSettingsCSS(workSeconds, workTimeUnits);
    
//     breakSlider.val(res.data.breakDuration);
//     breakSliderVal.html(res.data.breakDuration);
//     res.data.breakTimeUnit === "minutes" ? toggleSettingsCSS(breakMinutes, breakTimeUnits) : toggleSettingsCSS(breakSeconds, breakTimeUnits);
//   })
// }

//#region toggle time units
function toggleWorkTimeUnit (timeUnit){ 
  let clicked = timeUnit.data.clicked ; //unit of time that was clicked (seconds or minutes)

  if (currentWorkTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    sendDataToBG("changeSettings", { workDuration: workSlider.val(), workTimeUnit: currentWorkTimeUnit });
    toggleSettingsCSS(this, workTimeUnits);
  } 
}

function toggleBreakTimeUnit (timeUnit){ 
  let clicked = timeUnit.data.clicked ; //unit of time that was clicked (seconds or minutes)

  if (currentBreakTimeUnit != clicked) { //if we clicked the inactive one, activate it and deactivate the other
    sendDataToBG("changeSettings", { breakDuration: breakSlider.val(), breakTimeUnit: currentBreakTimeUnit });
    toggleSettingsCSS(this, breakTimeUnits);
  } 
}

function toggleSettingsCSS(clickedElement, elementList){
  //helper that keeps toggleXTimeUnit functions DRY - flip CSS classes for minutes/seconds on settings toggle
  currentWorkTimeUnit = clickedElement;

  for(const element of elementList){ //make all elements inactive
    element.addClass('timeUnitInactive');
    element.removeClass('timeUnitActive');
  }
  $(clickedElement).addClass('timeUnitActive'); //activate only our clicked element
  $(clickedElement).removeClass('timeUnitInactive');
}
//#endregion

function sendDataToBG(_method, _data){
  chrome.runtime.sendMessage({ method: _method, data: _data }, function (res) {
    return true;
  });
}

//#region sliders value change
//todo on refactor day - combine these xSlider.on'input' and xSlider.on'change functions = DRYer
workSlider.on('input', function () {
  //input fires constantly, i.e. while mouse is still down the value will change
  workSliderVal.html(`${$(this).val()}`);
});

workSlider.on('change', function () {
  //change fires only after mouse is released
  sendDataToBG("changeSettings", { workDuration: +$(this).val(), workTimeUnit: currentWorkTimeUnit });
});

breakSlider.on('input', function () {
  //input fires constantly, i.e. while mouse is still down the value will change
  breakSliderVal.html(`${$(this).val()}`);
});

breakSlider.on('change', function () {
  //change fires only after mouse is released
  sendDataToBG("changeSettings", { breakDuration: +$(this).val(), breakTimeUnit: currentBreakTimeUnit });
});
//#endregion

//#region open nav icons
function openHome(){
  unselectAllIcons();
  homeArea.show()
  homeIcon.attr('src','./images/Home.png');
}

function openStats(){
  // unselectAllIcons();
  // statsArea.show();
  //statsIcon.attr('src',
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

// function takeBreak(){ 
//   //runs when user clicks "take a break (or take a break early)"
//   chrome.notifications.clear('timeToBreak');

//   breakButton.css('background-color','#819C50');

//   //using this setup to SEND "true" to background (re: click "take a break" = true)
//   chrome.runtime.sendMessage({ method: "isTakingBreak", data: true }, function (res) {
//     return true;
//   });
// }

// function checkStatus(){ 
//   //continually running (2 per second) function that fetches countdown from background.js
//   setInterval(() => { 
//     updateHomeDOM();
//   }, 500); //(ms) - runs twice per second
// }


