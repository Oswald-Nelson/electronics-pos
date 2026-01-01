const mongoose = require('mongoose');
const Product = require('../models/Product');

const dbUrl = 'mongodb://127.0.0.1:27017/pos_system';

const toRemove = ['Smartphone X','Laptop Pro','Wireless Headphones'];

const newProducts = [
  { name: 'Apple AirPods Pro 3', price: 199.99, category: 'Audio', brand: 'Apple', quantityInStock: 20, image: '/uploads/products/Apple AirPods Pro 3.jpeg' },
  { name: 'ASUS NVIDIA GeForce RTX 5090', price: 1299.99, category: 'GPU', brand: 'ASUS', quantityInStock: 10, image: '/uploads/products/ASUS NVIDIA GeForce RTX 5090.jpeg' },
  { name: 'Dell Optiplex 9020 Desktop Computer', price: 499.99, category: 'Desktop', brand: 'Dell', quantityInStock: 8, image: '/uploads/products/Dell Optiplex 9020 Desktop Computer.jpeg' },
  { name: 'HP Laptop 14', price: 699.99, category: 'Laptop', brand: 'HP', quantityInStock: 15, image: '/uploads/products/HP Laptop 14.jpeg' },
  { name: 'iPhone 15 Pro Max 256gb White Titanium', price: 1199.99, category: 'Phone', brand: 'Apple', quantityInStock: 12, image: '/uploads/products/iPhone 15 Pro Max 256gb White Titanium.jpeg' },
  { name: 'MacBook', price: 1299.99, category: 'Laptop', brand: 'Apple', quantityInStock: 10, image: '/uploads/products/MacBook.jpeg' },
  { name: 'PlayStation 5', price: 499.99, category: 'Console', brand: 'Sony', quantityInStock: 25, image: '/uploads/products/PlayStation 5.jpeg' },
  { name: 'Samsung Galaxy S24 Ultra', price: 1199.99, category: 'Phone', brand: 'Samsung', quantityInStock: 12, image: '/uploads/products/Samsung Galaxy S24 Ultra.jpeg' }
];

async function run(){
  await mongoose.connect(dbUrl);
  console.log('Connected to DB');

  for(const name of toRemove){
    const res = await Product.deleteMany({ name: new RegExp('^' + name + '$', 'i') });
    console.log(`Removed ${res.deletedCount} products matching '${name}'`);
  }

  for(const p of newProducts){
    // check if exists
    const existing = await Product.findOne({ name: p.name });
    if(existing){
      console.log('Product exists, updating:', p.name);
      existing.price = p.price;
      existing.category = p.category;
      existing.brand = p.brand;
      existing.quantityInStock = p.quantityInStock;
      existing.image = p.image;
      await existing.save();
    } else {
      await Product.create(p);
      console.log('Created product:', p.name);
    }
  }

  console.log('Done.');
  await mongoose.disconnect();
}

run().catch(err=>{ console.error(err); process.exit(1) });