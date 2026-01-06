/**
 * scripts/assignImages.js
 * Utility script to auto-assign product images by matching filenames to product names.
 * Usage: node scripts/assignImages.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('../models/Product');

const dbUrl = 'mongodb://127.0.0.1:27017/pos_system';
const productsDir = path.join(__dirname, '..', 'public', 'products');

function normalize(s){
  return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
}

// Attempt to find the most relevant image file for a product name using progressive heuristics
function findBestMatch(name, files){
  const n = normalize(name);
  if(!n) return null;
  // exact filename contains name
  for(const f of files){
    const nf = normalize(f);
    if(nf.includes(n)) return f;
  }
  // match on first token
  const first = n.split(/\s+/)[0];
  for(const f of files){
    const nf = normalize(f);
    if(nf.includes(first)) return f;
  }
  // try individual tokens
  const tokens = n.split(/\s+/).filter(Boolean);
  for(const t of tokens){
    for(const f of files){
      const nf = normalize(f);
      if(nf.includes(t) && t.length>2) return f;
    }
  }
  return null;
}

async function run(){
  await mongoose.connect(dbUrl);
  console.log('Connected to DB');
  const files = fs.readdirSync(productsDir).filter(f=> !f.startsWith('.'));
  console.log('Found files:', files);
  const products = await Product.find();
  const updates = [];
  for(const p of products){
    const match = findBestMatch(p.name, files);
    if(match){
      p.image = `/uploads/products/${match}`;
      await p.save();
      updates.push({ _id: p._id, name: p.name, image: p.image });
      console.log('Updated', p.name, '->', match);
    } else {
      console.log('No match for:', p.name);
    }
  }
  console.log('Done. Updated', updates.length, 'products.');
  await mongoose.disconnect();
}

run().catch(err=>{ console.error(err); process.exit(1) });
