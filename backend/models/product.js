const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String 
    },
    image: { 
        type: String // Menyimpan path file gambar
    },
    category: { 
        type: String, 
        default: 'Produk Desa' 
    },
    stock: { 
        type: Number, 
        default: 1 
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);