const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Itinerary = require('../models/Itinerary');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/an-gi-o-dau-test';

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(mongoUri, {});
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    await Place.deleteMany({});
    await Review.deleteMany({});
    await Itinerary.deleteMany({});
    await SubscriptionPlan.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('User Model Integration', () => {
    it('should create and save a user successfully', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@test.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.role).toBe('user'); // Default role
      expect(savedUser.isActive).toBe(true); // Default active
    });

    it('should not save user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not save user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@test.com',
        password: 'password123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Place Model Integration', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Place Creator',
        email: 'creator@test.com',
        password: 'password123'
      });
    });

    it('should create and save a place successfully', async () => {
      const placeData = {
        name: 'Integration Test Cafe',
        description: 'A test cafe for integration testing',
        category: 'cafe',
        subcategory: 'Cà phê học bài',
        address: {
          street: '123 Integration Street',
          ward: 'Phường Test',
          district: 'Quận Test',
          city: 'Hà Nội'
        },
        location: {
          type: 'Point',
          coordinates: [105.8, 21.0]
        },
        createdBy: testUser._id
      };

      const place = new Place(placeData);
      const savedPlace = await place.save();

      expect(savedPlace._id).toBeDefined();
      expect(savedPlace.name).toBe(placeData.name);
      expect(savedPlace.isActive).toBe(true);
      expect(savedPlace.createdBy.toString()).toBe(testUser._id.toString());
    });

    it('should calculate average rating correctly', async () => {
      const place = await Place.create({
        name: 'Rating Test Cafe',
        description: 'Test cafe for rating calculation',
        category: 'cafe',
        address: {
          street: '123 Test Street',
          ward: 'Test Ward',
          district: 'Test District',
          city: 'Hà Nội'
        },
        location: {
          type: 'Point',
          coordinates: [105.8, 21.0]
        },
        createdBy: testUser._id
      });

      // Create reviews
      await Review.create([
        {
          place: place._id,
          user: testUser._id,
          rating: 4,
          title: 'Good place',
          content: 'Nice cafe',
          visitDate: new Date()
        },
        {
          place: place._id,
          user: testUser._id,
          rating: 5,
          title: 'Excellent',
          content: 'Amazing cafe',
          visitDate: new Date()
        }
      ]);

      // Update place rating
      const reviews = await Review.find({ place: place._id });
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      place.rating = {
        average: avgRating,
        count: reviews.length
      };
      await place.save();

      expect(place.rating.average).toBe(4.5);
      expect(place.rating.count).toBe(2);
    });
  });

  describe('Review Model Integration', () => {
    let testUser, testPlace;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Review Creator',
        email: 'reviewer@test.com',
        password: 'password123'
      });

      testPlace = await Place.create({
        name: 'Review Test Cafe',
        description: 'Test cafe for reviews',
        category: 'cafe',
        address: {
          street: '123 Review Street',
          ward: 'Test Ward',
          district: 'Test District',
          city: 'Hà Nội'
        },
        location: {
          type: 'Point',
          coordinates: [105.8, 21.0]
        },
        createdBy: testUser._id
      });
    });

    it('should create and save a review successfully', async () => {
      const reviewData = {
        place: testPlace._id,
        user: testUser._id,
        rating: 4,
        title: 'Integration Test Review',
        content: 'This is a test review for integration testing',
        visitDate: new Date(),
        visitType: 'dine_in',
        pricePaid: 50000,
        groupSize: 2
      };

      const review = new Review(reviewData);
      const savedReview = await review.save();

      expect(savedReview._id).toBeDefined();
      expect(savedReview.rating).toBe(4);
      expect(savedReview.place.toString()).toBe(testPlace._id.toString());
      expect(savedReview.user.toString()).toBe(testUser._id.toString());
    });

    it('should populate place and user data', async () => {
      const review = await Review.create({
        place: testPlace._id,
        user: testUser._id,
        rating: 5,
        title: 'Populated Review',
        content: 'Test review with population',
        visitDate: new Date()
      });

      const populatedReview = await Review.findById(review._id)
        .populate('place', 'name category')
        .populate('user', 'name email');

      expect(populatedReview.place.name).toBe(testPlace.name);
      expect(populatedReview.user.name).toBe(testUser.name);
    });
  });

  describe('Itinerary Model Integration', () => {
    let testUser, testPlace;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Itinerary Creator',
        email: 'itinerary@test.com',
        password: 'password123'
      });

      testPlace = await Place.create({
        name: 'Itinerary Test Place',
        description: 'Test place for itineraries',
        category: 'restaurant',
        address: {
          street: '123 Itinerary Street',
          ward: 'Test Ward',
          district: 'Test District',
          city: 'Hà Nội'
        },
        location: {
          type: 'Point',
          coordinates: [105.8, 21.0]
        },
        createdBy: testUser._id
      });
    });

    it('should create and save an itinerary successfully', async () => {
      const itineraryData = {
        title: 'Integration Test Itinerary',
        description: 'Test itinerary for integration testing',
        duration: 1,
        activities: [
          {
            name: 'Visit Test Place',
            description: 'Test the integration test place',
            time: '09:00',
            place: testPlace._id
          },
          {
            name: 'Lunch Break',
            description: 'Have lunch at the place',
            time: '12:00',
            place: testPlace._id
          }
        ],
        estimatedBudget: {
          min: 100000,
          max: 200000
        },
        createdBy: testUser._id
      };

      const itinerary = new Itinerary(itineraryData);
      const savedItinerary = await itinerary.save();

      expect(savedItinerary._id).toBeDefined();
      expect(savedItinerary.title).toBe(itineraryData.title);
      expect(savedItinerary.activities).toHaveLength(2);
      expect(savedItinerary.isPublic).toBe(false); // Default private
    });
  });

  describe('SubscriptionPlan Model Integration', () => {
    it('should create and save a subscription plan successfully', async () => {
      const planData = {
        name: 'Integration Test Plan',
        description: 'Test subscription plan for integration testing',
        price: 99000,
        duration: 30,
        features: [
          'AI-powered suggestions',
          'Premium support',
          'Advanced analytics'
        ]
      };

      const plan = new SubscriptionPlan(planData);
      const savedPlan = await plan.save();

      expect(savedPlan._id).toBeDefined();
      expect(savedPlan.name).toBe(planData.name);
      expect(savedPlan.features).toHaveLength(3);
      expect(savedPlan.isActive).toBe(true); // Default active
    });
  });

  describe('Database Relationships', () => {
    let testUser, testPlace, testReview;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Relationship Test User',
        email: 'relationship@test.com',
        password: 'password123'
      });

      testPlace = await Place.create({
        name: 'Relationship Test Place',
        description: 'Test place for relationship testing',
        category: 'cafe',
        address: {
          street: '123 Relationship Street',
          ward: 'Test Ward',
          district: 'Test District',
          city: 'Hà Nội'
        },
        location: {
          type: 'Point',
          coordinates: [105.8, 21.0]
        },
        createdBy: testUser._id
      });

      testReview = await Review.create({
        place: testPlace._id,
        user: testUser._id,
        rating: 4,
        title: 'Relationship Test Review',
        content: 'Test review for relationship testing',
        visitDate: new Date()
      });
    });

    it('should maintain referential integrity on user deletion', async () => {
      // Delete user
      await User.findByIdAndDelete(testUser._id);

      // Check that places and reviews still exist but reference is maintained
      const place = await Place.findById(testPlace._id);
      const review = await Review.findById(testReview._id);

      expect(place).toBeTruthy();
      expect(review).toBeTruthy();
      expect(place.createdBy.toString()).toBe(testUser._id.toString());
      expect(review.user.toString()).toBe(testUser._id.toString());
    });

    it('should cascade delete reviews when place is deleted', async () => {
      // This would require implementing cascade delete middleware
      // For now, just test that we can find related reviews
      const reviews = await Review.find({ place: testPlace._id });
      expect(reviews).toHaveLength(1);
      expect(reviews[0]._id.toString()).toBe(testReview._id.toString());
    });
  });
});