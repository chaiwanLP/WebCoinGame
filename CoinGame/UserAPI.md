# Model User

## 🔐 Authentication register

- Token: `/register`
- URL: `/register`
- Method: POST

### Request และ Response

```json
// Request
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "123456",
  "profile_img": "https://example.com/image.jpg",
}


// Response
{
    "user": {
        "uid": "sD271TIPjqn4IjLlxV7H",
        "username": "john_doe",
        "email": "john@example.com",
        "password": "$2b$10$dtVSEwc9ufMvGGmZ4Yxsgewzy72C3KkJq5CWhjIRelLjy8fxMFUii",
        "profile_img": "https://example.com/image.jpg",
        "role": "user",
        "wallet": 0
    }
}
```

## 🔐 Authentication register

- Token: `/login`
- URL: `/login`
- Method: POST

### Request และ Response

```json
// Request
{
  "email": "john@example.comei",
  "password": "123456"
}


// Response
{
    "message": "success user",
    "role": "user",
    "user": {
        "id": "sD271TIPjqn4IjLlxV7H",
        "password": "$2b$10$dtVSEwc9ufMvGGmZ4Yxsgewzy72C3KkJq5CWhjIRelLjy8fxMFUii",
        "profile_img": "https://example.com/image.jpg",
        "role": "user",
        "wallet": 0,
        "email": "john@example.comei",
        "username": "john_doeeieii"
    }
}
```

## 🔐 Get Wallet

- Token: `/getWallet`
- URL: `/getWallet?uid=9G9V2gPj0sXXA7NEBE82`
- Method: GET

### Request และ Response

```json
// Response
{
  "wallet": 100000000000
}
```

## 🔐 Top-up

- Token: `/top-up`
- URL: `/top-up`
- Method: POST

### Request และ Response

```json
// Request
{
  "uid": "9G9V2gPj0sXXA7NEBE82",
  "amount": 100
}



// Response
{
    "message": "เติมเงินจำนวน 100 สำเร็จ! ยอดเงินปัจจุบัน: 100000000100"
}
```
