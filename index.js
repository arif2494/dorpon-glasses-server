const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
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

		// get all products
		app.get('/products', async (req, res) => {
			const products = await productsCollection.find({}).toArray();
			res.json(products);
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
