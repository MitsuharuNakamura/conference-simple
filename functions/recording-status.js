exports.handler = function(context, event, callback) {
  console.log('Recording status webhook received:', event);
  
  if (event.RecordingStatus === 'completed') {
    const recordingSid = event.RecordingSid;
    const recordingUrl = event.RecordingUrl;
    const recordingDuration = event.RecordingDuration;
    
    console.log('=== Recording Completed ===');
    console.log(`Recording SID: ${recordingSid}`);
    console.log(`Recording URL: ${recordingUrl}`);
    console.log(`Duration: ${recordingDuration} seconds`);
    console.log(`Direct MP3 URL: ${recordingUrl}.mp3`);
    console.log(`Direct WAV URL: ${recordingUrl}.wav`);
    console.log('========================');
  }
  
  callback(null, {
    success: true,
    message: 'Recording status received'
  });
};