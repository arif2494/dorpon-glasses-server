const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

// middlewear
app.use(cors());
app.use(express.json());
// MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env
	.DB_PASS}@firstcluster.fhu8f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// connect to mongo db
async function run() {
	try {
		await client.connect();
		const database = client.db('dorpon');
		const productsCollection = database.collection('products');
		const reviewCollection = database.collection('review');
		const ordersCollection = database.collection('orders');
		const usersCollection = database.collection('users');

		// get all products
		app.get('/products', async (req, res) => {
			const products = await productsCollection.find({}).toArray();
			res.json(products);
		});
		// set a product
		app.post('/products', async (req, res) => {
			const product = req.body;
			console.log(product);
			const result = await productsCollection.insertOne(product);
			res.json(result);
		})
		// delete a product
		app.delete('/products/:id', async (req, res) => {
			const id = req.params.id;
			const result = await productsCollection.deleteOne({ _id: ObjectId(id) });
			res.json(result);
		})
		// get all reviews
		app.get('/reviews', async (req, res) => {
			const products = await reviewCollection.find({}).toArray();
			res.json(products);
		});
		// save a review
		app.post('/reviews', async (req, res) => {
			const review = req.body;
			const result = await reviewCollection.insertOne(review);
			res.json(result);
		});
		// get a single product by id
		app.get('/purchase/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const product = await productsCollection.findOne(query);
			res.json(product);
		});
		// save a new order
		app.post('/orders', async (req, res) => {
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			res.json(result);
		});
		// get all orders
		app.get('/orders', async (req, res) => {
			const orders = await ordersCollection.find({}).toArray();
			res.json(orders);
		})
		// get specefic user orders
		app.get('/order/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const orders = await ordersCollection.find(query).toArray();
			res.json(orders);
		});
		// ship an order
		app.put('/order/:id', async (req, res) => {
			const id  = req.params.id;
			const query = { _id: ObjectId(id) };
			const update = {
				$set: {status: 'shipped'}
			}
			const options = { upsert: true };
			const result = await ordersCollection.updateOne(query, update, options);
			res.json(result);

		})
		// cancel an specific order
		app.delete('/order/cancel/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await ordersCollection.deleteOne(query);
			res.json(result);
		});
		// save a user
		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			res.json(result);
		});
		// save user for google sign in
		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await usersCollection.updateOne(filter, updateDoc, options);
			res.json(result);
		});
		// make an admin
		app.put('/admin/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const updateDoc = { $set: { isAdmin: true } };
			const result = await usersCollection.updateOne(query, updateDoc);
			res.json(result);
		});
		// find admin
		app.get('/admin/:email', async (req, res) => {
			const email = req.params.email;
			if (email === 'undefined') {
				return;
			}
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			if (user?.isAdmin) {
				res.json(user);
			}else{
				user.isAdmin = false;
				res.json(user);
			}
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);
app.get('/', (req, res) => {
	res.send('Server is running');
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
