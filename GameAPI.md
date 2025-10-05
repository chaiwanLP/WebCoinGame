# Model User

## 🔐 Authentication Add Game

- Token: `/addGame`
- URL: `/addGame`
- Method: POST

### Request และ Response

```json
// Request
{
  "game_name": "Resident Evil 7: Biohazard",
  "price": 27,
  "tid": "po41L1jKPDwiOXmPO59U",
  "description": "Resident Evil 7: Biohazard is a 2017 survival horror game developed and published by Capcom. The player controls Ethan Winters as he searches for his long-missing wife in a derelict plantation occupied by an infected family, solving puzzles and fighting enemies. Resident Evil 7 diverges from the more action-oriented Resident Evil 5 and Resident Evil 6, returning to the franchise's survival horror roots, emphasizing exploration. ",
  "game_img":"https://res.cloudinary.com/dwlfg77to/image/upload/v1759695761/profile_images/hh3iekb7twwecrq6qjwh.jpg"
}




// Response
{
    "message": "add game success",
    "gid": "CEiC6rA2VjLpBycxBH9b",
    "game_name": "Resident Evil 7: Biohazard",
    "price": 27,
    "tid": "po41L1jKPDwiOXmPO59U",
    "description": "Resident Evil 7: Biohazard is a 2017 survival horror game developed and published by Capcom. The player controls Ethan Winters as he searches for his long-missing wife in a derelict plantation occupied by an infected family, solving puzzles and fighting enemies. Resident Evil 7 diverges from the more action-oriented Resident Evil 5 and Resident Evil 6, returning to the franchise's survival horror roots, emphasizing exploration. ",
    "release_date": "2025-10-05",
    "game_img": "game_img":"https://res.cloudinary.com/dwlfg77to/image/upload/v1759695761/profile_images/hh3iekb7twwecrq6qjwh.jpg"
}
```

## 🔐 Authentication Edit Game

- Token: `/eitGame`
- URL: `/editGame`
- Method: POST

### Request และ Response

```json
// Request
{
  "gid":"dEVBROSSXjpJ1n3vCI0W",
  "game_name": "Silent hill f",
  "price": 2100,
  "tid": "0y6OHcx7EMdHtShomL4x",
  "description": "ช่วงปี 1960 ที่ประเทศญี่ปุ่น เมือง Ebisugaoka ที่เงียบสงบของ Shimizu Hinako ก็ปกคลุมไปด้วยหมอกอย่างฉับพลัน เปลี่ยนบ้านของเธอให้ กลายเป็นฝันร้ายสุดสยอง ขณะที่เมืองเงียบสงัดและหมอกก็หนาขึ้นเรื่อยๆ Hinako จะต้องเดินทางไปตามเส้นทางที่บิดเบี้ยวของ Ebisugaoka แก้ไขปริศนาที่ซับซ้อนและเผชิญหน้ากับเหล่าส สัตว์ประหลาดที่น่าสยดสยองเพื่อเอาตัวรอด ให้ตัวคุณดื่มด่ำไปกับโลกของ Hinako ที่สร้างสรรค์โดยนักเขียนชื่อดัง Ryukishi07 สัมผัสดนตรีที่ชวนสะกดซึ่งจากผู้ประพันธ์เพลงให้ Silent Hill มาแล้วอย ย่าง Akira Yamaoka และงานภาพที่งดงามในเรื่องราวของความลังเล ความเศร้าโศก และตัวเลือกที่หนีไม่ได้ Hinako จะโอบรับความงดงามภายในความสยองหรือยอมให้กั บความบ้าคลั่งที่รออยู่ข้างหน้ากัน พบกับบทใหม่ของซีรีส์ Silent Hill ที่ผสมผสานความสยองขวัญเชิงจิตวิทยากับฉากอันน่าสะพรึงแบบญี่ปุ่น"
}



// Response
{
    "message": "edit game success",
    "uid": "dEVBROSSXjpJ1n3vCI0W",
    "tid": "0y6OHcx7EMdHtShomL4x",
    "release_date": "2025-10-01",
    "game_img": "https://res.cloudinary.com/dwlfg77to/image/upload/v1759694562/profile_images/abdbttwpsfyl3vm4nm8y.jpg",
    "game_name": "Silent hill f",
    "price": 2100,
    "description": "ช่วงปี 1960 ที่ประเทศญี่ปุ่น เมือง Ebisugaoka ที่เงียบสงบของ Shimizu Hinako ก็ปกคลุมไปด้วยหมอกอย่างฉับพลัน เปลี่ยนบ้านของเธอให้ กลายเป็นฝันร้ายสุดสยอง ขณะที่เมืองเงียบสงัดและหมอกก็หนาขึ้นเรื่อยๆ Hinako จะต้องเดินทางไปตามเส้นทางที่บิดเบี้ยวของ Ebisugaoka แก้ไขปริศนาที่ซับซ้อนและเผชิญหน้ากับเหล่าส สัตว์ประหลาดที่น่าสยดสยองเพื่อเอาตัวรอด ให้ตัวคุณดื่มด่ำไปกับโลกของ Hinako ที่สร้างสรรค์โดยนักเขียนชื่อดัง Ryukishi07 สัมผัสดนตรีที่ชวนสะกดซึ่งจากผู้ประพันธ์เพลงให้ Silent Hill มาแล้วอย ย่าง Akira Yamaoka และงานภาพที่งดงามในเรื่องราวของความลังเล ความเศร้าโศก และตัวเลือกที่หนีไม่ได้ Hinako จะโอบรับความงดงามภายในความสยองหรือยอมให้กั บความบ้าคลั่งที่รออยู่ข้างหน้ากัน พบกับบทใหม่ของซีรีส์ Silent Hill ที่ผสมผสานความสยองขวัญเชิงจิตวิทยากับฉากอันน่าสะพรึงแบบญี่ปุ่น"
}
```

