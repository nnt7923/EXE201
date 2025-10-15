// api/seed_places.js
const mongoose = require('mongoose');
const Place = require('./models/Place');
const User = require('./models/User');
require('dotenv').config(); // Make sure to use the .env file

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in your .env file.');
  process.exit(1);
}

const samplePlaces = [
  {
    "name": "Nhà Hàng Sen Vàng Hòa Lạc",
    "category": "restaurant",
    "subcategory": "Món Việt",
    "description": "Nhà hàng chuyên các món ăn truyền thống Việt Nam, không gian rộng rãi, thoáng đãng. Lý tưởng cho các buổi tiệc gia đình và hội họp.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.534444,
        20.970833
      ]
    },
    "address": {
      "street": "Gần Cầu Vai Réo",
      "ward": "Phú Cát",
      "district": "Quốc Oai",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 150000,
      "maxPrice": 500000,
      "currency": "VND"
    },
    "tags": [
      "món việt",
      "gia đình",
      "rộng rãi"
    ],
    "images": [
      {
        "url": "/vietnamese-bun-bo-hue-restaurant.png",
        "alt": "Không gian nhà hàng Sen Vàng"
      }
    ]
  },
  {
    "name": "Twitter Beans Coffee - KCNC Hòa Lạc",
    "category": "cafe",
    "subcategory": "Cà phê làm việc",
    "description": "Không gian yên tĩnh, hiện đại, phù hợp cho việc học tập và làm việc. Cung cấp nhiều loại đồ uống và đồ ăn nhẹ.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.50997,
        21.01779
      ]
    },
    "address": {
      "street": "Khu Công nghệ cao Hòa Lạc",
      "ward": "Tân Xã",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 40000,
      "maxPrice": 80000,
      "currency": "VND"
    },
    "tags": [
      "yên tĩnh",
      "làm việc",
      "hiện đại"
    ],
    "images": [
      {
        "url": "/modern-study-cafe-with-students.png",
        "alt": "Quầy pha chế của Twitter Beans Coffee"
      }
    ]
  },
  {
    "name": "1988 BBQ Hòa Lạc",
    "category": "restaurant",
    "subcategory": "Nướng",
    "description": "Quán nướng nổi tiếng với sinh viên, giá cả phải chăng, thực đơn đa dạng các món nướng và lẩu.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5205,
        21.0226
      ]
    },
    "address": {
      "street": "QL21A",
      "ward": "Thạch Hoà",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 100000,
      "maxPrice": 300000,
      "currency": "VND"
    },
    "tags": [
      "bbq",
      "sinh viên",
      "giá rẻ"
    ],
    "images": [
      {
        "url": "https://toplist.vn/images/800px/the-hill-bbq-restaurant-879488.jpg",
        "alt": "Món nướng tại 1988 BBQ"
      }
    ]
  },
  {
    "name": "Bay Coffee Hòa Lạc",
    "category": "cafe",
    "subcategory": "Cà phê thường",
    "description": "Quán cà phê bình dân với giá cả phải chăng, phù hợp cho sinh viên và người dân địa phương.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5195,
        21.0067
      ]
    },
    "address": {
      "street": "Đường mẫu 4",
      "ward": "Phường mẫu 4",
      "district": "Quận mẫu 4",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 20000,
      "maxPrice": 50000,
      "currency": "VND"
    },
    "tags": [
      "cafe",
      "giá rẻ"
    ],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no",
        "alt": "Hình ảnh Bay Coffee Hòa Lạc"
      }
    ]
  },
  {
    "name": "Bánh cuốn, bún chả A Hoàng",
    "category": "restaurant",
    "subcategory": "Món Việt",
    "description": "Quán ăn chuyên bánh cuốn và bún chả.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5195699870118,
        21.006668817250116
      ]
    },
    "address": {
      "street": "Đường mẫu 5",
      "ward": "Phường mẫu 5",
      "district": "Quận mẫu 5",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 30000,
      "maxPrice": 80000,
      "currency": "VND"
    },
    "tags": [
      "restaurant",
      "bún chả"
    ],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no",
        "alt": "Hình ảnh bánh cuốn, bún chả A Hoàng"
      }
    ]
  },
  {
    "name": "Lẩu nấm Ashima",
    "category": "restaurant",
    "subcategory": "Lẩu",
    "description": "Nhà hàng chuyên các món lẩu nấm, không gian ấm cúng, phù hợp cho nhóm bạn.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5205,
        21.0226
      ]
    },
    "address": {
      "street": "QL21A",
      "ward": "Thạch Hoà",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 120000,
      "maxPrice": 250000,
      "currency": "VND"
    },
    "tags": [
      "lẩu",
      "nhóm bạn"
    ],
    "images": [
      {
        "url": "https://toplist.vn/images/800px/the-hill-bbq-restaurant-879488.jpg",
        "alt": "Món lẩu nấm tại Ashima"
      }
    ]
  },
  {
    "name": "Phở Lý Quốc Sư - Hòa Lạc",
    "category": "restaurant",
    "subcategory": "Phở",
    "description": "Quán phở truyền thống với hương vị đậm đà, phục vụ từ sáng sớm.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5195,
        21.0067
      ]
    },
    "address": {
      "street": "Đường mẫu 6",
      "ward": "Phường mẫu 6",
      "district": "Quận mẫu 6",
      "city": "Hà Nội"
    },
    "pricing": {
      "minPrice": 35000,
      "maxPrice": 60000,
      "currency": "VND"
    },
    "tags": [
      "phở",
      "sáng sớm"
    ],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no",
        "alt": "Tô phở tại Lý Quốc Sư"
      }
    ]
  },
  {
    "name": "siêu thị Big Trend",
    "category": "restaurant",
    "subcategory": "Siêu thị",
    "description": "Một siêu thị lớn gần khu vực công nghệ cao Hòa Lạc, cung cấp nhiều mặt hàng đa dạng.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.51793093460209,
        21.009601983317488
      ]
    },
    "address": {
      "street": "Đại lộ Thăng Long",
      "ward": "An Khánh",
      "district": "Hoài Đức",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nov61Z6HXvWOWfve0tgW-6956hxfnaVVInLx0NvdhpifM3wGxXwb2Da6qWYQPJdeTIf5VK_hUarZ_lavQjOgvT2nFiLcXm3BYEZy1MOaW_rskR5pYbpqL_FChg3Mg7nYV_ZAj61=w426-h240-k-no",
        "alt": "Hình ảnh siêu thị Big Trend"
      }
    ]
  },
  {
    "name": "hồ câu minh duy 2",
    "category": "restaurant",
    "subcategory": "Hồ câu",
    "description": "Hồ câu giải trí.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52622186523219,
        21.00901249226722
      ]
    },
    "address": {
      "street": "Đường mẫu 4",
      "ward": "Phường mẫu 4",
      "district": "Quận mẫu 4",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqNFSlxzIVB2HIfI5DX-VJPbIY8sXdgkLmKVZv0XTOvBKZOvCvR19g8V-hPanl-hFNGiznkgLJnIqQ0z1-bcxmYuOVflD-epa3m4AGz4X6b_l1SvBk08F32lKQggwJPDd9HkH7z=w408-h725-k-no",
        "alt": "Hình ảnh hồ câu minh duy 2"
      }
    ]
  },
  {
    "name": "hồ câu lure trường sơn",
    "category": "restaurant",
    "subcategory": "Hồ câu",
    "description": "Hồ câu giải trí.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52939760061835,
        21.021691736292222
      ]
    },
    "address": {
      "street": "Đường mẫu 3",
      "ward": "Phường mẫu 3",
      "district": "Quận mẫu 3",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrq4HNWl5S9PL37TpxopNNWoakRGYjOewystGIWagt7YzX63fKNClDWN73g264RBM9KEygTlKNvooBgmjfbeMKtLaTtybEjpU6DUtzij3495Sdfo1Hyd0esbFAQUGM16s_HlSC_Kw=w408-h544-k-no",
        "alt": "Hình ảnh hồ câu lure trường sơn"
      }
    ]
  },
  {
    "name": "bánh cuốn, bún chả A Hoàng",
    "category": "restaurant",
    "subcategory": "Bún chả",
    "description": "Quán ăn chuyên bánh cuốn và bún chả.",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5195699870118,
        21.006668817250116
      ]
    },
    "address": {
      "street": "Đường mẫu 5",
      "ward": "Phường mẫu 5",
      "district": "Quận mẫu 5",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipOSceyAMDJZNQNzyeN10brPvp8HCnx5nhnrYJt1=w408-h306-k-no",
        "alt": "Hình ảnh bánh cuốn, bún chả A Hoàng"
      }
    ]
  },
  {
    "name": "Vua Gà Quang Thọ",
    "category": "restaurant",
    "subcategory": "Khác",
    "description": "Mô tả cho Vua Gà Quang Thọ",
    "location": {
      "type": "Point",
      "coordinates": [
        105.51901208757118,
        21.00769042367644
      ]
    },
    "address": {
      "street": "QL21",
      "ward": "Thạch Hoà",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipPb-LoILd6zIPd9NQaIiiA8OSp385vRZCODwsn3=w533-h240-k-no",
        "alt": "Hình ảnh Vua Gà Quang Thọ"
      }
    ]
  },
  {
    "name": "Memory PTB",
    "category": "restaurant",
    "subcategory": "Khác",
    "description": "Mô tả cho Memory PTB",
    "location": {
      "type": "Point",
      "coordinates": [
        105.519950886277,
        21.012661589441276
      ]
    },
    "address": {
      "street": "77 Cụm 1, Thôn 3",
      "ward": "Thạch Hoà",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipM0sTKM15_6ac80urHOaRPc7_ErvlOFglTvTf2v=w408-h543-k-no",
        "alt": "Hình ảnh Memory PTB"
      }
    ]
  },
  {
    "name": "Beta FPT Building",
    "category": "restaurant",
    "subcategory": "Khác",
    "description": "Mô tả cho Beta FPT Building",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5273297770831,
        21.014202346798257
      ]
    },
    "address": {
      "street": "Khu Công nghệ cao Hòa Lạc",
      "ward": "Thạch Hoà",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4no_QP2cYTKhqUkMjvQ4dPtVGVP8q4NZRjzQrKB9bNGuYDjpl0yZamKQXbi-7B7OpZtbHKvfdBHnKveOF4O0coPpaQZ1QYC3vce_Tha4jHpLa5ZsKiM_iod49XT9H5bNRzweO8j2=w408-h306-k-no",
        "alt": "Hình ảnh Beta FPT Building"
      }
    ]
  },
  {
    "name": "Twitter Beans Coffee Hòa Lạc",
    "category": "restaurant",
    "subcategory": "Khác",
    "description": "Mô tả cho Twitter Beans Coffee Hòa Lạc",
    "location": {
      "type": "Point",
      "coordinates": [
        105.53874120296807,
        21.001221142996908
      ]
    },
    "address": {
      "street": "Khu Công nghệ cao Hòa Lạc",
      "ward": "Thạch Hoà",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4noqPgWjpIAXW58VtyqDeagMhtYxlt-2IT0MwFinTpbA_9YpjbK14Sod-B01ttpUWoj5BCmVZfeg-n_sDzogn-52kNxhO2FLb4F82s4OMCILYZClYAx96hgmaaaodUIv8de0Iqk15A=w426-h240-k-no",
        "alt": "Hình ảnh Twitter Beans Coffee Hòa Lạc"
      }
    ]
  },
  {
    "name": "Mixue Tân Xã",
    "category": "restaurant",
    "subcategory": "Khác",
    "description": "Mô tả cho Mixue Tân Xã",
    "location": {
      "type": "Point",
      "coordinates": [
        105.55059246611829,
        21.022898891386973
      ]
    },
    "address": {
      "street": "Đầu ĐT419",
      "ward": "Mục Quyên",
      "district": "Thạch Thất",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4noadSxB6bSEEHTFiYieIphMITHLmuIO18JfuJfL95jjdoqtywnj1Ewmf7TtQJ1vyb217aUinOSW4i6pZmRkqNEC18bwKfg_Nu07bvVdwmXjsw6xbw1aMGvzQyVBUpcKkw_zFlofEw=w408-h306-k-no",
        "alt": "Hình ảnh Mixue Tân Xã"
      }
    ]
  },
  {
    "name": "Nhà trọ Phúc Hậu",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Phúc Hậu",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54807375577192,
        21.027541572623793
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr8BJLDNrTaha1i9moPy153IT0ZwN14W3Tz4e59VdF5acEMeu3hvBECzAfUsxb6o35q6JfSYiP73DqEkjXvEkz9rQfTZFtfhtMV396OfmtRt2TqdtTXFPHxv0pLbgz8AGXVFBdubwNxBKyv=w408-h408-k-no",
        "alt": "Hình ảnh Nhà trọ Phúc Hậu"
      }
    ]
  },
  {
    "name": "Nhà trọ Quỳnh Hải",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Quỳnh Hải",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52474375408913,
        21.024243561355114
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4no3O_S33p7dqwIqHb0P9qyYo82xxU8X-wYsmBcXf02ifbygYZy6cgNW4S6wNjdcKkrJ2TXumxuBulqjc6JCyNWk46re0rPkN18t1AUjT8KxcPYJx_73O8OBRsM_h_vHyHwkdlpf=w426-h240-k-no",
        "alt": "Hình ảnh Nhà trọ Quỳnh Hải"
      }
    ]
  },
  {
    "name": "Nhà trọ Hoàng Linh",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Hoàng Linh",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5505971422575,
        21.01960539843061
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npQE6R_xCUoyJj88nBdsSQXv2_bFIjHMz5bue78lrjINXRLgzqjcwqEY4waXuRrKv1kz_e74OvF3mN4I_wfYNAH7mjWYebl1uiTHi9ZGqZQJ1wGo4XyhEQDJatqqMvvRyV-mHM=w408-h544-k-no",
        "alt": "Hình ảnh Nhà trọ Hoàng Linh"
      }
    ]
  },
  {
    "name": "Nhà trọ Hoà Lạc",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Hoà Lạc",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52199399136732,
        20.998598983336766
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4no1TBsb44qhsu-7LfkJN9tT9lxWEWBQM3zguNT9mN4iIxAkep8TIF-TCtDYPpdbh17Np_dFuZln5421oGlOcqUb3MQ6lCe6L33KtsXcEARxpz3jbC5rSvxaeu2nkaHVPXF78tqL=w408-h544-k-no",
        "alt": "Hình ảnh Nhà trọ Hoà Lạc"
      }
    ]
  },
  {
    "name": "Nhà trọ Happy House",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Happy House",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52277199992902,
        20.997317395503586
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=fWZfZCQWb9LA3tifodwRoQ&cb_client=search.gws-prod.gps&w=408&h=240&yaw=254.68907&pitch=0&thumbfov=100",
        "alt": "Hình ảnh Nhà trọ Happy House"
      }
    ]
  },
  {
    "name": "Nhà trọ Thiên Ngân",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Thiên Ngân",
    "location": {
      "type": "Point",
      "coordinates": [
        105.5207625847291,
        21.000421671355596
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=6Gwk64mHFUBXlwaHBlankg&cb_client=search.gws-prod.gps&w=408&h=240&yaw=24.843737&pitch=0&thumbfov=100",
        "alt": "Hình ảnh Nhà trọ Thiên Ngân"
      }
    ]
  },
  {
    "name": "Nhà trọ Minh Nhi",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Minh Nhi",
    "location": {
      "type": "Point",
      "coordinates": [
        105.55078808044512,
        21.0260246751229
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipPXYJnp6_WGQU0nB4LX5ZLLWuz9qE3CqgAWoC1Y=w408-h306-k-no",
        "alt": "Hình ảnh Nhà trọ Minh Nhi"
      }
    ]
  },
  {
    "name": "Nhà trọ Hùng Hoa",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Hùng Hoa",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54802990178702,
        21.0290739428211
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=YVzyrDiRK0576wcpG74gUA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=7.94761&pitch=0&thumbfov=100",
        "alt": "Hình ảnh Nhà trọ Hùng Hoa"
      }
    ]
  },
  {
    "name": "Home Sweet Home",
    "category": "restaurant",
    "subcategory": "accommodation",
    "description": "Mô tả cho Home Sweet Home",
    "location": {
      "type": "Point",
      "coordinates": [
        105.55249309509941,
        21.02738459268207
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npdpRhsD_gZ1f6Gexp02HAxJOhoV4QvObDL6x7BR-cP5voSHzsXNP1vmVOX8lQHgadVm5iGTCOPZU66fMKmJzBb5g1U_g3xbPQBY_LlCDEwqq3i2DDIjBH7rWwsrhtH-kIPxf_Y=w408-h306-k-no",
        "alt": "Hình ảnh Home Sweet Home"
      }
    ]
  },
  {
    "name": "Nhà trọ Minh Anh",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Minh Anh",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52089587109988,
        20.999908789885804
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipM6EBq1TFscBKcbjg5xQ0zQESL-wmDkpG13sc80=w493-h240-k-no",
        "alt": "Hình ảnh Nhà trọ Minh Anh"
      }
    ]
  },
  {
    "name": "Nhà trọ Kim Cúc",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Kim Cúc",
    "location": {
      "type": "Point",
      "coordinates": [
        105.55005267885568,
        21.028093246309094
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqC_t00MJRr8TqaKHwpT4WIh2fGUve9zIcex7AQwkOUJ4iTAZb5zXT4ZqCaRY_V0Lw3Lf7NLk_RgVtgX0ddNsEmZaM4UUX6ADkNCjmbVNxgZ0zfl0GyG2KH0dDFk3hpcjlk4YTN=w408-h543-k-no",
        "alt": "Hình ảnh Nhà trọ Kim Cúc"
      }
    ]
  },
  {
    "name": "Nhà trọ Nhật Anh",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Nhật Anh",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54920957293405,
        21.027492503041827
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npDJFiFW6NmJvhIEtMfCqgiedvdHx8tx33G_qXgcDWO05Vq3PAYPEgQ8IthyVGIjFUzJaxypfFSilxeZ8Frk3aCHJxv10ACSKk748jslwUvlKWjFqflVcgMagO2aEZ4a6rKnMQ=w408-h291-k-no",
        "alt": "Hình ảnh Nhà trọ Nhật Anh"
      }
    ]
  },
  {
    "name": "Nhà trọ Happy",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Happy",
    "location": {
      "type": "Point",
      "coordinates": [
        105.51061391760584,
        21.024652486310593
      ]
    },
    "address": {
      "street": "Đường mẫu (lỗi geocode)",
      "ward": "Phường mẫu",
      "district": "Quận mẫu",
      "city": "Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq53Jxd2UDiA1n10-ImB2BcGtRh9rBhxqRtyY6cZcrPqdd7nXNWT340j6dUfrS0QfZsTeqy-8Sd9IIub5vn7f3jkJBsg-xXUijrDRwx0HzEv5ZS7ai1ZWnoNgWPk0T1pr_3XBU_gQ=w408-h544-k-no",
        "alt": "Hình ảnh Nhà trọ Happy"
      }
    ]
  },
  {
    "name": "Nhà trọ Anh Toàn",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Anh Toàn",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54770917106974,
        21.027444645510112
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=SiNEyC8-UmsgxrhE2Y8-GA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=296.77737&pitch=0&thumbfov=100",
        "alt": "Hình ảnh Nhà trọ Anh Toàn"
      }
    ]
  },
  {
    "name": "Nhà trọ Đồi Sim",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Đồi Sim",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54980145087248,
        21.02482893311561
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4npF-eEYuCC2ConIwY6hEqaU2NQPg8Ou0XD0MAmw5nKnaThUtW_UmKkbvcyEMj-W6-p2bUzZHNnJnsmBKBxpL4RGcLc_1Fv-7dATRJbpQDhkOqzKqq0hdSzdFg2FFSuScWsdXLwLQw=w408-h306-k-no",
        "alt": "Hình ảnh Nhà trọ Đồi Sim"
      }
    ]
  },
  {
    "name": "Nhà trọ Tuấn Anh",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Tuấn Anh",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54975267109607,
        21.026802759870012
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=D4186FrhHTk80fj7By4sng&cb_client=search.gws-prod.gps&w=408&h=240&yaw=11.436455&pitch=0&thumbfov=100",
        "alt": "Hình ảnh Nhà trọ Tuấn Anh"
      }
    ]
  },
  {
    "name": "Nhà trọ SV Tân Xã",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ SV Tân Xã",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54635984226246,
        21.028944114788953
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq9D3xfsiffa836abLJa6FVIB49Ty4ae6DJ1I-pQ2MMjB99iwNLtzj-caENXGY_CFOPRGtfpYkPNe-IpMSwz0vFnKOalViKEDqFaM7u4RVPmKxga1ojcVjNnFFXun0JbEcmwlVb=w408-h306-k-no",
        "alt": "Hình ảnh Nhà trọ SV Tân Xã"
      }
    ]
  },
  {
    "name": "Nhà trọ Thắm",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Thắm",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52133663892796,
        20.997449056417818
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://via.placeholder.com/400x300",
        "alt": "Hình ảnh Nhà trọ Thắm"
      }
    ]
  },
  {
    "name": "Nhà trọ Hồng Nhàn",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Hồng Nhàn",
    "location": {
      "type": "Point",
      "coordinates": [
        105.55054363555088,
        21.025962181152263
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr4V25blK6xNcv0s3t1L29RXUP941-n3dMLJjde0xgfL2gEVzDbwvHr9H5R-M2OiIN7TFhISPfEWwGzhlCz2LZht5SAzacmoI-xbIyZms7Wo2nKpyN0zj7m74ybBdQd4VzT0QmK=w408-h306-k-no",
        "alt": "Hình ảnh Nhà trọ Hồng Nhàn"
      }
    ]
  },
  {
    "name": "Nhà trọ Minh Phương",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Minh Phương",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52277594771232,
        20.99670238127841
      ]
    },
    "address": {
      "street": "Quốc lộ 21",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4noUUM9FB-B-5GICShbGU-NshijNQegzkpTJ6pb47H__waDDurS8V8m4ppp8WW5fY9GHNVyHCy5udxVH4XoixhZ1ui4TjDMi4F_8gUmAyGGDqHdC2t9KzO6tcUzVu5Jp0IVVSqnoCYYqSIk=w408-h306-k-no",
        "alt": "Hình ảnh Nhà trọ Minh Phương"
      }
    ]
  },
  {
    "name": "Nhà trọ Minh Khôi",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Minh Khôi",
    "location": {
      "type": "Point",
      "coordinates": [
        105.54972685945604,
        21.024951391253527
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hạ Bằng",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4noFky1_nP-zyqI570Ml0rcm71ZthENrjE2Ipca1V__Z8j2Q96QJZJTQKgwsdgKyWY1l0vRIhbJ9CbI1110bammeP1ZjG_Krv9lXHwjDC5uAiSK2rdwAc_SC03JLDRw1TZ2_7Hg=w425-h240-k-no",
        "alt": "Hình ảnh Nhà trọ Minh Khôi"
      }
    ]
  },
  {
    "name": "Nhà trọ Ngọc Long",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Ngọc Long",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52219902074562,
        21.00223468051864
      ]
    },
    "address": {
      "street": "Đường N12",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrnhRh3HfHxHLgUnk_4LrvduKuiKP0cm9WZuuBHZwIAlRDnG8wXt_R-czuAZrJhladtn4ZqNh5Qtl3-ukSPCgWNjjBQR_nFLFKtl6UfZ2CVEquK14HIVUzwcYbLDxY2mVXh9Eg=w408-h305-k-no",
        "alt": "Hình ảnh Nhà trọ Ngọc Long"
      }
    ]
  },
  {
    "name": "Nhà trọ Toán Tươi",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Toán Tươi",
    "location": {
      "type": "Point",
      "coordinates": [
        105.51614999701005,
        21.026895734497046
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq1V8k72msEG-WYKpWq1h4VZK93a4F9e3CD5IGJ51pR775bqwZCokIQWRkygsD1wheUA9Tb2LagRDaOIbN_mF8Od7UvS-KsM1SJO3HdnyL4WvjjB0WG9UQQTbJyeYs2s1ywqvDHvA=w408-h544-k-no",
        "alt": "Hình ảnh Nhà trọ Toán Tươi"
      }
    ]
  },
  {
    "name": "Nhà trọ An House",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ An House",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52233784220098,
        20.998052058395594
      ]
    },
    "address": {
      "street": "Quốc lộ 21",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://lh3.googleusercontent.com/p/AF1QipMlPnR0UA2jR5PRQeP1sUnAwxPmWVHAac-ZCs_r=w408-h440-k-no",
        "alt": "Hình ảnh Nhà trọ An House"
      }
    ]
  },
  {
    "name": "Nhà trọ Tuấn Cường",
    "category": "restaurant",
    "subcategory": "Nhà trọ",
    "description": "Mô tả cho Nhà trọ Tuấn Cường",
    "location": {
      "type": "Point",
      "coordinates": [
        105.52040204225308,
        21.00086362649726
      ]
    },
    "address": {
      "street": "Không rõ tên đường",
      "ward": "Không rõ phường/xã",
      "district": "Xã Hòa Lạc",
      "city": "Thành phố Hà Nội"
    },
    "pricing": {
      "currency": "VND"
    },
    "tags": [],
    "images": [
      {
        "url": "https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=4ApFi2XkRHWx-NMbkb1Uag&cb_client=search.gws-prod.gps&w=408&h=240&yaw=87.49695&pitch=0&thumbfov=100",
        "alt": "Hình ảnh Nhà trọ Tuấn Cường"
      }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Finding a user to be the author...');
    const author = await User.findOne();
    if (!author) {
      throw new Error('Database is empty or no users found. Please register at least one user before seeding places.');
    }
    console.log(`✅ Found user: ${author.name}. All new places will be created by this user.`);

    console.log('Starting to seed places...');
    for (const placeData of samplePlaces) {
      const existingPlace = await Place.findOne({ name: placeData.name });
      if (existingPlace) {
        console.log(`- Place "${placeData.name}" already exists. Skipping.`);
      } else {
        const place = new Place({
          ...placeData,
          createdBy: author._id,
          isVerified: true,
          isActive: true,
        });
        await place.save();
        console.log(`+ Added place: "${place.name}"`);
      }
    }

    console.log('✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedDB();
