APEX DRIVE — upgrade build

START:
1. Extract the ZIP folder.
2. Open racing/index.html in Chrome or Edge while connected to the internet.
3. Click POYGANI BOSHLASH. Audio begins after user interaction.

CONTROLS:
Arrow keys / WASD = steer and accelerate/brake
Shift = nitro
Esc = pause
R = restart
Mobile: on-screen buttons

WHAT CHANGED:
- Improved road material, reflective markers, lighting/shadows and car detailing.
- Added more detailed wheels/rims, windshield/rear glass, grille, LED lights and side skirts.
- Added night headlight beams and nitro exhaust glow.
- Added procedural road/wind noise and tire squeal to complement the synthesized engine and police siren.
- Added subtle visual variations between the selectable cars.
- Kept the existing endless driving, garage, police chase, weather, damage and level systems.

NOTES:
- Three.js is loaded from jsDelivr CDN, so an internet connection is required unless the library is downloaded locally.
- Engine sounds are synthesized in-browser; no external copyrighted car recordings are included.
- Vehicle meshes are procedural game models, not manufacturer-grade 3D assets.

BUG FIXES (review build):
- Daraxtlar endi yon tomonga titramaydi va yo'l bilan bir xil tezlikda harakatlanadi (har daraxt uchun doimiy offset).
- Boss o'yinchining ustida emas, 110 m oldinda paydo bo'ladi.
- Pauza, Game Over, garaj va countdown paytida dvigatel / shamol / shina / sirena ovozi o'chadi.
- Toast xabarlari (daraja, ob-havo, boss, mashina ochilishi) navbat bilan ko'rsatiladi, bir-birini o'chirmaydi; to'qnashuv xabari navbatni o'chirmay, birinchi bo'lib chiqadi. Ob-havo o'zgarmasa, "OB-HAVO" xabari takrorlanmaydi.
- Yangi mashina ochilganda "OCHILDI +500" xabari va bonus kredit endi haqiqatan beriladi (ilgari saveProgress() oldinroq chaqirilgani uchun bu shart hech qachon bajarilmasdi).
- Politsiya mashinasi o'yinchi orqasidan quvadi: old tomoni o'yinchiga qaragan (ilgari teskari burilgan edi).
- Qayta boshlashda eski mashinalar geometriyasi bo'shatiladi (xotira o'sishi kamaydi); daraxtlar umumiy material ishlatadi.
- 5-mashina (STEALTH) 9-darajada ochiladi (ilgari ro'yxatda 10 deb yozilgan edi).
- Favicon alohida kichik fayl (img/favicon.png, 128x128); sahifa tili lang="uz".

ESLATMA: index.html dagi three@0.160.0 / build/three.min.js versiyasini oshirmang (r161 dan boshlab bu fayl olib tashlangan).
