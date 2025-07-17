import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dummy wishlist data
const dummyWishlist = [
  {
    id: '1',
    name: 'Premium Smartphone X200',
    price: 599,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=60',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Wireless Headphones Pro',
    price: 129,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    rating: 4.2,
  }
];

export default function WatchlistScreen() {
  const [wishlist, setWishlist] = useState(dummyWishlist);
  const [refreshing, setRefreshing] = useState(false);

  const handleRemove = (productId) => {
    setWishlist(wishlist.filter(item => item.id !== productId));
  };

  const handleAddToCart = (productId) => {
    alert(`Product ${productId} added to cart!`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh by resetting to dummy data
    setTimeout(() => {
      setWishlist(dummyWishlist);
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Wishlist</Text>
      
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color="#95a5a6" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubText}>Tap the heart icon on products to save them</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#e74c3c']}
            />
          }
        >
          {wishlist.map((product) => (
            <View key={product.id} style={styles.wishlistItem}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>${product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                  )}
                </View>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemove(product.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(product.id)}
                >
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#95a5a6',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e74c3c',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2c3e50',
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  removeButton: {
    padding: 4,
    alignSelf: 'flex-end',
  },
  addToCartButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});