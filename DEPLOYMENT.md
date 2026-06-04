## EduPath backend deployment

### Environment

Copy `.env.example` to `.env` and set strong `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, `MONGODB_URI`, and payment keys for production.

### Docker

```bash
docker compose up --build -d
```

API: `http://localhost:3000` · Swagger: `http://localhost:3000/api/docs`

### Database seed

With MongoDB running:

```bash
npm run seed
```

Creates admin `admin@edupath.local` / `Admin123!`, a category, a sample published course, and default commission settings.

### PM2 (VPS)

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

### Nginx (reverse proxy)

Place TLS certificates on the server and proxy `https://api.yourdomain` to `http://127.0.0.1:3000`. Example server block:

```nginx
server {
  listen 443 ssl http2;
  server_name api.example.com;
  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

For Stripe webhooks, configure the dashboard to hit `POST /payments/webhook/stripe` and verify signatures using `STRIPE_WEBHOOK_SECRET` (extend `PaymentGatewayService` to call the Stripe SDK).

### Realtime

Socket.IO namespace: `/notifications`. Clients should connect and subscribe per user room in a future iteration (gateway currently broadcasts `notification` events to targeted user rooms when `join` is implemented).

### CI

Run `npm run build` and `npm test` in your pipeline against a service container running MongoDB.
