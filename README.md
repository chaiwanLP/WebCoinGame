# WebCoinGame — CoinGame 🎮🪙

ร้านขายเกมออนไลน์ (Game Shop) แบบ Single Page Application
Online game store SPA built with Angular.

> โปรเจกต์นี้มี 2 ส่วนหลัก: Frontend Angular ในโฟลเดอร์ `CoinGame/` + Backend API ภายนอก (ดู `*.md` ประกอบ)
> This repo contains the Angular frontend in `CoinGame/` talking to an external Backend API.

---

## ✨ Features / ฟีเจอร์หลัก

- **Game Shop หน้าแรก:** ดูเกมทั้งหมด, ค้นหาด้วยชื่อ (`searchGameByNameGame`), กรองตามประเภท (`searchGameByType`)
- **Game Detail (`/game/:id`):** ดูรายละเอียด, ราคา, รูป (Cloudinary), เพิ่มลงตะกร้า, เช็คเกมที่ซื้อแล้ว (`checkOwnGame`)
- **Cart / ตะกร้า (`/cart`):** ดูรายการ, ลบ (`delete-cart`), Checkout ซื้อเกม (`buy-game`) ตัดเงิน wallet
- **Wallet / เติมเงิน (`/topup`):** ดูยอด (`getWallet`), เติมเงิน (`top-up`), ดูประวัติเติม (`get-history-topup`), ประวัติซื้อ (`get-history-buygame`)
- **Auth:** สมัคร (`register` แบบ `FormData` + อัปโหลดรูป), Login (`login`), เก็บ session ใน `localStorage: Auth`, Logout
- **Profile (`/profile`):** แก้ไข username/email/รูป (`editUser`), ดูเกมที่เป็นเจ้าของ (`profile?uid=`), ดูประวัติซื้อ
- **Admin (`/admin` — `authGuard + adminGuard`):** เพิ่ม/แก้ไข/ลบเกม (`addGame/editGame/deleteGame`), เพิ่มประเภทเกม (`addGameType`), ดูธุรกรรมรวม (`getAllHistory`)
- **Guards:** `authGuard` กันคนไม่ login, `adminGuard` กัน role ไม่ใช่ admin, หน้า 404 (`**`)

## 🧭 Routes / เส้นทาง

| Path | Component (lazy) | Guard | คำอธิบาย |
|---|---|---|---|
| `/` | `components/game-shop` | public | หน้าร้านหลัก |
| `/game/:id` | `pages/gamedetail` | `authGuard` | รายละเอียดเกม |
| `/cart` | `pages/cart` | `authGuard` | ตะกร้า + checkout |
| `/topup` | `pages/topup` | `authGuard` | เติมเงิน + ประวัติ |
| `/profile` | `pages/profile` | `authGuard` | โปรไฟล์ + เกมของฉัน |
| `/admin` | `pages/admin` | `authGuard, adminGuard` | จัดการเกม/ประเภท/ประวัติรวม |
| `**` | `pages/pagenotfound` | public | 404 |

## 🛠 Tech Stack / เทคโนโลยี

- **Frontend:** Angular `20.3.4`, Angular Router (lazy `loadComponent`), `HttpClient`, RxJS `~7.8` (`BehaviorSubject` สำหรับ auth/wallet/cart), Zoneless
- **UI:** Tailwind CSS `^4.1.14`, PostCSS, Prettier `printWidth: 100, singleQuote`
- **Backend (external):** `https://api-coin-game.vercel.app` — ดูรายละเอียดใน `CoinGame/GameAPI.md`, `UserAPI.md`, `CartAPI.md`, `GameTypeAPI.md`
- **Storage/DB:** Firestore (timestamp `_seconds`), Cloudinary (`profile_images/...`) สำหรับ `game_img` / `profile_img`
- **Hosting:** Firebase Hosting — `firebase.json` ชี้ `public: dist/CoinGame/browser` + rewrite `** -> /index.html` (SPA)

Frontend state หลักอยู่ใน `CoinGame/src/app/services/api-game.ts` (`ApiGame`):
`isLoggedIn$/currentUser$/wallet$/cartItems$/cartTotal$/cartCount$`, `login/register/logout`, `refreshWallet/topUp`, `getCart/addToCart/removeFromCart/checkout`, `getAllGames/getGameById/getGameTypes`, `addGame/editGame/deleteGame/addGameType/getAllHistory`

