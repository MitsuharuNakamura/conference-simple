exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  
  const phoneNumbers = event.phoneNumbers ? event.phoneNumbers.split(',') : [];
  const identity = event.identity;
  const unixTimeMilliStr = Date.now().toString();
  const roomName = "conf-room-" + unixTimeMilliStr;

  if (!phoneNumbers.length || phoneNumbers.length < 2 || phoneNumbers.length > 10) {
    return callback('phoneNumbers parameter is required with 2-10 comma-separated phone numbers');
  }
  
  const twilioPhoneNumber = context.TWILIO_PHONE_NUMBER;
  
  if (!twilioPhoneNumber) {
    return callback('TWILIO_PHONE_NUMBER environment variable is not set');
  }
  
  const joinConferenceUrl = `https://${context.DOMAIN_NAME}/join-conference?room=${roomName}`;
  
  const createCall = async (destination) => {
    let to = destination;
    
    return await client.calls.create({
      url: joinConferenceUrl,
      to: to,
      from: twilioPhoneNumber,
      statusCallback: `https://${context.DOMAIN_NAME}/recording-status`,
      statusCallbackEvent: ['completed']
    });
  };
  
  try {
    const calls = [];
    for (const phoneNumber of phoneNumbers) {
      const call = await createCall(phoneNumber.trim());
      console.log(`Call initiated to ${phoneNumber}: ${call.sid}`);
      calls.push({
        phoneNumber: phoneNumber.trim(),
        sid: call.sid
      });
    }
    
    callback(null, {
      success: true,
      message: 'Calls initiated successfully',
      calls: calls,
      roomName: roomName
    });
  } catch (error) {
    console.error('Error initiating calls:', error);
    callback(error);
  }
};