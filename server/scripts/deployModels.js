const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// MongoDB Connection URI (Replace with your connection string)
const MONGODB_URI = process.env.MONGODB_URI;

// Path to the directory containing model files
const MODELS_DIR = path.join(__dirname, "../models");

console.log(MONGODB_URI, MODELS_DIR);

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

// Load all models from the "models" directory
function loadModels() {
    fs.readdirSync(MODELS_DIR).forEach((file) => {
        if (file.endsWith(".js")) {
            require(path.join(MODELS_DIR, file));
            console.log(`Loaded model: ${file}`);
        }
    });
}

// Ensure collections exist
async function ensureCollectionsExist() {
    const db = mongoose.connection.db;
    const modelNames = mongoose.modelNames();

    for (const modelName of modelNames) {
        const collectionName = mongoose.model(modelName).collection.name;
        
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
            await db.createCollection(collectionName);
            console.log(`Created collection: ${collectionName}`);
        } else {
            console.log(`Collection ${collectionName} already exists.`);
        }
    }
}

// Deploy function to run the whole process
async function deploy() {
    await connectToMongoDB();
    loadModels();
    await ensureCollectionsExist();
    mongoose.connection.close();
    console.log("Deployment complete.");
}

// Execute the script
deploy().catch(console.error);
