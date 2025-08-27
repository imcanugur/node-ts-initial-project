# Backend

[![Lint](https://github.com/the-cans-group/backend/actions/workflows/lint.yml/badge.svg)](https://github.com/the-cans-group/backend/actions/workflows/lint.yml)

### Kurulum

1. **Proje Dizinine Git**:

   ```bash
   cd backend
   ```

2. **Bağımlılıkları Yükle**:

   ```bash
   npm install
   ```

3. **Konfigürasyon Dosyasını Oluşturun**: `config/default.json` dosyasını oluşturun ve aşağıdaki temel konfigürasyon bilgilerini ekleyin:
   (Frontend(NextJs) için Normal api isteklerini gene 3000 portuna istek atın, 1477 portuna istek atmayın, next js üzerinden yönlendirme yapılandırıldı)

```json
{
  "app": {
    "host": "127.0.0.1",
    "port": 1477,
    "key": "jwt_secret_key", // JWT için gizli anahtar
    "expires_in": "365d", // Token geçerlilik süresi 365 gün
    "env": "develeopment", // Uygulama ortamı, "production" || "development"
    "redis": {
      "host": "localhost",
      "db": 7,
      "port": 6379,
      "expires_in": 31536000000, // Token geçerlilik süresi 365 gün
      "family": 4
    },
    "rate_limiter": {
      "points": 500, // Kullanıcı başına izin verilen istek sayısı
      "duration": 60, // Dakikada 5 istek
      "blockDuration": 60 // 1 dakika boyunca engelleme
    },
    "logger": {
      "logFile": "logs/%DATE%.log", // Günlük dosya adı
      "datePattern": "YYYY-MM-DD", // Dosya adında tarih formatı
      "zippedArchive": true, // Log dosyalarını sıkıştır
      "maxSize": "20m", // Maksimum log dosyası boyutu
      "maxFiles": "30d" // 30 gün boyunca log dosyalarını sakla
    }
  },
  "db": {
    "type": "postgres",
    "host": "127.0.0.1",
    "port": 5432,
    "name": "initial",
    "username": "postgres",
    "password": "password",
    "synchronize": true,
    "logging": false,
    "ssl": false
  },
  "azure": {
    "storageAccount": "storageaccountname",
    "storageKey": "/...key.../",
    "containerName": "media"
  },
  "mail": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "no-reply@example.com",
    "pass": "password",
    "from": "Example <no-reply@example.com>",
    "log": true
  },
  "netgsm": {
    "usercode": "usercode",
    "password": "password",
    "msgheader": "msgheader",
    "domain": "https://api.netgsm.com.tr/",
    "crmdomain": "http://crmsntrl.netgsm.com.tr:9111/:usercode/"
  }
}
```   

4**Veritabanını Başlatın** (Varsa):

```bash
npm run seed
```

5**API Sunucusunu Başlatın**:

```bash
npm run dev
```
