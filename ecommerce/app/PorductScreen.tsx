import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const productData = {
  id: '1',
  name: 'Premium Smartphone X200',
  price: '$599',
  originalPrice: '$699',
  discount: '14% off',
  image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=60',
  rating: 4.5,
  reviewCount: 1243,
  brand: 'TechMaster',
  model: 'X200 Pro',
  description: 'The Premium Smartphone X200 features a 6.7" AMOLED display, 128GB storage, 8GB RAM, and a triple camera system with 108MP main sensor. With 2-day battery life and IP68 water resistance, it\'s built for performance and durability.',
  specifications: [
    { label: 'Display', value: '6.7" AMOLED, 120Hz' },
    { label: 'Processor', value: 'Snapdragon 8 Gen 2' },
    { label: 'Storage', value: '128GB (expandable)' },
    { label: 'RAM', value: '8GB LPDDR5' },
    { label: 'Camera', value: '108MP + 12MP + 8MP' },
    { label: 'Battery', value: '5000mAh, Fast Charge' },
    { label: 'OS', value: 'Android 13' },
    { label: 'Water Resistance', value: 'IP68' },
  ],
  colors: ['#2c3e50', '#e74c3c', '#3498db', '#f1c40f'],
  inStock: true,
};

export default function PorductScreen() {
  const { id } = useLocalSearchParams();
  
  // In a real app, you would fetch product details based on the ID
  const product = productData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <TouchableOpacity style={styles.wishlistButton}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.contentContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>{product.price}</Text>
          <Text style={styles.originalPrice}>{product.originalPrice}</Text>
          <Text style={styles.discount}>{product.discount}</Text>
        </View>

        <Text style={styles.productName}>{product.name}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.starContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
          <Text style={styles.reviewCount}>{product.reviewCount} reviews</Text>
          <Text style={styles.inStock}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>

        {/* Brand and Model */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandLabel}>Brand:</Text>
          <Text style={styles.brandValue}>{product.brand}</Text>
          <Text style={styles.modelLabel}>Model:</Text>
          <Text style={styles.modelValue}>{product.model}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          {product.specifications.map((spec, index) => (
            <View key={index} style={styles.specRow}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>

        {/* Color Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Options</Text>
          <View style={styles.colorOptions}>
            {product.colors.map((color, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.colorOption, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart" size={20} color="#fff" style={styles.cartIcon} />
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 350,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e74c3c',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ecc71',
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  ratingText: {
    marginLeft: 4,
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    color: '#7f8c8d',
    marginRight: 15,
  },
  inStock: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  brandContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  brandLabel: {
    fontWeight: '600',
    color: '#7f8c8d',
    marginRight: 5,
  },
  brandValue: {
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 15,
  },
  modelLabel: {
    fontWeight: '600',
    color: '#7f8c8d',
    marginRight: 5,
  },
  modelValue: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  descriptionText: {
    color: '#34495e',
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  specLabel: {
    color: '#7f8c8d',
  },
  specValue: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  colorOptions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  cartButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    marginRight: 10,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});