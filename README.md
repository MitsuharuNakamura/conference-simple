# Twilio Conference Call System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

複数人での電話会議を簡単に開始できるTwilio Serverlessアプリケーションです。自動録音機能付きで、電話番号・ブラウザ電話・SIPアドレスへの発信に対応しています。
start-callのURLを実行した際に、引数で会議に招集したい人の宛先を指定することで、同じ会議に対して招集できます。また、ブラウザ電話から会議を主催することも可能です。

## デモ

```bash
# 3者間通話の例
curl -X POST https://conference-xxxx-xxxxxx-dev.twil.io/start-call \
  -d "phoneNumbers=+8190xxxxx,client:test1,sip:sipuser1@xxx.sip.twilio.com"
```

## 前提条件

以下のツール・アカウントが必要です：

- **Node.js** (v22以上推奨)
- **npm** または **yarn**
- **Twilio CLI** 
- **Twilioアカウント** (有料プランが必要)
  - 電話番号の購入が必要
  - Voice機能が有効なアカウント

##  インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/MitsuharuNakamura/conference-simple.git
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

# Twilioで購入した電話番号（発信者番号として利用）
TWILIO_PHONE_NUMBER=+xxxxxxxxxxxx
# ブラウザ電話から会議を招集する際に利用
TWIML_APP_SID=APxxxxxxxxxxxxx
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
- `/token` - ブラウザ電話用のアクセストークン生成
- `/voice` - ブラウザ電話からの発信処理（TwiML App用）
- `/create-conference` - 会議作成と参加者招待のAPI
- `/add-participants` - 既存の会議に参加者を追加招集するAPI

### Assets
- `/phone.html` - ブラウザ電話（着信・発信・会議主催機能付き）
- `/twilio.min.js` - Twilio Programmable Voice SDK v2

### 主な機能
- 複数の参加者への自動発信
- ブラウザ電話からの会議主催機能
- 会議中の追加参加者招集機能
- 日本語音声案内付きのConference接続
- Conference開始時からの自動録音（Dual録音対応）
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

### ブラウザ電話の利用

#### 着信機能

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

#### 会議主催機能（新機能）

1. ブラウザ電話にアクセスしてユーザー名でログイン

2. 「会議を主催」セクションで参加者の電話番号をカンマ区切りで入力：
   ```
   +8190xxxxx,+8180xxxxx,client:test2
   ```

3. 「会議を開始」ボタンをクリック

4. 主催者が会議室に参加すると、自動的に指定した参加者に発信されます

#### 会議中の追加招集機能（新機能）

1. 会議開始後、「参加者を追加」セクションが自動的に表示されます

2. 追加したい参加者の電話番号をカンマ区切りで入力：
   ```
   +8190xxxxx,client:test3,sip:user@domain.sip.twilio.com
   ```

3. 「参加者を追加」ボタンをクリック

4. 新しい参加者に自動的に発信され、既存の会議に参加します

**追加招集の特徴**：
- 会議中いつでも新しい参加者を追加可能
- 複数の参加者を一度に追加可能
- 電話番号、ブラウザ電話（client:）、SIPアドレスすべてに対応
- 追加された参加者も自動的に録音対象に含まれる

## 設定詳細

### 会議室の設定
- **会議室名**: `conf-room-xxxxxxxxxx` (ランダム生成)
- **最大参加者数**: 10人（追加招集含む）
- **録音**: 自動開始（MP3/WAV形式）
- **録音チャンネル**: Dual録音（各参加者の音声を別チャンネルで録音）
- **音声案内**: 日本語（ja-JP）

### 音声案内

参加者には以下の日本語案内が流れます：
> "相手に接続します。通話は録音されます。"

## 録音について

- 会議開始と同時に自動的に録音開始
- 録音完了後、`/recording-status`のログに録音URLが出力
- 録音形式：MP3およびWAV形式で利用可能
- ステレオ録音（RequestedChannels=2）でダウンロード可能

### 録音ファイルの取得例

```bash
# Twilio認証情報を使用してダウンロード
curl -u ACCOUNT_SID:AUTH_TOKEN \
  "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Recordings/{RecordingSid}.mp3?RequestedChannels=2" \
  --output recording.mp3
```

## セットアップ手順（ブラウザ電話会議主催機能）

ブラウザ電話から会議を主催するには、以下の追加設定が必要です：

### 1. TwiML Appの設定

1. [Twilioコンソール](https://console.twilio.com)にログイン
2. Develop > Voice > Manage > TwiML Apps にアクセス
3. 新しいTwiML Appを作成または既存のものを編集
4. Voice URLに以下を設定：
   - Request URL: `https://conference-xxxx-xxxxxx-dev.twil.io/voice`
   - HTTP Method: `POST`
5. 保存してTwiML App SIDをコピー

### 2. 環境変数の追加
`.env`ファイルにTwimlAppのSIDを設定

```
```bash
# Twilioで購入した電話番号（発信者番号として利用）
TWILIO_PHONE_NUMBER=+xxxxxxxxxxxx
# ブラウザ電話から会議を招集する際に利用
TWIML_APP_SID=APxxxxxxxxxxxxx
```

```

### 3. API Keyの作成（未作成の場合）

1. [API Keys](https://console.twilio.com/us1/account/keys)にアクセス
2. "Create new API Key"をクリック
3. Friendly Name: `Browser Phone Key`、Key Type: `Standard`
4. 作成後、SIDとSecretを環境変数に設定
