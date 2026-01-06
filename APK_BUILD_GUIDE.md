# 📱 Medilog APK Oluşturma Rehberi

Bu rehber, Medilog uygulamasının Android APK dosyasını oluşturmak için gereken adımları içerir.

## 🎯 Önemli Not

Uygulama şu anda **MOCK MODE** (demo modu) ile çalışacak şekilde yapılandırılmıştır. Bu sayede backend sunucusu olmadan çalışabilir ve örnek verilerle sunum yapabilirsiniz.

## 📋 Ön Gereksinimler

1. **Node.js** yüklü olmalı (v16 veya üzeri)
2. **Expo CLI** yüklü olmalı
3. **EAS CLI** yüklü olmalı (Expo build servisi için)
4. **Expo hesabı** (ücretsiz)

## 🚀 Hızlı Başlangıç

### 1. Paketleri Yükleyin

```bash
cd frontend
npm install
# veya
yarn install
```

### 2. EAS CLI Yükleyin (eğer yüklü değilse)

```bash
npm install -g eas-cli
```

### 3. Expo Hesabına Giriş Yapın

```bash
eas login
```

### 4. EAS Projesini Yapılandırın

```bash
eas build:configure
```

Bu komut `eas.json` dosyasını oluşturacaktır.

### 5. APK Build'i Başlatın

```bash
# Android APK için
eas build -p android --profile preview

# veya AAB (Google Play için) isterseniz
eas build -p android --profile production
```

**Not:**
- `preview` profili APK dosyası oluşturur (doğrudan cihaza yüklenebilir)
- `production` profili AAB dosyası oluşturur (Google Play Store için)

### 6. Build İzleme

Build başladığında size bir link verilecek. Bu linkten build sürecini takip edebilirsiniz.

Build tamamlandığında (5-20 dakika sürebilir), APK dosyasını indirebilirsiniz.

### 7. APK'yı Cihaza Yükleme

1. Build tamamlandığında verilen linkten APK'yı indirin
2. APK dosyasını telefonunuza gönderin (WhatsApp, email, USB vb.)
3. Telefonunuzda "Bilinmeyen Kaynaklardan Yükleme" iznini verin
4. APK dosyasına tıklayıp yükleyin

## 📱 Yerel Build (EAS kullanmadan)

Eğer yerel olarak build almak isterseniz:

```bash
# Android Studio ve Java SDK gereklidir

# 1. Development build oluştur
npx expo run:android

# 2. APK export et
cd android
./gradlew assembleRelease

# APK dosyası şurada olacak:
# android/app/build/outputs/apk/release/app-release.apk
```

## 🎨 Özelleştirme

### App İsmi ve İkon Değiştirme

`app.json` dosyasında:
```json
{
  "expo": {
    "name": "Medilog",
    "icon": "./assets/images/icon.png",
    "android": {
      "package": "com.medilog.app"
    }
  }
}
```

### Splash Screen

`app.json` içindeki splash screen ayarlarını düzenleyin.

## 🔧 Mock Mode'u Kapatma

Backend'i hazırladıktan sonra gerçek API'yi kullanmak için:

1. `frontend/services/api.ts` dosyasını açın
2. `USE_MOCK_API` değerini `false` yapın:
   ```typescript
   const USE_MOCK_API = false;
   ```
3. `.env` dosyası oluşturun:
   ```
   EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
   ```
4. Yeni bir build alın

## 📊 Mock Data İçeriği

Demo modunda şu veriler görünür:
- 3 aktif ilaç (Coraspin, Plavix, Concor)
- Bugünkü doz kayıtları
- İlerleyiş istatistikleri (%86.67 adherence)
- Demo kullanıcı hesabı

## ⚙️ EAS Build Profilleri

`eas.json` örnek konfigürasyon:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## 🎯 Sunum İpuçları

1. **Giriş Ekranı**: Herhangi bir email/şifre ile giriş yapabilirsiniz (mock mode)
2. **Ana Sayfa**: 3 aktif ilaç ve günlük doz takibi görünür
3. **İlaçlar**: Tüm ilaçları görüntüleyebilir, detaylarına bakabilirsiniz
4. **Doz Takibi**: Dozları "alındı" olarak işaretleyebilirsiniz
5. **İlerleyiş**: Adherans istatistiklerini görebilirsiniz
6. **İlaç Ekleme**: Fotoğraf çekme özelliği çalışır (mock AI response)

## 🐛 Sorun Giderme

### Build Başarısız Oluyor

```bash
# Cache temizle
eas build:cancel
rm -rf node_modules
npm install
eas build -p android --profile preview --clear-cache
```

### APK Yüklenmiyor

- "Bilinmeyen Kaynaklardan Yükleme" izninin açık olduğundan emin olun
- Play Protect'in bloklayıp bloklamadığını kontrol edin

### Uygulama Açılmıyor

- Telefonun Android sürümünü kontrol edin (minimum Android 6.0)
- Gerekli izinlerin verildiğinden emin olun

## 📞 Destek

Sorunlarla karşılaşırsanız:
- Expo dokümanları: https://docs.expo.dev/
- EAS Build dokümanları: https://docs.expo.dev/build/introduction/

## ✅ Checklist

- [ ] Node.js yüklü
- [ ] Expo CLI yüklü
- [ ] EAS CLI yüklü
- [ ] Expo hesabı oluşturuldu
- [ ] `npm install` çalıştırıldı
- [ ] `eas login` yapıldı
- [ ] `eas build:configure` çalıştırıldı
- [ ] `eas build -p android --profile preview` komutu çalıştırıldı
- [ ] Build tamamlandı
- [ ] APK indirildi
- [ ] APK cihaza yüklendi
- [ ] Uygulama başarıyla çalışıyor

## 🎉 Başarıyla Tamamlandı!

APK'nızı cihazınıza yükledikten sonra sunumda kullanabilirsiniz!
