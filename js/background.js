chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "lookTimer") {
    console.log('alarm!ey');

    chrome.notifications.create('test', {
      type: 'basic',
      iconUrl: '/Eye128.png',
      title: 'Test Message',
      message: 'You are awesome!',
      priority: 2
    });
  }
});