## 📁 Structure / โครงสร้าง

```text
WebCoinGame/
├── README.md               # ไฟล์นี้ (ภาพรวม)
└── CoinGame/               # Angular app
    ├── angular.json
    ├── package.json
    ├── firebase.json / .firebaserc
    ├── GameAPI.md / UserAPI.md / CartAPI.md / GameTypeAPI.md
    ├── public/
    └── src/
        ├── main.ts / index.html / styles.css
        └── app/
            ├── app.ts / app.html / app.css
            ├── app.routes.ts / app.config.ts
            ├── config/constants.ts      # API_ENDPOINT = https://api-coin-game.vercel.app
            ├── guards/auth.guard.ts      # authGuard, adminGuard
            ├── models/users.model.ts     # User, Users
            ├── services/api-game.ts      # service กลางทั้งหมด
            ├── components/header, game-shop/
            └── pages/admin, cart, gamedetail, profile, topup, pagenotfound/
```

## 🔌 API Docs / เอกสาร API

Base URL: `https://api-coin-game.vercel.app` (แก้ใน `src/app/config/constants.ts`)

| ไฟล์ | Endpoints |
|---|---|
| `CoinGame/UserAPI.md` | `POST /register`, `POST /login`, `GET /getWallet?uid=`, `POST /top-up` |
| `CoinGame/GameAPI.md` | `POST /addGame`, `POST /editGame`, `GET /getAllGame`, `POST /deleteGame`, `GET /searchGameByNameGame?game_name=`, `GET /searchGameByType?tid=`, `GET /getGameById?gid=` |
| `CoinGame/GameTypeAPI.md` | `POST /addGameType`, `GET /getGameType` |
| `CoinGame/CartAPI.md` | `POST /add-cart`, `POST /delete-cart` (จริงใช้ `GET /delete-cart?cid=`), `GET /cart?uid=` / `POST /cart` |
| เพิ่มเติมในโค้ด (`api-game.ts`) | `POST /buy-game`, `GET /profile?uid=`, `POST /editUser`, `GET /checkOwnGame?uid=&gid=`, `GET /get-history-topup?uid=`, `GET /get-history-buygame?uid=`, `GET /getAllHistory` |

## 🚀 Getting Started / วิธีรัน

### Prerequisites

- Node.js LTS + npm
- Angular CLI `20.3.4` (`npm i -g @angular/cli` — ไม่บังคับ)
- Firebase CLI (เฉพาะตอน deploy hosting)

### 1. Install & Run (dev)

```bash
cd CoinGame
npm install
npm start
# หรือ: ng serve
# เปิด http://localhost:4200/
```

### 2. Build

```bash
npm run build
# output: dist/CoinGame/browser/

npm run watch   # build --watch --configuration development
npm test        # ng test (Karma + Jasmine)
```

### 3. Deploy Firebase Hosting

```bash
npm run build
npx firebase login
npx firebase deploy --only hosting
```

`firebase.json` ตั้งไว้แล้ว ไม่ต้องแก้ถ้าไม่เปลี่ยนชื่อโปรเจกต์.

### 4. เปลี่ยน Backend URL

แก้ไฟล์ `CoinGame/src/app/config/constants.ts`:

```ts
API_ENDPOINT = 'https://api-coin-game.vercel.app';
```

## 👤 Roles / บทบาทผู้ใช้

- `user`: ซื้อเกม, เติมเงิน, ดูตะกร้า/โปรไฟล์ได้
- `admin`: ทำได้ทุกอย่างของ user + เข้า `/admin` จัดการเกม/ประเภท และลบเกม (`deleteGame` ต้องส่ง `{gid, uid}` และเช็ค role ฝั่ง backend)

Auth เก็บใน `localStorage key: Auth` เป็น JSON `User {id, username, email, profile_img, wallet, role}` — refresh แล้ว `ApiGame.checkAuth()` จะ restore state ให้เอง.

## 📝 Scripts (จาก `CoinGame/package.json`)

| คำสั่ง | ทำอะไร |
|---|---|
| `npm start` | `ng serve` — dev server |
| `npm run build` | `ng build` — production build |
| `npm run watch` | build แบบ watch (development) |
| `npm test` | `ng test` — unit test |

---
สร้างด้วย Angular CLI 20.3.4 + Tailwind + Firebase Hosting.
Built with Angular 20, Tailwind 4, Firebase Hosting.
