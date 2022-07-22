## 開発

### 初回のみ

ライブラリインストール

```
npm install
```

環境変数の設定

```
.env.local.exampleを複製して、.env.localにリネーム
適切な値を設定
```

### 開発サーバの立ち上げ

```
npm run dev
```

### LIFF を利用する場合

https://zenn.dev/sotszk/articles/b4e6a4e19d2e35 を参照して、root に`/cert/localhost.key`と`/cert/localhost.crt`を生成する

開発サーバの立ち上げは、`npm run dev:https`を利用する
