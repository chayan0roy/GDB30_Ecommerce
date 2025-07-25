import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
};

type WishlistItem = {
  product: Product;
};

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');

        // Fetch all data in parallel
        const [bannersRes, categoriesRes, productsRes] = await Promise.all([
          axios.get('http://192.168.0.105:5000/banners/allBanner'),
          axios.get('http://192.168.0.105:5000/categories/getAllCategories'),
          axios.get('http://192.168.0.105:5000/products/allProduct', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ]);

        setBanners(bannersRes.data);
        setCategories(categoriesRes.data.categories);
        setProducts(productsRes.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get('http://192.168.0.105:5000/watchlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setWishlist(response.data);
    } catch (error) {
      console.error('Fetch watchlist error:', error);
      Alert.alert('Error', 'Failed to fetch watchlist');
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Login Required', 'Please login to manage your wishlist');
        return;
      }

      const response = await axios.post(
        `http://192.168.0.105:5000/watchlist/toggle/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state based on response
      if (response.data.inWishlist) {
        // Find the product to add to wishlist
        const productToAdd = products.find(p => p._id === productId);
        if (productToAdd) {
          setWishlist(prev => [...prev, { product: productToAdd }]);
        }
      } else {
        setWishlist(prev => prev.filter(item => item.product._id !== productId));
      }

      // Show feedback to user
      Toast.show({
        type: response.data.inWishlist ? 'success' : 'info',
        text1: response.data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
        position: 'bottom'
      });

    } catch (err) {
      console.error('Wishlist error:', err);
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Login Required', 'Please login to add items to your cart');
        return { success: false };
      }

      const response = await axios.post(
        `http://192.168.0.105:5000/cart/add/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message,
          position: 'bottom',
          visibilityTime: 2000
        });
        return { success: true, cart: response.data.cart };
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add to cart');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add to cart. Please try again.'
      );
      return { success: false };
    }
  };

  const renderBannerItem = ({ item }: { item: any }) => (
    <View style={styles.bannerContainer}>
      <Image
        source={{ uri: `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay} />
    </View>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryImageContainer}>
        {item.image ? (
          <Image source={{ uri: `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` }} style={styles.categoryImage} />
        ) : (
          <Ionicons name="image" size={30} color="#95a5a6" />
        )}
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const isInWishlist = wishlist.some(wishItem => wishItem.product._id === item._id);
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productImageContainer}>
          <Image source={{ uri: `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` }} style={styles.productImage} />

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => toggleWishlist(item._id)}
          >
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist ? "#e74c3c" : "#fff"}
            />
          </TouchableOpacity>

          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {item.discount}% OFF
              </Text>
            </View>
          )}
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.priceContainer}>
            {item.discount > 0 ? (
              <>
                <Text style={styles.currentPrice}>${item.price}</Text>
                <Text style={styles.originalPrice}>
                  ${Math.round(item.price / (1 - item.discount / 100))}
                </Text>
                <Text style={styles.discount}>
                  ({item.discount}% off)
                </Text>
              </>
            ) : (
              <Text style={styles.currentPrice}>
                ${item.price}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item._id)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <Text style={styles.errorText}>Error loading data: {error}</Text>
        <TouchableOpacity onPress={() => {
          setLoading(true);
          setError(null);
          fetchData();
          fetchWatchlist();
        }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {banners.length > 0 && (
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
        )}

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
            keyExtractor={item => item._id}
          />
        </View>

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
            keyExtractor={item => item._id}
          />
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryText: {
    color: '#3498db',
    fontWeight: 'bold',
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
  },
  productDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});