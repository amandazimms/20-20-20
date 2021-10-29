function makeLookTimerAlarm(){
  chrome.alarms.create('lookTimer', {
    delayInMinutes: .1
  });
}

makeLookTimerAlarm();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "lookTimer") {

    chrome.notifications.create('timeToLook', {
      type: 'basic',
      iconUrl: '/Eye128.png',
      title: 'Test Message',
      message: 'You are awesome!',
      buttons: [
        { title: 'Mark' },
        { title: 'Ignore' }
      ],
      priority: 2
    });
  }
});


chrome.notifications.onClosed.addListener(function(timeToLook) {
  //runs when this notification is closed
  console.log('CLOSED.');
  makeLookTimerAlarm();
});