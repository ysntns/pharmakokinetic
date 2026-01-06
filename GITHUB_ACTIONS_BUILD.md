# 🤖 GitHub Actions ile Otomatik APK Build

## 🚀 Hızlı Başlangıç (Basit Yöntem - Önerilen)

### 1. GitHub'da Workflow'u Çalıştırın

1. Reponuza gidin: https://github.com/ysntns/pharmakokinetic
2. **Actions** sekmesine tıklayın
3. Sol taraftan **"Build APK (Simple)"** workflow'unu seçin
4. Sağ tarafta **"Run workflow"** düğmesine tıklayın
5. **"Run workflow"** butonuna tekrar tıklayın (yeşil buton)

### 2. Build İşlemini İzleyin

- Build başlayacak (yaklaşık 10-15 dakika)
- İlerlemeyi canlı izleyebilirsiniz

### 3. APK'yı İndirin

Build tamamlandığında:

1. Workflow çalıştırmasına tıklayın
2. Aşağıya scroll yapın
3. **Artifacts** bölümünden **"medilog-app"** indirin
4. ZIP'i açın, içinde `app-release.apk` var!

---

## ⚡ Alternatif: EAS Build Yöntemi

Bu yöntem için Expo token gerekiyor. Daha gelişmiş ama kurulum gerekiyor.

### Kurulum (Tek Seferlik)

1. **Expo Access Token Oluşturun**
   - https://expo.dev/accounts/[username]/settings/access-tokens
   - "Create Token" tıklayın
   - Token'ı kopyalayın

2. **GitHub Secret Ekleyin**
   - https://github.com/ysntns/pharmakokinetic/settings/secrets/actions
   - "New repository secret" tıklayın
   - Name: `EXPO_TOKEN`
   - Value: [kopyaladığınız token]
   - "Add secret" tıklayın

### Kullanım

1. **Actions** sekmesi → **"Build Android APK"** workflow
2. **"Run workflow"** tıklayın
3. Build tamamlanınca otomatik **Release** oluşturulur
4. **Releases** sekmesinden APK'yı indirin

---

## 📱 APK'yı Telefonunuza Yükleme

1. APK dosyasını telefonunuza gönderin
2. Ayarlar → Güvenlik → "Bilinmeyen kaynaklardan yüklemeye izin ver"
3. APK'yı açıp yükleyin

---

## 🎯 Giriş Bilgileri (Demo Mode)

Uygulama mock data ile çalışıyor, backend gerekmez!

- **Email**: Herhangi bir şey (örn: demo@test.com)
- **Şifre**: Herhangi bir şey (örn: 123456)

---

## 🔄 Otomatik Build

**"Build Android APK"** workflow'u her `main` branch'e push'ta otomatik çalışır!

Manuel çalıştırmak için:
- Actions → Workflow seç → Run workflow

---

## ⚙️ Workflow Dosyaları

- `.github/workflows/build-apk.yml` - EAS build (gelişmiş)
- `.github/workflows/build-apk-simple.yml` - Basit build (önerilen)

---

## 🐛 Sorun Giderme

**Build Başarısız Oluyor:**
1. Actions sekmesinde hatalı workflow'a tıklayın
2. Log'ları kontrol edin
3. Hata mesajını okuyun

**APK Bulunamıyor:**
1. Workflow tamamlandığından emin olun (yeşil ✓)
2. Sayfayı yenileyin
3. Artifacts bölümünü kontrol edin

**APK Yüklenmiyor:**
1. "Bilinmeyen kaynak" izninin açık olduğundan emin olun
2. Play Protect'i geçici devre dışı bırakın
3. Telefonun Android 6.0+ olduğundan emin olun

---

## ✅ Başarı!

Artık her kod değişikliğinde otomatik APK build edilecek! 🎉
