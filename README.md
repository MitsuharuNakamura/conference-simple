## プロジェクト概要

このプロジェクトは、Twilio Serverlessを使用して複数人での電話会議システムを実装しています。自動録音機能付きで、TwilioのVoice APIを使用して複数の参加者に発信し、Conferenceで接続します。

## アーキテクチャ

### Functions
- `/start-call` - カンファレンスに参加するメンバーへの発信を開始
- `/join-conference` - 録音付きで会議に参加するためのTwiMLエンドポイント
- `/recording-status` - 録音完了通知を受信するWebhookエンドポイント
- `/token.js` - ブラウザ電話用のトークンサーバ

### Assets
- `/phoen.html` - ブラウザ電話（着信専用）
- `twilio.min.js` - Twilio Programmable Voice SDK v2

### 主な機能
- 複数の参加者への自動発信
- 日本語音声案内付きのConference接続
- 会議開始時からの自動録音
- 録音完了時のURL記録

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# Twilioへのデプロイ
twilio serverless:deploy
```

## 環境変数(.env)
- `ACCOUNT_SID` - TwilioのアカウントSID
- `AUTH_TOKEN` - TwilioのAuth Token
- `API_KEY` - TwilioのAPI Key
- `API_SECRET` - TwilioのAPI Secret

### 会議通話の開始
`start-call`を実行する際には。`phoneNumbers`に会議参加者の電話番号、ブラウザ電話のID、SIPのアドレスのどれかを2〜最大10個まで指定できます。
- 電話番号は、E164形式（+81xxxxx）国番号から始まる電話番号を指定。
- ブラウザ電話のIDは、「client:」をつけてブラウザ電話に入力した任意のIDを指定。
- SIPのアドレスは、「sip:」をつけて指定のSIPアドレスを指定。

#### 2者間通話の例
curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
  -d "phoneNumbers=+8190xxxxx,+8180xxxxx"

#### 複数人通話の例（最大10人まで）
curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
  -d "phoneNumbers=+8190xxxxx,sip:sipuser1@xxx.sip.twilio.com,client:test1"

#### ブラウザ電話同士
2つの端末で下記にアクセスし、ユーザー名をtest1, test2ではいる。
https://conference-xxxx-xxxxxx-dev.twil.io/phone.html

### 会議設定
- Conference名: `conf-room-xxxxxxxxxx`
- 録音: 開始時から自動
- 録音形式: MP3とWAVで利用可能
- 音声案内: 日本語 (ja-JP)

## 重要な注意事項

- 参加者は参加前に日本語案内を聞きます: "相手に接続します。通話は録音されます。"
- 録音URLは `/recording-status` 関数のコンソールに記録されます
- Conferenceから全員が抜けるまで、Conferenceが維持されますが、２分でタイムアウトします。



