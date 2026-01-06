# 🚀 Medilog - Sunum İçin Hızlı Başlangıç

## ⚡ En Hızlı Yol: APK Build

### 1. Gereksinimleri Yükle

```bash
cd frontend
npm install
npm install -g eas-cli
```

### 2. Expo'ya Giriş Yap

```bash
eas login
```

Henüz hesabınız yoksa https://expo.dev üzerinden ücretsiz oluşturun.

### 3. Build Başlat

```bash
eas build -p android --profile preview
```

- İlk defa çalıştırıyorsanız, birkaç soru soracak (hepsine ENTER basabilirsiniz)
- Build süreci 5-20 dakika sürer
- Build tamamlanınca size bir link verilir, oradan APK'yı indirin

### 4. APK'yı Telefonunuza Yükleyin

1. APK dosyasını telefonunuza gönderin
2. "Bilinmeyen Kaynaklardan Yükleme" iznini verin
3. APK'ya tıklayıp yükleyin

## 📱 Uygulamayı Kullanma (Demo Mode)

### Giriş Yapma
- **Email**: Herhangi bir email yazabilirsiniz (örn: demo@test.com)
- **Şifre**: Herhangi bir şifre yazabilirsiniz (örn: 123456)
- Mock mode olduğu için gerçek doğrulama yapılmaz

### Ana Özellikler

1. **Ana Sayfa**
   - 3 aktif ilaç görürsünüz
   - Bugünün dozları listelenmiş
   - Dozları "Alındı" olarak işaretleyebilirsiniz

2. **İlaçlar Sekmesi**
   - Coraspin, Plavix, Concor ilaçlarını görebilirsiniz
   - Her ilacın detaylarını görebilirsiniz
   - Farmakokinetik eğrileri görüntüleyebilirsiniz

3. **Dozlar Sekmesi**
   - Bugünün tüm dozlarını görebilirsiniz
   - Alınan/kaçırılan/bekleyen durumları görürsünüz

4. **İlerleyiş Sekmesi**
   - %86.67 adherans oranı
   - 5 günlük streak
   - Detaylı istatistikler

5. **Logout**
   - Sağ üst köşedeki çıkış ikonuna tıklayın

## 🎨 Demo Verileri

Uygulamada şu mock veriler bulunur:

**İlaçlar:**
- Coraspin 100mg (sabah 09:00)
- Plavix 75mg (akşam 20:00)
- Concor 5mg (sabah 08:00, akşam 20:00)

**İstatistikler:**
- Toplam 90 planlanan doz
- 78 alınan doz
- 8 kaçırılan doz
- %86.67 adherans oranı

## 🔧 Alternatif: Expo Go ile Test (Build olmadan)

Eğer APK build etmeden hızlıca test etmek isterseniz:

```bash
cd frontend
npm install
npx expo start
```

Ardından telefonunuza "Expo Go" uygulamasını yükleyip QR kodu okutun.

**Not:** Expo Go ile kamera ve bazı native özellikler çalışmayabilir.

## 📊 Sunum Senaryosu

1. **Giriş göster** (herhangi bir email/şifre)
2. **Ana sayfayı göster** (aktif ilaçlar, günlük dozlar)
3. **Bir dozu işaretle** (örn: Coraspin'i "alındı" yap)
4. **İlaçlar sekmesine geç**, bir ilacın detaylarını göster
5. **Farmakokinetik eğriyi göster** (ilaç detay sayfasında)
6. **İlerleyiş sekmesini göster** (istatistikler)
7. **Yeni ilaç ekleme** (fotoğraf çekme özelliğini göster)

## ⚠️ Önemli Notlar

- ✅ Uygulama tamamen offline çalışır (mock data)
- ✅ Internet bağlantısı gerekmez
- ✅ Backend sunucusu gerekmez
- ✅ Tüm veriler cihazda saklanır
- ✅ Her restart'ta veriler sıfırlanır (demo için ideal)

## 🎯 Gerçek Backend İle Kullanım

Sunumdan sonra backend'i bağlamak isterseniz:

1. `frontend/services/api.ts` dosyasını açın
2. `USE_MOCK_API = false` yapın
3. Backend'i bir sunucuda çalıştırın
4. `.env` dosyasına backend URL'ini ekleyin
5. Yeni bir build alın

## 📞 Sorun mu Var?

**Build Hatası:**
```bash
eas build -p android --profile preview --clear-cache
```

**APK Yüklenmiyor:**
- Telefon ayarlarından "Bilinmeyen Kaynaklardan Yükleme" iznini açın
- Play Protect'ten izin verin

**Uygulama Kapanıyor:**
- Android 6.0 veya üzeri gerekiyor
- Gerekli izinlerin verildiğinden emin olun

## ✅ Başarı!

Artık sunumda kullanabileceğiniz tam fonksiyonel bir demo uygulamanız var! 🎉
