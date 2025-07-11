import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

// Sample data
const banners = [
  { id: '1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=60' },
  { id: '2', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&auto=format&fit=crop&q=60' },
  { id: '3', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
];

const categories = [
  { id: '1', name: 'Electronics', image: 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png' },
  { id: '2', name: 'Fashion', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081828.png' },
  { id: '3', name: 'Home', image: 'https://cdn-icons-png.flaticon.com/512/2373/2373936.png' },
  { id: '4', name: 'Beauty', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081839.png' },
  { id: '5', name: 'Sports', image: 'https://cdn-icons-png.flaticon.com/512/857/857455.png' },
  { id: '6', name: 'Books', image: 'https://cdn-icons-png.flaticon.com/512/2702/2702069.png' },
];

const products = [
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
  },
  {
    id: '3',
    name: 'Smart Watch Series 5',
    price: 249,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Bluetooth Speaker',
    price: 89,
    originalPrice: 129,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&auto=format&fit=crop&q=60',
    rating: 4.3,
  },
];

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]); // Track wishlist items by ID
  const carouselRef = useRef(null);

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const addToCart = (productId: string) => {
    // In a real app, you would add to cart logic here
    alert(`Product ${productId} added to cart!`);
  };

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay} />
    </View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryImageContainer}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      {/* Product Image with Wishlist Button */}
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        {/* Wishlist Button */}
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(item.id)}
        >
          <Ionicons 
            name={wishlist.includes(item.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={wishlist.includes(item.id) ? "#e74c3c" : "#fff"} 
          />
        </TouchableOpacity>
        
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
          </Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          <Text style={styles.originalPrice}>${item.originalPrice}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        
        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item.id)}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
          <TextInput
            placeholder="Search products..."
            style={styles.searchInput}
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#2c3e50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Slider */}
        <View style={styles.bannerSection}>
          <Carousel
            ref={carouselRef}
            loop
            width={width}
            height={200}
            autoPlay={true}
            data={banners}
            scrollAnimationDuration={1000}
            autoPlayInterval={3000}
            onSnapToItem={(index) => setActiveIndex(index)}
            renderItem={renderBannerItem}
          />
          <View style={styles.pagination}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            keyExtractor={item => item.id}
          />
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
            keyExtractor={item => item.id}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterButton: {
    padding: 8,
  },
  bannerSection: {
    marginBottom: 16,
    position: 'relative',
  },
  bannerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pagination: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  seeAll: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  categoryList: {
    paddingHorizontal: 8,
  },
  categoryItem: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 8,
    height: 36,
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
    fontSize: 12,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2c3e50',
  },
  addToCartButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});