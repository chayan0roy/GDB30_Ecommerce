import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddCategoryScreen() {
	const [category, setCategory] = useState({
		image: null,
		name: ''
	});

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setCategory({ ...category, image: result.assets[0].uri });
		}
	};




	const handleAddCategory = async () => {
		try {

			const formData = new FormData();
			formData.append('name', category.name);

			if (category.image) {
				formData.append('image', {
					uri: category.image,
					type: 'image/jpeg',
					name: `category_${Date.now()}.jpg`
				});
			}

			const token = await AsyncStorage.getItem('userToken');

			const response = await axios.post(`${API_URL}/categories`, formData, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'multipart/form-data',
				},
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create category');
			}

			const createdCategory = await response.json();
			console.log('Category created successfully:', createdCategory);

			return createdCategory;

		} catch (error) {
			console.error('Category creation failed:', error);
			throw error;
		}
	};









	return (
		<View style={styles.container}>
			<Text style={styles.header}>Add New Category</Text>

			{/* Image Upload */}
			<TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
				{category.image ? (
					<Image source={{ uri: category.image }} style={styles.imagePreview} />
				) : (
					<View style={styles.imagePlaceholder}>
						<Ionicons name="image" size={40} color="#95a5a6" />
						<Text style={styles.imageText}>Upload Category Image</Text>
					</View>
				)}
			</TouchableOpacity>

			{/* Category Name */}
			<View style={styles.formGroup}>
				<Text style={styles.label}>Category Name</Text>
				<TextInput
					style={styles.input}
					value={category.name}
					onChangeText={(text) => setCategory({ ...category, name: text })}
					placeholder="Enter category name"
				/>
			</View>

			<TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
				<Text style={styles.addButtonText}>Add Category</Text>
			</TouchableOpacity>
		</View>
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
		backgroundColor: '#ecf0f1',
		justifyContent: 'center',
		alignItems: 'center',
	},
	imagePreview: {
		width: '100%',
		height: '100%',
	},
	imagePlaceholder: {
		alignItems: 'center',
	},
	imageText: {
		marginTop: 10,
		color: '#95a5a6',
	},
	formGroup: {
		marginBottom: 20,
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