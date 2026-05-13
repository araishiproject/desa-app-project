const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'On Delivery', 'Completed'], 
        default: 'Pending' 
    },
    kurirId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // User yang memiliki role 'kurir'
        default: null 
    },
    deliveryAddress: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);