exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const roomName = event.room;
  
  twiml.say({
    language: 'ja-JP'
  }, '相手に接続します。通話は録音されます。');
  
  const dial = twiml.dial();
  
  dial.conference({
    region: "jp1",
    startConferenceOnEnter: true,
    endConferenceOnExit: false,
    record: 'record-from-start',
    timeout: 120,
//    recordingStatusCallback: `https://${context.DOMAIN_NAME}/recording-status`,
//    recordingStatusCallbackEvent: 'completed'
  }, roomName);
  
  callback(null, twiml);
};