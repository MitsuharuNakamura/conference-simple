exports.handler = async function(context, event, callback) {
  // レスポンスオブジェクトを作成
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエストへの対応（CORS）
  if (event.request.method === 'OPTIONS') {
    return callback(null, response);
  }

  const { conferenceRoom, phoneNumbers } = event;
  
  // パラメータの検証
  if (!conferenceRoom || !phoneNumbers) {
    response.setStatusCode(400);
    response.setBody({ error: 'Missing required parameters: conferenceRoom and phoneNumbers' });
    return callback(null, response);
  }

  // カンマ区切りの電話番号を配列に変換
  const numbersArray = phoneNumbers.split(',').map(num => num.trim()).filter(num => num);
  
  if (numbersArray.length === 0) {
    response.setStatusCode(400);
    response.setBody({ error: 'No valid phone numbers provided' });
    return callback(null, response);
  }

  // Twilioクライアントを初期化
  const client = context.getTwilioClient();
  
  try {
    // 既存の会議が存在するか確認
    console.log(`Adding participants to conference: ${conferenceRoom}`);
    
    // 各参加者に対して非同期で発信
    const callPromises = numbersArray.map(number => {
      const callParams = {
        to: number,
        from: context.TWILIO_PHONE_NUMBER,
        url: `https://${context.DOMAIN_NAME}/join-conference?conferenceRoom=${encodeURIComponent(conferenceRoom)}`,
        machineDetection: 'Enable',
        machineDetectionTimeout: 30
      };
      
      return client.calls.create(callParams);
    });

    // すべての発信を実行
    const calls = await Promise.all(callPromises);
    
    // 発信SIDのリストを作成
    const callSids = calls.map(call => call.sid);
    
    console.log(`Added ${calls.length} participants to conference ${conferenceRoom}`);
    
    response.setStatusCode(200);
    response.setBody({
      success: true,
      conferenceRoom: conferenceRoom,
      addedCount: calls.length,
      callSids: callSids
    });
    
  } catch (error) {
    console.error('Error adding participants to conference:', error);
    response.setStatusCode(500);
    response.setBody({ error: error.message });
  }
  
  return callback(null, response);
};