# Renderへのデプロイメントガイド

## 前提条件

- GitHubアカウント
- Renderアカウント（無料）

## デプロイ手順

### 1. GitHubリポジトリの準備

コードが既にGitHubにプッシュされていることを確認してください：
```
https://github.com/kasumi-87/CRM.git
```

### 2. Renderでデプロイ

1. [Render](https://render.com)にログイン
2. ダッシュボードで **"New +"** → **"Web Service"** をクリック
3. **"Build and deploy from a Git repository"** を選択
4. GitHubリポジトリ `kasumi-87/CRM` を選択
5. 以下の設定を入力：

#### 基本設定
- **Name**: `crm-system`（任意の名前）
- **Region**: `Oregon (US West)`（または最寄りのリージョン）
- **Branch**: `main`
- **Root Directory**: （空白のまま）
- **Environment**: `Node`
- **Build Command**: `npm run install-all && npm run build`
- **Start Command**: `npm start`

#### 環境変数
- `NODE_ENV`: `production`
- `JWT_SECRET`: ランダムな文字列（Renderが自動生成可能）

#### インスタンスタイプ
- **Plan**: `Free`

#### ディスク設定（SQLiteデータベース用）
1. **Add Disk** をクリック
2. **Name**: `crm-data`
3. **Mount Path**: `/opt/render/project/src/backend/database`
4. **Size**: `1 GB`

6. **"Create Web Service"** をクリック

### 3. デプロイの確認

- デプロイには5〜10分かかります
- ログでビルドの進行状況を確認できます
- デプロイが完了すると、URLが発行されます：
  - 例: `https://crm-system-xxxx.onrender.com`

### 4. 初回アクセス

1. 発行されたURLにアクセス
2. ログイン画面が表示されます
3. 初期管理者アカウントでログイン：
   - **ログインID**: `admin`
   - **パスワード**: `admin`
4. ログイン後、必ずパスワードを変更してください

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドログを確認**
   - Renderのダッシュボードで "Logs" タブを確認
   - エラーメッセージを確認

2. **よくある問題**
   - Node.jsバージョン: package.jsonで `"engines": { "node": ">=18.0.0" }` を確認
   - 依存関係: `npm run install-all` が正常に実行されることを確認

### データベースが初期化されない場合

- Diskが正しくマウントされているか確認
- `/opt/render/project/src/backend/database` パスが正しいか確認

### フロントエンドが表示されない場合

- `npm run build` が成功しているか確認
- `frontend/dist` ディレクトリが生成されているか確認

## 自動デプロイ

GitHubの `main` ブランチにプッシュすると、Renderが自動的に再デプロイします。

## スリープモード（無料プラン）

無料プランでは、15分間アクセスがないとサービスがスリープします：
- 初回アクセス時に起動に30秒〜1分かかることがあります
- 有料プラン（月$7〜）でスリープを無効化できます

## セキュリティ推奨事項

1. **初期パスワードの変更**: デプロイ後、すぐに `admin` アカウントのパスワードを変更
2. **JWT_SECRET**: 本番環境では強力なランダム文字列を使用
3. **HTTPS**: Renderは自動的にHTTPSを有効化します

## データベースバックアップ

SQLiteデータベースファイルは `/opt/render/project/src/backend/database/crm.db` に保存されます。

定期的なバックアップを推奨：
- Render Diskは永続化されますが、手動でのバックアップも推奨
- ダウンロード機能を使用してローカルにバックアップ

## サポート

問題が発生した場合は、GitHubリポジトリのIssuesで報告してください：
https://github.com/kasumi-87/CRM/issues
