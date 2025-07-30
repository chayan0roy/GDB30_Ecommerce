import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

export default function WatchlistScreen() {
	const isFocused = useIsFocused();
	const [wishlist, setWishlist] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(true);

	const fetchWatchlist = async () => {
		try {
			setRefreshing(true);
			const token = await AsyncStorage.getItem('userToken');
			const response = await axios.get('http://192.168.0.105:5000/watchlist', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			setWishlist(response.data);
		} catch (error) {
			console.error('Fetch watchlist error:', error);
			Alert.alert('Error', 'Failed to fetch watchlist');
		} finally {
			setRefreshing(false);
			setLoading(false);
		}
	};

	const handleRemove = async (productId) => {
		try {
			console.log('Attempting to remove product ID:', productId); // Log the ID being sent
			const token = await AsyncStorage.getItem('userToken');
			const response = await axios.delete(
				`http://192.168.0.105:5000/watchlist/deleteWatchlist/${productId}`,
				{
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);

			console.log('Delete response:', response.data); // Log the response
			fetchWatchlist(); // Refresh the list after removal

		} catch (error) {
			console.error('Remove from watchlist error:', error.response?.data || error.message);
			Alert.alert('Error', error.response?.data?.message || 'Failed to remove from watchlist');
		}
	};

	const handleAddToCart = async (productId) => {
		try {
			const token = await AsyncStorage.getItem('userToken');
			await axios.post(`http://192.168.0.105:5000/cart/add/${productId}`, {}, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			Alert.alert('Success', 'Product added to cart!');
		} catch (error) {
			console.error('Add to cart error:', error);
			Alert.alert('Error', 'Failed to add to cart');
		}
	};

	useEffect(() => {
		if (isFocused) {
			fetchWatchlist();
		}
	}, [isFocused]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#e74c3c" />
			</View>
		);
	}

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
							onRefresh={fetchWatchlist}
							colors={['#e74c3c']}
						/>
					}
				>
					{wishlist.map((item) => (
						<View key={item.product._id} style={styles.wishlistItem}>
							<Image
								source={{ uri: `http://192.168.0.105:5000/${item.product.image.replace(/\\/g, '/')}` }}
								style={styles.productImage}
							/>

							<View style={styles.productInfo}>
								<Text style={styles.productName} numberOfLines={2}>{item.product.name}</Text>
								<View style={styles.priceContainer}>
									<Text style={styles.currentPrice}>${item.product.price}</Text>
									{item.product.discount > 0 && (
										<Text style={styles.originalPrice}>
											${(item.product.price / (1 - item.product.discount / 100)).toFixed(2)}
										</Text>
									)}
								</View>
							</View>

							<View style={styles.actions}>
								<TouchableOpacity
									style={styles.removeButton}
									onPress={() => handleRemove(item.product._id)}
								>
									<Ionicons name="trash-outline" size={20} color="#e74c3c" />
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.addToCartButton}
									onPress={() => handleAddToCart(item.product._id)}
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
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