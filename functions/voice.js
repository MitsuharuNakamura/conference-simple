exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  
  // ブラウザ電話からの発信を処理
  const to = event.To || '';
  const from = event.From || '';
  
  console.log(`Voice endpoint called - From: ${from}, To: ${to}, All params:`, event);
  
  // 会議室への発信の場合
  if (to && to.startsWith('conf-room-')) {
    console.log(`Joining conference: ${to}`);
    const dial = twiml.dial();
    dial.conference({
      region: "jp1",
      startConferenceOnEnter: true,
      endConferenceOnExit: false,
      record: 'record-from-start',
      recordingStatusCallback: `https://${context.DOMAIN_NAME}/recording-status`,
      recordingStatusCallbackEvent: 'completed'
    }, to);
  } else if (to) {
    // 通常の電話番号への発信
    console.log(`Dialing number: ${to}`);
    twiml.dial({
      callerId: context.TWILIO_PHONE_NUMBER
    }, to);
  } else {
    console.log('No "To" parameter provided');
    twiml.say('エラーが発生しました。発信先が指定されていません。');
  }
  
  console.log('TwiML Response:', twiml.toString());
  
  callback(null, twiml);
};