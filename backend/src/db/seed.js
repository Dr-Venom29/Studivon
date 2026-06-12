const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const client = new MongoClient(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studivon");

async function seed() {
  let db;
  try {
    console.log("Connecting to Studivon Database...");
    await client.connect();
    db = client.db();
    console.log("✅ Connected to Studivon local database.");
    
    // 1. Reset collections
    console.log("Cleaning tasks collection...");
    await db.collection('tasks').deleteMany({});
    
    console.log("Cleaning users collection...");
    await db.collection('users').deleteMany({});

    // 2. Insert Default User
    const user = {
      username: "student_core",
      currentGoal: "Master Neural Networks and Machine Learning",
      goalKeywords: ["neural", "network", "machine", "learning", "ai", "model"],
      userDNA: "Night Owl Specialist",
      cognitiveStyle: "Kinetic Learner (Stronger at Practice than Theory)",
      createdAt: new Date()
    };
    
    const userResult = await db.collection('users').insertOne(user);
    console.log("✅ Seeded default user profile. ID:", userResult.insertedId);

    // 3. Create completed tasks over the last 7 days
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    const completedTasks = [
      {
        title: "Build Neural Network from Scratch",
        subject: "Computer Science",
        taskType: "Practice",
        difficulty: 5,
        estimatedMinutes: 120,
        actualMinutes: 100, // highly efficient (1.2x)
        deadline: new Date(now.getTime() - 6 * oneDayMs),
        priorityScore: 140,
        status: "completed",
        completedAt: new Date(now.getTime() - 6 * oneDayMs),
        completionHour: 23, // Night Owl
        focusWindow: "Night Owl",
        efficiencyScore: "1.20",
        stabilityLevel: 2,
        createdAt: new Date(now.getTime() - 7 * oneDayMs)
      },
      {
        title: "Revise Multivariable Calculus Integration",
        subject: "Calculus",
        taskType: "Revision",
        difficulty: 3,
        estimatedMinutes: 60,
        actualMinutes: 75, // slightly inefficient (0.8x)
        deadline: new Date(now.getTime() - 5 * oneDayMs),
        priorityScore: 95,
        status: "completed",
        completedAt: new Date(now.getTime() - 5 * oneDayMs),
        completionHour: 10, // Early Bird
        focusWindow: "Early Bird",
        efficiencyScore: "0.80",
        stabilityLevel: 1,
        createdAt: new Date(now.getTime() - 6 * oneDayMs)
      },
      {
        title: "Solve Physics Quantum Mechanics Problems",
        subject: "Physics",
        taskType: "Practice",
        difficulty: 4,
        estimatedMinutes: 90,
        actualMinutes: 90, // stable (1.0x)
        deadline: new Date(now.getTime() - 4 * oneDayMs),
        priorityScore: 125,
        status: "completed",
        completedAt: new Date(now.getTime() - 4 * oneDayMs),
        completionHour: 22, // Night Owl
        focusWindow: "Night Owl",
        efficiencyScore: "1.00",
        stabilityLevel: 2,
        createdAt: new Date(now.getTime() - 5 * oneDayMs)
      },
      {
        title: "Chemistry Organic Synthesis Lab Writeup",
        subject: "Chemistry",
        taskType: "Practice",
        difficulty: 3,
        estimatedMinutes: 90,
        actualMinutes: 80, // efficient (1.13x)
        deadline: new Date(now.getTime() - 3 * oneDayMs),
        priorityScore: 108,
        status: "completed",
        completedAt: new Date(now.getTime() - 3 * oneDayMs),
        completionHour: 15, // Mid-Day Steady
        focusWindow: "Mid-Day Steady",
        efficiencyScore: "1.13",
        stabilityLevel: 2,
        createdAt: new Date(now.getTime() - 4 * oneDayMs)
      },
      {
        title: "Review: Build Neural Network from Scratch",
        subject: "Computer Science",
        taskType: "Revision",
        difficulty: 4,
        estimatedMinutes: 72,
        actualMinutes: 60, // efficient (1.20x)
        deadline: new Date(now.getTime() - 2 * oneDayMs),
        priorityScore: 120,
        status: "completed",
        completedAt: new Date(now.getTime() - 2 * oneDayMs),
        completionHour: 23, // Night Owl
        focusWindow: "Night Owl",
        efficiencyScore: "1.20",
        stabilityLevel: 4,
        createdAt: new Date(now.getTime() - 3 * oneDayMs)
      },
      {
        title: "Master Backpropagation Math Review",
        subject: "Calculus",
        taskType: "Revision",
        difficulty: 4,
        estimatedMinutes: 60,
        actualMinutes: 50, // efficient (1.20x)
        deadline: new Date(now.getTime() - 1 * oneDayMs),
        priorityScore: 130,
        status: "completed",
        completedAt: new Date(now.getTime() - 1 * oneDayMs),
        completionHour: 23, // Night Owl
        focusWindow: "Night Owl",
        efficiencyScore: "1.20",
        stabilityLevel: 2,
        createdAt: new Date(now.getTime() - 2 * oneDayMs)
      }
    ];

    await db.collection('tasks').insertMany(completedTasks);
    console.log(`✅ Seeded ${completedTasks.length} completed tasks.`);

    // 4. Create pending tasks
    const pendingTasks = [
      {
        title: "Train CNN Image Classification Model",
        subject: "Computer Science",
        taskType: "Practice",
        difficulty: 5,
        estimatedMinutes: 120,
        deadline: new Date(now.getTime() + 1 * oneDayMs), // Overdue tomorrow
        priorityScore: 225, // (5 * 25) + 100/1
        status: "pending",
        needsReschedule: false,
        createdAt: new Date()
      },
      {
        title: "Review Linear Algebra Projections",
        subject: "Calculus",
        taskType: "Revision",
        difficulty: 3,
        estimatedMinutes: 45,
        deadline: new Date(now.getTime() + 3 * oneDayMs),
        priorityScore: 108, // (3 * 25) + 100/3
        status: "pending",
        needsReschedule: false,
        createdAt: new Date()
      },
      {
        title: "Solve Physics Thermodynamics Practice Test",
        subject: "Physics",
        taskType: "Practice",
        difficulty: 4,
        estimatedMinutes: 90,
        deadline: new Date(now.getTime() + 5 * oneDayMs),
        priorityScore: 120, // (4 * 25) + 100/5
        status: "pending",
        needsReschedule: false,
        createdAt: new Date()
      },
      {
        title: "Chemistry Acid-Base Equilibrium Sheet",
        subject: "Chemistry",
        taskType: "Revision",
        difficulty: 2,
        estimatedMinutes: 60,
        deadline: new Date(now.getTime() + 10 * oneDayMs),
        priorityScore: 60, // (2 * 25) + 100/10
        status: "pending",
        needsReschedule: false,
        createdAt: new Date()
      }
    ];

    await db.collection('tasks').insertMany(pendingTasks);
    console.log(`✅ Seeded ${pendingTasks.length} pending tasks.`);
    console.log("Database successfully populated with Studivon telemetry!");

  } catch (err) {
    console.error("❌ Database seeding failed:", err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
