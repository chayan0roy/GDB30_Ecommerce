import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	Alert,
	FlatList,
	ActivityIndicator,
	ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CategoryManagementScreen = () => {
	const [categories, setCategories] = useState([]);
	const [category, setCategory] = useState({
		name: '',
		image: null,
	});
	const [editingId, setEditingId] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFormVisible, setIsFormVisible] = useState(false);

	// Fetch all categories
	const fetchCategories = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get('http://192.168.0.105:5000/categories/getAllCategories');

			setCategories(response.data.categories);
		} catch (error) {
			console.error('Fetch error:', error);
			Alert.alert('Error', 'Failed to fetch categories');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	// Image picker
	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setCategory({ ...category, image: result.assets[0].uri });
		}
	};

	// Get file info for upload
	const getFileInfo = async (fileUri) => {
		const fileInfo = await FileSystem.getInfoAsync(fileUri);
		if (!fileInfo.exists) {
			throw new Error('File does not exist');
		}

		let filename = fileUri.split('/').pop();
		let filetype = filename.split('.').pop();

		const mimeTypeMap = {
			jpg: 'image/jpeg',
			jpeg: 'image/jpeg',
			png: 'image/png',
			gif: 'image/gif',
			webp: 'image/webp',
		};

		const mimeType = mimeTypeMap[filetype.toLowerCase()] || 'image/jpeg';

		return {
			uri: fileUri,
			name: filename,
			type: mimeType,
		};
	};

	// Add new category
	const handleAddCategory = async () => {
		try {
			if (!category.name) {
				Alert.alert('Error', 'Category name is required');
				return;
			}

			setIsLoading(true);

			const formData = new FormData();
			formData.append('name', category.name);

			if (category.image) {
				const fileInfo = await getFileInfo(category.image);
				formData.append('image', fileInfo);
			}

			const token = await AsyncStorage.getItem('userToken');
			const response = await axios.post(
				'http://192.168.0.105:5000/categories/createCategory',
				formData,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			Alert.alert('Success', 'Category added successfully!');
			resetForm();
			fetchCategories();
		} catch (error) {
			console.error('Add error:', error);
			Alert.alert('Error', error.response?.data?.message || 'Failed to add category');
		} finally {
			setIsLoading(false);
		}
	};

	// Update category details (without image)
	const handleUpdateCategory = async () => {
		try {
			if (!category.name) {
				Alert.alert('Error', 'Category name is required');
				return;
			}

			setIsLoading(true);

			const token = await AsyncStorage.getItem('userToken');
			const response = await axios.put(
				`http://192.168.0.105:5000/categories/update/${editingId}`,
				{
					name: category.name
				},
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			Alert.alert('Success', 'Category updated successfully!');
			resetForm();
			fetchCategories();
		} catch (error) {
			console.error('Update error:', error);
			Alert.alert('Error', error.response?.data?.message || 'Failed to update category');
		} finally {
			setIsLoading(false);
		}
	};

	// Update category image only
	const handleUpdateImage = async () => {
		try {
			if (!category.image || category.image.startsWith('http')) {
				Alert.alert('Info', 'No new image selected');
				return;
			}

			setIsLoading(true);

			const formData = new FormData();
			const fileInfo = await getFileInfo(category.image);
			formData.append('image', fileInfo);

			const token = await AsyncStorage.getItem('userToken');
			const response = await axios.put(
				`http://192.168.0.105:5000/categories/updateImage/${editingId}`,
				formData,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			Alert.alert('Success', 'Image updated successfully!');
			fetchCategories();
		} catch (error) {
			console.error('Image update error:', error);
			Alert.alert('Error', error.response?.data?.message || 'Failed to update image');
		} finally {
			setIsLoading(false);
		}
	};

	// Delete category
	const handleDeleteCategory = async (id) => {
		Alert.alert(
			'Confirm Delete',
			'Are you sure you want to delete this category?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							setIsLoading(true);
							const token = await AsyncStorage.getItem('userToken');
							await axios.delete(
								`http://192.168.0.105:5000/categories/delete/${id}`,
								{
									headers: {
										'Authorization': `Bearer ${token}`,
									},
								}
							);
							fetchCategories();
							Alert.alert('Success', 'Category deleted successfully');
						} catch (error) {
							console.error('Delete error:', error);
							Alert.alert('Error', 'Failed to delete category');
						} finally {
							setIsLoading(false);
						}
					}
				}
			]
		);
	};

	// Edit category - populate form
	const handleEditCategory = (item) => {
		setCategory({
			name: item.name,
			image: item.image
		});
		setEditingId(item._id);
		setIsFormVisible(true);
	};

	// Reset form
	const resetForm = () => {
		setCategory({
			name: '',
			image: null
		});
		setEditingId(null);
		setIsFormVisible(false);
	};

	// Render category item
	const renderCategoryItem = ({ item }) => (
		<View style={styles.categoryItem}>
			{item.image && (
				<Image
					source={{ uri: `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` }}
					style={styles.categoryImage}
				/>
			)}
			<View style={styles.categoryInfo}>
				<Text style={styles.categoryName}>{item.name}</Text>
			</View>
			<View style={styles.categoryActions}>
				<TouchableOpacity onPress={() => handleEditCategory(item)}>
					<Ionicons name="pencil" size={24} color="#3498db" />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleDeleteCategory(item._id)}>
					<Ionicons name="trash" size={24} color="#e74c3c" />
				</TouchableOpacity>
			</View>
		</View>
	);

	
	return (
		<ScrollView style={styles.container}>
			<Text style={styles.header}>Category Management</Text>

			{isFormVisible ? (
				<View style={styles.formContainer}>
					{/* Image Upload */}
					<TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
						{category.image ? (

							<Image
								source={{ uri: `http://192.168.0.105:5000/${category.image.replace(/\\/g, '/')}` }}
								style={styles.imagePreview}
							/>
						) : (
							<View style={styles.imagePlaceholder}>
								<Ionicons name="image" size={40} color="#95a5a6" />
								<Text style={styles.imageText}>Tap to upload category image</Text>
								<Text style={styles.imageRatio}>(4:3 aspect ratio)</Text>
							</View>
						)}
					</TouchableOpacity>

					{/* Category Details Form */}
					<TextInput
						style={styles.input}
						placeholder="Name*"
						value={category.name}
						onChangeText={(text) => setCategory({ ...category, name: text })}
					/>

					{/* Action Buttons */}
					<View style={styles.buttonGroup}>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={resetForm}
						>
							<Text style={styles.buttonText}>Cancel</Text>
						</TouchableOpacity>

						{editingId ? (
							<>
								<TouchableOpacity
									style={[styles.button, styles.updateButton]}
									onPress={handleUpdateCategory}
									disabled={isLoading}
								>
									{isLoading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.buttonText}>Update</Text>
									)}
								</TouchableOpacity>

								{category.image && !category.image.startsWith('http') && (
									<TouchableOpacity
										style={[styles.button, styles.imageButton]}
										onPress={handleUpdateImage}
										disabled={isLoading}
									>
										{isLoading ? (
											<ActivityIndicator color="#fff" />
										) : (
											<Text style={styles.buttonText}>Update Image</Text>
										)}
									</TouchableOpacity>
								)}
							</>
						) : (
							<TouchableOpacity
								style={[styles.button, styles.submitButton]}
								onPress={handleAddCategory}
								disabled={isLoading}
							>
								{isLoading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.buttonText}>Add Category</Text>
								)}
							</TouchableOpacity>
						)}
					</View>
				</View>
			) : (
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => setIsFormVisible(true)}
				>
					<Ionicons name="add" size={24} color="white" />
					<Text style={styles.addButtonText}>Add New Category</Text>
				</TouchableOpacity>
			)}

			{/* Categories List */}
			<Text style={styles.sectionHeader}>Current Categories ({categories.length})</Text>

			{isLoading && categories.length === 0 ? (
				<ActivityIndicator size="large" style={styles.loader} />
			) : categories.length === 0 ? (
				<Text style={styles.emptyText}>No categories found</Text>
			) : (
				<FlatList
					data={categories}
					renderItem={renderCategoryItem}
					keyExtractor={(item) => item._id}
					refreshing={isLoading}
					onRefresh={fetchCategories}
					scrollEnabled={false}
					contentContainerStyle={styles.listContent}
					ListFooterComponent={<View style={{ height: 30 }} />}
				/>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
		padding: 15,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		color: '#2c3e50',
		textAlign: 'center',
	},
	formContainer: {
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	imageUpload: {
		height: 180,
		backgroundColor: '#f8f9fa',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderStyle: 'dashed',
		overflow: 'hidden',
	},
	imagePreview: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	imagePlaceholder: {
		alignItems: 'center',
		padding: 20,
	},
	imageText: {
		color: '#7f8c8d',
		marginTop: 10,
		textAlign: 'center',
	},
	imageRatio: {
		color: '#bdc3c7',
		fontSize: 12,
		marginTop: 5,
	},
	input: {
		backgroundColor: '#f8f9fa',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
		fontSize: 16,
		height: 50,
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		paddingHorizontal: 5,
	},
	switchLabel: {
		fontSize: 16,
		color: '#2c3e50',
	},
	buttonGroup: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
		gap: 10,
	},
	button: {
		flex: 1,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 50,
	},
	cancelButton: {
		backgroundColor: '#e0e0e0',
	},
	submitButton: {
		backgroundColor: '#27ae60',
	},
	updateButton: {
		backgroundColor: '#3498db',
	},
	imageButton: {
		backgroundColor: '#9b59b6',
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
	addButton: {
		flexDirection: 'row',
		backgroundColor: '#3498db',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	addButtonText: {
		color: 'white',
		fontWeight: 'bold',
		marginLeft: 10,
		fontSize: 16,
	},
	sectionHeader: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		color: '#2c3e50',
	},
	emptyText: {
		textAlign: 'center',
		color: '#7f8c8d',
		marginTop: 20,
		fontSize: 16,
		marginBottom: 20,
	},
	loader: {
		marginTop: 40,
		marginBottom: 40,
	},
	categoryItem: {
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 15,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	categoryImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginRight: 15,
		resizeMode: 'cover',
	},
	categoryInfo: {
		flex: 1,
	},
	categoryName: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 3,
	},
	categoryStatus: {
		fontSize: 12,
		color: '#7f8c8d',
	},
	categoryActions: {
		flexDirection: 'row',
		gap: 15,
	},
	listContent: {
		paddingBottom: 10,
	},
});

export default CategoryManagementScreen;