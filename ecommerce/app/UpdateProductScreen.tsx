import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UpdateProductScreen() {
  const [product, setProduct] = useState({
    id: '1',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=60',
    name: 'Premium Smartphone X200',
    price: '599',
    category: 'Electronics',
    description: 'The Premium Smartphone X200 features a 6.7" AMOLED display, 128GB storage, 8GB RAM, and a triple camera system with 108MP main sensor.',
    quantity: '50',
    tags: 'smartphone,electronics,premium',
    discount: '14'
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProduct({...product, image: result.assets[0].uri});
    }
  };

  const handleUpdateProduct = () => {
    console.log('Product updated:', product);
    // Here you would typically send the updated product to your backend
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Update Product</Text>
      
      {/* Image Upload */}
      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        <Image source={{ uri: product.image }} style={styles.imagePreview} />
        <View style={styles.imageOverlay}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.imageText}>Change Image</Text>
        </View>
      </TouchableOpacity>

      {/* Product Details Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={product.name}
          onChangeText={(text) => setProduct({...product, name: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Price ($)</Text>
        <TextInput
          style={styles.input}
          value={product.price}
          onChangeText={(text) => setProduct({...product, price: text})}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={product.category}
          onChangeText={(text) => setProduct({...product, category: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={product.description}
          onChangeText={(text) => setProduct({...product, description: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={product.quantity}
          onChangeText={(text) => setProduct({...product, quantity: text})}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={product.tags}
          onChangeText={(text) => setProduct({...product, tags: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Discount (%)</Text>
        <TextInput
          style={styles.input}
          value={product.discount}
          onChangeText={(text) => setProduct({...product, discount: text})}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProduct}>
        <Text style={styles.updateButtonText}>Update Product</Text>
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