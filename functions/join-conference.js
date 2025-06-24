exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const roomName = event.room || event.conferenceRoom || event.To;
  const from = event.From || '';
  
  // ブラウザ電話からの発信の場合はアナウンスをスキップ
  if (!from.startsWith('client:')) {
    twiml.say({
      language: 'ja-JP'
    }, '相手に接続します。通話は録音されます。');
  }
  
  const dial = twiml.dial();
  
  // ブラウザ電話が主催者の場合、最初に会議を開始
  const isHost = from.startsWith('client:');
  
  dial.conference({
    region: "jp1",
    startConferenceOnEnter: true,
    endConferenceOnExit: false,
    record: 'record-from-start',
    recordingStatusCallback: `https://${context.DOMAIN_NAME}/recording-status`,
    recordingStatusCallbackEvent: 'completed'
  }, roomName);
  
  callback(null, twiml);
};