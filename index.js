const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qx5eerd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const collegeCollection = client.db("BDreamsDB").collection("college");
    const reviewsCollection = client.db("BDreamsDB").collection("reviews");
    const studentCollection = client.db("BDreamsDB").collection("student");

    // Posting form data
    app.post("/student", async (req, res) => {
      const body = req.body;
      const result = await studentCollection.insertOne(body);
      res.send(result);
    });

    // Getting form data
    app.get("/student", async (req, res) => {
      const result = await studentCollection.find({}).toArray();
      res.send(result);
    });

    // Getting college data
    app.get("/college", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    // Indexing for search field
    const indexKey = { name: 1 };
    const indexOption = { name: "searchByName" };

    const result = await collegeCollection.createIndex(indexKey, indexOption);

    app.get("/searchCollege/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await collegeCollection
        .find({
          $or: [{ name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();

      res.send(result);
    });

    // Getting single college data
    app.get("/college/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    // Getting reviews data
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dream is Running");
});

app.listen(port, () => {
  console.log(`Dream is Running on port ${port}`);
});
