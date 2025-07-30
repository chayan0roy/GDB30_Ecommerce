import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  model?: string;
  description: string;
  specifications?: { label: string; value: string }[];
  colors?: string[];
  inStock?: boolean;
  categorie?: {
    name: string;
  };
}

export default function ProductScreen() {
  // const { id } = useLocalSearchParams();
  const id = '68810d2762526397f7468f44'
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://192.168.0.105:5000/products/getProduct/${id}`);
        const productData = response.data;
        
        // Transform the API data to match your frontend structure
        const transformedProduct: Product = {
          id: productData._id,
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice,
          discount: productData.discountPercentage ? `${productData.discountPercentage}% off` : undefined,
          image: productData.image || 'https://via.placeholder.com/300',
          rating: productData.rating,
          reviewCount: productData.reviewCount,
          brand: productData.brand,
          model: productData.model,
          description: productData.description,
          specifications: productData.specifications,
          colors: productData.colors,
          inStock: productData.stockQuantity > 0,
        };
        
        setProduct(transformedProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{uri: `http://192.168.0.105:5000/${product.image.replace(/\\/g, '/')}`}} style={styles.productImage} />
        <TouchableOpacity style={styles.wishlistButton}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.contentContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <>
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
              {product.discount && <Text style={styles.discount}>{product.discount}</Text>}
            </>
          )}
        </View>

        <Text style={styles.productName}>{product.name}</Text>
        
        {(product.rating || product.reviewCount) && (
          <View style={styles.ratingContainer}>
            {product.rating && (
              <View style={styles.starContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            )}
            {product.reviewCount && (
              <Text style={styles.reviewCount}>{product.reviewCount} reviews</Text>
            )}
            <Text style={styles.inStock}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        )}

        {/* Brand and Model */}
        {(product.brand || product.model) && (
          <View style={styles.brandContainer}>
            {product.brand && (
              <>
                <Text style={styles.brandLabel}>Brand:</Text>
                <Text style={styles.brandValue}>{product.brand}</Text>
              </>
            )}
            {product.model && (
              <>
                <Text style={styles.modelLabel}>Model:</Text>
                <Text style={styles.modelValue}>{product.model}</Text>
              </>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {product.specifications.map((spec, index) => (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Color Options */}
        {product.colors && product.colors.length > 0 && (
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
        )}
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

// Add these new styles to your existing StyleSheet
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
  },
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
  },});