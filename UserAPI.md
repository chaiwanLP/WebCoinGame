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

## 🔐 Authentication Edit

- Token: `/editUser`
- URL: `/editUser`
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