## 🔐 Authentication get all Game

- Token: `/getAllGame`
- URL: `/getAllGame`
- Method: GET

### Request และ Response

```json
// Request
-



// Response
[
    {
        "gid": "CEiC6rA2VjLpBycxBH9b",
        "game_name": "Resident Evil 7: Biohazard",
        "price": 27,
        "tid": "po41L1jKPDwiOXmPO59U",
        "description": "Resident Evil 7: Biohazard is a 2017 survival horror game developed and published by Capcom. The player controls Ethan Winters as he searches for his long-missing wife in a derelict plantation occupied by an infected family, solving puzzles and fighting enemies. Resident Evil 7 diverges from the more action-oriented Resident Evil 5 and Resident Evil 6, returning to the franchise's survival horror roots, emphasizing exploration. ",
        "release_date": "2025-10-05",
        "game_img": "https://res.cloudinary.com/dwlfg77to/image/upload/v1759695761/profile_images/hh3iekb7twwecrq6qjwh.jpg",
        "type_name": "Horror"
    },
    {
        "gid": "dEVBROSSXjpJ1n3vCI0W",
        "tid": "0y6OHcx7EMdHtShomL4x",
        "release_date": "2025-10-01",
        "game_img": "https://res.cloudinary.com/dwlfg77to/image/upload/v1759694562/profile_images/abdbttwpsfyl3vm4nm8y.jpg",
        "game_name": "Silent hill f",
        "price": 2100,
        "description": "ช่วงปี 1960 ที่ประเทศญี่ปุ่น เมือง Ebisugaoka ที่เงียบสงบของ Shimizu Hinako ก็ปกคลุมไปด้วยหมอกอย่างฉับพลัน เปลี่ยนบ้านของเธอให้ กลายเป็นฝันร้ายสุดสยอง ขณะที่เมืองเงียบสงัดและหมอกก็หนาขึ้นเรื่อยๆ Hinako จะต้องเดินทางไปตามเส้นทางที่บิดเบี้ยวของ Ebisugaoka แก้ไขปริศนาที่ซับซ้อนและเผชิญหน้ากับเหล่าส สัตว์ประหลาดที่น่าสยดสยองเพื่อเอาตัวรอด ให้ตัวคุณดื่มด่ำไปกับโลกของ Hinako ที่สร้างสรรค์โดยนักเขียนชื่อดัง Ryukishi07 สัมผัสดนตรีที่ชวนสะกดซึ่งจากผู้ประพันธ์เพลงให้ Silent Hill มาแล้วอย ย่าง Akira Yamaoka และงานภาพที่งดงามในเรื่องราวของความลังเล ความเศร้าโศก และตัวเลือกที่หนีไม่ได้ Hinako จะโอบรับความงดงามภายในความสยองหรือยอมให้กั บความบ้าคลั่งที่รออยู่ข้างหน้ากัน พบกับบทใหม่ของซีรีส์ Silent Hill ที่ผสมผสานความสยองขวัญเชิงจิตวิทยากับฉากอันน่าสะพรึงแบบญี่ปุ่น",
        "type_name": "Battle Royale"
    },
    {
        "gid": "h8nRxYRSnQ6GnywdnOy6",
        "game_name": "PUBG: Battlegrounds",
        "price": 27,
        "tid": "0y6OHcx7EMdHtShomL4x",
        "description": "เกมแอ็คชั่นมันส์ๆ ยิงกันระเบิด",
        "release_date": "2025-10-05",
        "game_img": "https://res.cloudinary.com/dwlfg77to/image/upload/v1759695429/profile_images/lcqleawwews0l60os2z9.jpg",
        "type_name": "Battle Royale"
    }
]
```
