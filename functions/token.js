exports.handler = function(context, event, callback) {
  const AccessToken = require('twilio').jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // Create an access token
  const identity = event.identity || 'browser-user';
  
  const accessToken = new AccessToken(
    context.ACCOUNT_SID,
    context.API_KEY,
    context.API_SECRET,
    { 
      identity: identity,
      ttl: 3600 // 1 hour
    }
  );

  // Create a Voice grant for SDK 2.0
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: context.TWIML_APP_SID,
    incomingAllow: true,
    pushCredentialSid: context.PUSH_CREDENTIAL_SID // Optional: for push notifications
  });

  // Add the grant to the token
  accessToken.addGrant(voiceGrant);

  // Return the token
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET, POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  response.setBody({
    token: accessToken.toJwt(),
    identity: identity
  });
  
  callback(null, response);
};