import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function DeleteProductScreen() {
  const [product] = useState({
    id: '1',
    name: 'Premium Smartphone X200',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=60',
    price: '$599',
    category: 'Electronics'
  });

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Product deleted:', product.id);
            // Here you would typically call your API to delete the product
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delete Product</Text>
      
      <View style={styles.productContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
      </View>

      <Text style={styles.warningText}>
        Warning: Deleting this product will remove it permanently from your inventory. This action cannot be undone.
      </Text>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Product</Text>
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
  productContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 10,
  },
  productImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    borderRadius: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});