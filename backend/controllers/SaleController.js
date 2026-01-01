/**
 * SaleController.js
 * Handles creating sales and querying sales with role-based filters.
 * Includes stock adjustments when sales are created.
 */

const Sale = require("../models/Sale");
const Product = require("../models/Product");

// Create Sale (Teller)
exports.createSale = async (req, res) => {
  try {
    const { items, clientId, paymentMethod = 'cash', paymentBreakdown = {} } = req.body;
    let total = 0;

    // Check stock and calculate total
    for (let i of items) {
      const product = await Product.findById(i.product);
      if (!product) return res.status(400).json({ message: `Product not found: ${i.product}` });
      if (product.quantityInStock < i.qty)
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

      product.quantityInStock -= i.qty;
      await product.save();
      i.price = product.price;
      total += product.price * i.qty;
    }

    const saleData = {
      items,
      totalAmount: total,
      paymentMethod,
      paymentBreakdown: {
        cash: paymentBreakdown.cash || (paymentMethod === 'cash' ? total : 0),
        momo: paymentBreakdown.momo || (paymentMethod === 'momo' ? total : 0),
        card: paymentBreakdown.card || (paymentMethod === 'card' ? total : 0),
        other: paymentBreakdown.other || 0
      }
    };

    // Assign teller or client depending on who is creating the sale
    if (req.user.role === 'teller') {
      saleData.teller = req.user._id;
      if (clientId) saleData.client = clientId;
    } else if (req.user.role === 'client') {
      saleData.client = req.user._id;
    } else if (clientId) {
      // admin or others creating sales on behalf
      saleData.client = clientId;
    }

    const sale = await Sale.create(saleData);

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Sales (role-based)
exports.getSales = async (req, res) => {
  try {
    const { startDate, endDate, productId, minAmount, maxAmount } = req.query;
    const filter = {};

    if (req.user.role === 'admin') {
      // admin sees all unless filters applied
    } else if (req.user.role === 'teller') {
      filter.teller = req.user._id;
    } else {
      filter.client = req.user._id;
    }

    if (startDate) filter.date = { ...(filter.date || {}), $gte: new Date(startDate) };
    if (endDate) filter.date = { ...(filter.date || {}), $lte: new Date(endDate) };
    if (productId) filter['items.product'] = productId;
    if (req.query.clientId) filter.client = req.query.clientId;
    if (minAmount) filter.totalAmount = { ...(filter.totalAmount || {}), $gte: Number(minAmount) };
    if (maxAmount) filter.totalAmount = { ...(filter.totalAmount || {}), $lte: Number(maxAmount) };

    const sales = await Sale.find(filter).populate('items.product').populate('teller', 'name');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
