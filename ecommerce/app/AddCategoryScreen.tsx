import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default function AddCategoryScreen() {
	 const [category, setCategory] = useState({
    image: null,
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setCategory({ ...category, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getFileInfo = async (fileUri) => {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    let filename = fileUri.split('/').pop();
    let filetype = filename.split('.').pop();
    
    // Map file extension to MIME type
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

  const handleAddCategory = async () => {
    if (!category.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');	  
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('name', category.name);

      if (category.image) {
        const fileInfo = await getFileInfo(category.image);
        formData.append('image', fileInfo);
      }

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

      Alert.alert('Success', 'Category created successfully');
      setCategory({ image: null, name: '' });
    } catch (error) {
      console.error('Category creation failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create category';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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