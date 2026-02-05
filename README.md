# CRMシステム

法人顧客管理と営業活動履歴を管理するCRMシステムです。

## 技術スタック

- **フロントエンド**: React + Vite + TailwindCSS
- **バックエンド**: Node.js + Express
- **データベース**: SQLite3
- **認証**: JWT

## 機能

- ユーザー認証（管理者/一般ユーザー）
- 法人情報管理
- 取引先担当者管理
- 活動履歴管理
- **見積書管理（ファイルアップロード・ダウンロード）**
- ネクストアクション管理
- ダッシュボード（期日超過アラート）
- ユーザー管理（管理者のみ）

## セットアップ

### 1. バックエンドのセットアップ

```bash
cd backend
npm install
node server.js
```

バックエンドは `http://localhost:3000` で起動します。

### 2. フロントエンドのセットアップ

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

## 初期ログイン情報

- **ログインID**: admin
- **パスワード**: admin

初回起動時に自動的に管理者ユーザーが作成されます。

## ディレクトリ構造

```
CRM/
├── backend/
│   ├── src/
│   │   ├── config/         # データベース設定
│   │   ├── models/         # データモデル
│   │   ├── controllers/    # コントローラー
│   │   ├── routes/         # APIルート
│   │   └── middleware/     # 認証・権限管理
│   ├── database/           # SQLiteデータベース
│   └── server.js           # エントリーポイント
├── frontend/
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── contexts/       # Context API
│   │   └── services/       # API通信
│   └── index.html
└── README.md
```

## 主要API

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

### 法人
- `GET /api/companies` - 法人一覧取得
- `POST /api/companies` - 法人作成
- `GET /api/companies/:id` - 法人詳細取得
- `PUT /api/companies/:id` - 法人更新
- `DELETE /api/companies/:id` - 法人削除

### 活動履歴
- `GET /api/activities/company/:company_id` - 法人の活動履歴取得
- `POST /api/activities/company/:company_id` - 活動履歴作成
- `GET /api/activities/next-actions` - ネクストアクション一覧
- `GET /api/activities/overdue` - 期日超過アクション

### 見積書
- `GET /api/quotations/company/:company_id` - 法人の見積書一覧取得
- `POST /api/quotations/company/:company_id` - 見積書アップロード (multipart/form-data)
- `GET /api/quotations/:id/download` - 見積書ダウンロード
- `PUT /api/quotations/:id` - 見積書情報更新
- `DELETE /api/quotations/:id` - 見積書削除

### ユーザー（管理者のみ）
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成
- `POST /api/users/:id/deactivate` - ユーザー無効化

## 権限管理

### 管理者
- 全法人情報の閲覧・編集・削除
- 全活動履歴の閲覧・編集・削除
- ユーザー管理

### 一般ユーザー
- 担当法人の閲覧・編集
- 自分が登録した活動履歴の編集・削除
- 他ユーザーのデータは閲覧のみ

## データベース

SQLiteを使用しています。データベースファイルは `backend/database/crm.db` に自動作成されます。

### バックアップ

```bash
sqlite3 backend/database/crm.db ".backup 'backup/crm_backup.db'"
```

## 注意事項

- 本システムは小規模組織向け（同時利用20名以下）を想定
- SQLiteの制約により、大量の同時書き込みには不向き
- 本番環境では `.env` ファイルの `JWT_SECRET` を必ず変更してください
- 定期的なバックアップを推奨します

## ライセンス

MIT License
