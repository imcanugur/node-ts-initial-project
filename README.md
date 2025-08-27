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

4**Veritabanını Başlatın** (Varsa):

   ```bash
   npm run seed
   ```

5**API Sunucusunu Başlatın**:
   ```bash
   npm run dev
   ```