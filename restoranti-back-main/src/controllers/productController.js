const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, imageUrl, tags, createdByAdminId } = req.body;
    
    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({ msg: 'Name, category and price are required' });
    }
    
    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock: stock || 0,
      imageUrl,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
      createdByAdminId,
      createdAt: new Date()
    });
    
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, imageUrl, tags } = req.body;
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Update product fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (tags !== undefined) product.tags = Array.isArray(tags) ? tags.join(',') : tags;
    
    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    await product.destroy();
    
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
