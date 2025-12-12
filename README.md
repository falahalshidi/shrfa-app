# شرفة (Shrfa)

تطبيق جوال لاستكشاف وحجز تذاكر المهرجانات والفعاليات في سلطنة عُمان.

## 📱 نظرة عامة

شرفة هو تطبيق React Native مبني باستخدام Expo SDK 54، يسمح للمستخدمين بتصفح المهرجانات والفعاليات الثقافية في عُمان وحجز تذاكرها بسهولة.

## ✨ المميزات

- 🔐 **نظام المصادقة**: تسجيل الدخول وإنشاء حساب جديد
- 🎭 **تصفح المهرجانات**: عرض قائمة شاملة بجميع المهرجانات والفعاليات
- 📅 **تفاصيل الفعاليات**: معلومات كاملة عن كل مهرجان (التاريخ، الموقع، الأنشطة)
- 🎫 **حجز التذاكر**: حجز تذاكر متعددة مع حساب السعر الإجمالي
- 📱 **إدارة التذاكر**: عرض جميع التذاكر المحجوزة مع تفاصيلها
- 🎨 **واجهة عربية**: دعم كامل للغة العربية مع RTL
- ☁️ **قاعدة بيانات سحابية**: حفظ البيانات والمصادقة عبر Supabase

## 🛠️ التقنيات المستخدمة

- **React Native** 0.81.5
- **Expo** ~54.0.28
- **TypeScript** 5.1.3
- **React Navigation** 6.x
  - Native Stack Navigator
  - Bottom Tab Navigator
- **Supabase JS Client** (latest)
- **react-native-url-polyfill** و **react-native-get-random-values**
- **React Native Screens** ~4.16.0
- **React Native Safe Area Context** ~5.6.0
- **React Native Gesture Handler** ~2.28.0

## 📋 المتطلبات

- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- Expo CLI
- iOS Simulator (للتطوير على iOS) أو Android Emulator (للتطوير على Android)

## 🚀 التثبيت والتشغيل

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. تشغيل التطبيق

```bash
# تشغيل التطبيق (اختيار المنصة من القائمة)
npm start

# أو تشغيل مباشر على منصة محددة
npm run ios      # للتشغيل على iOS
npm run android  # للتشغيل على Android
npm run web      # للتشغيل على الويب
```

### 3. استخدام Expo Go

يمكنك استخدام تطبيق Expo Go على هاتفك:
1. قم بتثبيت Expo Go من App Store أو Google Play
2. شغّل `npm start`
3. امسح رمز QR الذي يظهر في Terminal

## ☁️ إعداد Supabase

1. أنشئ ملف `.env` في جذر المشروع (ضمن `.gitignore`) وأضف القيم التالية:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```
2. يتم إنشاء الجداول التالية في قاعدة البيانات (`profiles`, `festivals`, `bookings`, `tickets`) وتُطبق سياسات RLS بحيث:
   - لكل مستخدم صف في `profiles` يُنشأ تلقائياً بعد التسجيل.
   - جدول `festivals` قابل للقراءة للجميع لكن تعديله محصور بالمشرفين.
   - الحجوزات والتذاكر تحفظ في `bookings` و `tickets` مع ارتباط كامل بالمستخدم والمهرجان.
3. يتم منح البريد `shrfa@gmail.com` صلاحية المشرف تلقائياً ويمكنه إدارة المهرجانات من لوحة التحكم.

> **ملاحظة:** بعد تعديل متغيرات البيئة أعد تشغيل خادم Expo ليتم التقاط القيم الجديدة.

## 📁 هيكل المشروع

```
shr/
├── src/
│   ├── components/          # المكونات القابلة لإعادة الاستخدام
│   ├── constants/           # الثوابت والبيانات
│   │   ├── colors.ts       # ألوان التطبيق
│   │   └── festivals.ts    # بيانات افتراضية/نسخ احتياطية للمهرجانات
│   ├── context/            # React Context
│   │   └── AuthContext.tsx # سياق المصادقة
│   ├── screens/            # شاشات التطبيق
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── FestivalsScreen.tsx
│   │   ├── FestivalDetailsScreen.tsx
│   │   ├── MyTicketsScreen.tsx
│   │   └── TicketDetailScreen.tsx
│   ├── types/              # تعريفات TypeScript
│   │   ├── index.ts        # الأنواع المستخدمة في الواجهة
│   │   └── database.ts     # الأنواع المولدة من Supabase
│   └── utils/              # الوظائف المساعدة
│       ├── barcode.ts      # توليد الباركود
│       └── storage.ts      # التفاعل مع Supabase
├── assets/                 # الصور والموارد
├── App.tsx                 # نقطة دخول التطبيق
├── app.json                # إعدادات Expo
└── package.json            # التبعيات والمكتبات
```

## 🎯 الشاشات الرئيسية

1. **شاشة تسجيل الدخول** - تسجيل الدخول للمستخدمين الحاليين
2. **شاشة التسجيل** - إنشاء حساب جديد
3. **شاشة المهرجانات** - عرض جميع المهرجانات المتاحة
4. **شاشة تفاصيل المهرجان** - معلومات مفصلة وحجز التذاكر
5. **شاشة تذاكري** - عرض جميع التذاكر المحجوزة
6. **شاشة تفاصيل التذكرة** - معلومات تفصيلية عن تذكرة محددة

## 🔧 الإعدادات

### إعدادات Expo (app.json)

- **الاسم**: شرفة
- **الإصدار**: 1.0.0
- **الاتجاه**: عمودي (Portrait)
- **New Architecture**: مفعّل
- **دعم RTL**: مفعّل

## 📝 الميزات المستقبلية

- [ ] دفع إلكتروني للتذاكر
- [ ] إشعارات للتذكير بالفعاليات
- [ ] مشاركة التذاكر
- [ ] تقييم المهرجانات
- [ ] خريطة للمواقع
- [ ] دعم متعدد اللغات

## 🐛 حل المشاكل

### مشكلة: "Unable to convert string to floating point value: 'large'"
**الحل**: تم إصلاحها بإضافة `headerLargeTitle: false` في إعدادات Navigation.

### مشكلة: تحذيرات إصدارات الحزم
**الحل**: تم تحديث جميع الحزم لتتوافق مع Expo SDK 54.

## 📄 الترخيص

هذا المشروع خاص.

## 👥 المساهمون

- فريق تطوير شرفة

## 📞 التواصل

للمزيد من المعلومات أو الدعم، يرجى التواصل مع فريق التطوير.

---

**ملاحظة**: هذا التطبيق في مرحلة التطوير. قد تحتوي بعض الميزات على أخطاء أو تحتاج إلى تحسينات.


**suapabase for .env file**
EXPO_PUBLIC_SUPABASE_URL=https://gwpbvoieyreykgqbcvgd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cGJ2b2lleXJleWtncWJjdmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjUzNzAsImV4cCI6MjA4MTEwMTM3MH0.0ImMaUgOSyD5x0fwH1A6FuFblf_kRVqtZ4pR-7yBVR4


