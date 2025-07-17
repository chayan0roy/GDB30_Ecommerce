import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UpdateCategoryScreen() {
  const [category, setCategory] = useState({
    id: '1',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
    name: 'Electronics'
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCategory({...category, image: result.assets[0].uri});
    }
  };

  const handleUpdateCategory = () => {
    console.log('Category updated:', category);
    // Here you would typically send the updated category to your backend
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Category</Text>
      
      {/* Image Upload */}
      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        <Image source={{ uri: category.image }} style={styles.imagePreview} />
        <View style={styles.imageOverlay}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.imageText}>Change Image</Text>
        </View>
      </TouchableOpacity>

      {/* Category Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={styles.input}
          value={category.name}
          onChangeText={(text) => setCategory({...category, name: text})}
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateCategory}>
        <Text style={styles.updateButtonText}>Update Category</Text>
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
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: '#fff',
    marginLeft: 10,
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
  updateButton: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});