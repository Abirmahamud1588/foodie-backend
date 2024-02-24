const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const cors = require("cors");

require("dotenv").config();
const port = process.env.PORT || 6001;

//middleware
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello dfsgdfsgsdfgsdfgsdfg!");
});

// const uri ="mongodb+srv://foodssie:foodssie@cluster0.120eciu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.120eciu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //database and collection
    const menucollection = client.db("foodiedb").collection("menus");
    const cartcollection = client.db("foodiedb").collection("cartItems");

    const userscollection = client.db("foodiedb").collection("users");

    //add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userscollection.insertOne(user);
      res.send(result);
    });
    //all menu
    app.get("/menu", async (req, res) => {
      const result = await menucollection.find().toArray();
      res.send(result);
    });
    //cart inser
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartcollection.insertOne(cartItem);
      res.send(result);
    });

    //cart by user email
    app.get("/carts", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const result = await cartcollection.find(query).toArray();
      res.send(result);
    });

    //get sppecific  product from the carts
    app.get("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartcollection.findOne(query);
      res.send(result);
    });

    //update a product from the carts for quantity
    app.put("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const { quantity } = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedoc = {
        $set: {
          quantity: parseInt(quantity, 10),
        },
      };
      const result = await cartcollection.updateOne(query, updatedoc, option);
    });

    //delete a product from the carts
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartcollection.deleteOne(query);
      res.send(result);
    });

    //
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
