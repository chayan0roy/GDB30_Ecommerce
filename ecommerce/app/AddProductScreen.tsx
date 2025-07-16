import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddProductScreen() {
	const [product, setProduct] = useState({
		image: null,
		name: '',
		price: '',
		category: '',
		description: '',
		quantity: '',
		tags: '',
		discount: ''
	});

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setProduct({ ...product, image: result.assets[0].uri });
		}
	};






	const handleAddProduct = async () => {
		try {

			const formData = new FormData();

			formData.append('name', product.name);
			formData.append('description', product.description);
			formData.append('price', product.price);
			formData.append('discount', product.discount);
			formData.append('quantity', product.quantity);
			formData.append('categorie', product.category);
			formData.append('tags', product.tags);

			if (product.image) {
				formData.append('images', {
					uri: product.image,
					type: 'image/jpeg', // or 'image/png'
					name: `product_${Date.now()}.jpg`
				});
			}

			const token = await AsyncStorage.getItem('userToken');
			if (!token) {
				throw new Error('No authentication token found');
			}


			const response = await axios.post(`${API_URL}/addProduct`, formData, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'multipart/form-data',
				},
			});


			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to add product');
			}

			const createdProduct = await response.json();
			console.log('Product added successfully:', createdProduct);

			// 5. Return the created product
			return createdProduct;

		} catch (error) {
			console.error('Product addition failed:', error);
			throw error; // Re-throw to let the caller handle it
		}
	};












	return (
		<ScrollView style={styles.container}>
			<Text style={styles.header}>Add New Product</Text>

			{/* Image Upload */}
			<TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
				{product.image ? (
					<Image source={{ uri: product.image }} style={styles.imagePreview} />
				) : (
					<View style={styles.imagePlaceholder}>
						<Ionicons name="camera" size={40} color="#95a5a6" />
						<Text style={styles.imageText}>Upload Product Image</Text>
					</View>
				)}
			</TouchableOpacity>

			{/* Product Details Form */}
			<View style={styles.formGroup}>
				<Text style={styles.label}>Product Name</Text>
				<TextInput
					style={styles.input}
					value={product.name}
					onChangeText={(text) => setProduct({ ...product, name: text })}
					placeholder="Enter product name"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Price ($)</Text>
				<TextInput
					style={styles.input}
					value={product.price}
					onChangeText={(text) => setProduct({ ...product, price: text })}
					placeholder="Enter price"
					keyboardType="numeric"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Category</Text>
				<TextInput
					style={styles.input}
					value={product.category}
					onChangeText={(text) => setProduct({ ...product, category: text })}
					placeholder="Enter category"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Description</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					value={product.description}
					onChangeText={(text) => setProduct({ ...product, description: text })}
					placeholder="Enter description"
					multiline
					numberOfLines={4}
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Quantity</Text>
				<TextInput
					style={styles.input}
					value={product.quantity}
					onChangeText={(text) => setProduct({ ...product, quantity: text })}
					placeholder="Enter quantity"
					keyboardType="numeric"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Tags (comma separated)</Text>
				<TextInput
					style={styles.input}
					value={product.tags}
					onChangeText={(text) => setProduct({ ...product, tags: text })}
					placeholder="e.g., electronics, smartphone, premium"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Discount (%)</Text>
				<TextInput
					style={styles.input}
					value={product.discount}
					onChangeText={(text) => setProduct({ ...product, discount: text })}
					placeholder="Enter discount percentage"
					keyboardType="numeric"
				/>
			</View>

			<TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
				<Text style={styles.addButtonText}>Add Product</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#2c3e50',
	},
	imageUpload: {
		width: '100%',
		height: 200,
		marginBottom: 20,
		borderRadius: 10,
		overflow: 'hidden',
	},
	imagePlaceholder: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ecf0f1',
	},
	imagePreview: {
		width: '100%',
		height: '100%',
	},
	imageText: {
		marginTop: 10,
		color: '#95a5a6',
	},
	formGroup: {
		marginBottom: 15,
	},
	label: {
		marginBottom: 8,
		fontSize: 16,
		color: '#2c3e50',
	},
	input: {
		borderWidth: 1,
		borderColor: '#bdc3c7',
		borderRadius: 5,
		padding: 12,
		fontSize: 16,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	addButton: {
		backgroundColor: '#27ae60',
		padding: 15,
		borderRadius: 5,
		alignItems: 'center',
		marginTop: 20,
	},
	addButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
});