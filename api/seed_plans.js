require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const SubscriptionPlan = require('./models/SubscriptionPlan');

const plans = [
  {
    name: 'Cơ bản',
    price: 0,
    description: 'Dành cho người dùng mới bắt đầu',
    features: [
      '3 gợi ý AI mỗi tháng',
      'Lập kế hoạch hành trình cơ bản',
      'Truy cập cộng đồng'
    ],
    aiSuggestionLimit: 3
  },
  {
    name: 'Chuyên nghiệp',
    price: 99000,
    description: 'Dành cho người dùng có nhu cầu cao hơn',
    features: [
      '50 gợi ý AI mỗi tháng',
      'Lập kế hoạch hành trình nâng cao',
      'Hỗ trợ ưu tiên',
      'Truy cập cộng đồng'
    ],
    aiSuggestionLimit: 50
  },
  {
    name: 'Không giới hạn',
    price: 249000,
    description: 'Dành cho người dùng chuyên nghiệp và các tín đồ',
    features: [
      'Gợi ý AI không giới hạn',
      'Lập kế hoạch hành trình nâng cao',
      'Hỗ trợ ưu tiên 24/7',
      'Truy cập cộng đồng độc quyền'
    ],
    aiSuggestionLimit: -1 // -1 for unlimited
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau', {});
    console.log('MongoDB Connected...');

    await SubscriptionPlan.deleteMany();
    console.log('Existing plans removed...');

    await SubscriptionPlan.insertMany(plans);
    console.log('New plans have been seeded!');

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPlans();
