# Twilio Conference Call System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

複数人での電話会議を簡単に開始できるTwilio Serverlessアプリケーションです。自動録音機能付きで、電話番号・ブラウザ電話・SIPアドレスへの発信に対応しています。
start-callのURLを実行した際に、引数で会議に招集したい人の宛先を指定することで、同じ会議に対して招集できます。

## デモ

```bash
# 3者間通話の例
curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
  -d "phoneNumbers=+8190xxxxx,client:test1,sip:sipuser1@xxx.sip.twilio.com"
```

## 前提条件

以下のツール・アカウントが必要です：

- **Node.js** (v18以上推奨)
- **npm** または **yarn**
- **Twilio CLI** 
- **Twilioアカウント** (有料プランが必要)
  - 電話番号の購入が必要
  - Voice機能が有効なアカウント

##  インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/conference-simple.git
cd conference-simple
```

### 2. Twilio CLIのインストール

```bash
# macOS (Homebrew)
brew tap twilio/brew && brew install twilio

# Windows (Scoop)
scoop bucket add twilio-scoop https://github.com/twilio/scoop-twilio-cli
scoop install twilio

# その他のOS
npm install -g twilio-cli
```

### 3. Twilio CLIのセットアップ

```bash
# Twilioアカウントにログイン
twilio login

# Serverlessプラグインをインストール
twilio plugins:install @twilio-labs/plugin-serverless
```

### 4. 依存関係のインストール

```bash
npm install
```

### 5. 環境設定

`.env`ファイルを作成し、以下の情報を設定：

```bash
# Twilioコンソール (https://console.twilio.com) から取得
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API Key作成 (オプション - より安全)
# https://console.twilio.com/console/project/api-keys
API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. デプロイ

```bash
# 開発環境へデプロイ
twilio serverless:deploy

# 本番環境へデプロイ
twilio serverless:deploy --environment=production
```

デプロイ後、以下のようなURLが表示されます：
- Functions: `https://conference-xxxx-xxxxxx-dev.twil.io/`

## アーキテクチャ

### Functions
- `/start-call` - カンファレンスに参加するメンバーへの発信を開始
- `/join-conference` - 録音付きでConferenceに参加するためのTwiMLエンドポイント
- `/recording-status` - 録音完了通知を受信するWebhookエンドポイント
- `/token.js` - ブラウザ電話用のトークンサーバ

### Assets
- `/phone.html` - ブラウザ電話（着信専用）
- `twilio.min.js` - Twilio Programmable Voice SDK v2

### 主な機能
- 複数の参加者への自動発信
- 日本語音声案内付きのConference接続
- Conference開始時からの自動録音
- 録音完了時のURL記録

## 使い方

### 電話会議の開始
#### 基本的な使い方

`phoneNumbers`パラメータに2〜10個の接続先を指定できます。

```bash
# 2者間通話
curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
  -d "phoneNumbers=+8190xxxxx,+8180xxxxx"


# 複数人通話（最大10人）
curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
  -d "phoneNumbers=+8190xxxxx,sip:sipuser1@xxx.sip.twilio.com,client:test1"

```

#### 対応している接続方法

1. **電話番号**: E164形式（+81xxxxx）
   ```
   phoneNumbers=+8190xxxxx
   ```

2. **ブラウザ電話**: client:ID形式
   ```
   phoneNumbers=client:test1
   ```

3. **SIPアドレス**: sip:アドレス形式
   ```
   phoneNumbers=sip:sipuser1@domain.sip.twilio.com
   ```

### ブラウザ電話の利用(受電専用)

1. 以下のURLにアクセス：
   ```
   https://conference-xxxx-xxxxxx-dev.twil.io/phone.html
   ```

2. 任意のユーザー名を入力（例：test1）

3. 別の端末でも同様に設定（例：test2）

4. 電話会議を開始：
   ```bash
   curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
     -d "phoneNumbers=client:test1,client:test2"
   ```

## 設定詳細

### 会議室の設定
- **会議室名**: `conf-room-xxxxxxxxxx` (ランダム生成)
- **最大参加者数**: 10人
- **タイムアウト**: 120秒（2分）
- **録音**: 自動開始（MP3/WAV形式）
- **音声案内**: 日本語（ja-JP）

### 音声案内

参加者には以下の日本語案内が流れます：
> "相手に接続します。通話は録音されます。"

## 録音について

- 会議開始と同時に自動的に録音開始
- 録音完了後、`/recording-status`のログに録音URLが出力
- 録音形式：MP3およびWAV形式で利用可能
- ステレオ録音（RequestedChannels=2）対応

### 録音ファイルの取得例

```bash
# Twilio認証情報を使用してダウンロード
curl -u ACCOUNT_SID:AUTH_TOKEN \
  "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Recordings/{RecordingSid}.mp3?RequestedChannels=2" \
  --output recording.mp3
```

## 開発・テスト

### ローカル開発

```bash
# ローカルサーバーの起動
twilio serverless:start

# 特定のポートで起動
twilio serverless:start --port 3001
```

### ログの確認

```bash
# デプロイ済み関数のログを確認
twilio serverless:logs --environment=dev
```

## トラブルシューティング

### よくある問題

1. **発信が失敗する**
   - Twilioアカウントに十分なクレジットがあるか確認
   - 発信先の電話番号が正しい形式か確認
   - Twilioの電話番号が購入済みか確認

2. **ブラウザ電話が動作しない**
   - HTTPSでアクセスしているか確認
   - マイクの権限が許可されているか確認

3. **録音ファイルが取得できない**
   - ACCOUNT_SIDとAUTH_TOKENが正しいか確認
   - 録音が完了するまで待つ（会議終了後）

## サポート

問題や質問がある場合は、[Issues](https://github.com/yourusername/conference-simple/issues)でお知らせください。



