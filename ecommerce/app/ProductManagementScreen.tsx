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
import { Dropdown } from 'react-native-element-dropdown';

const ProductManagementScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    tags: '',
    discount: '',
    category: '',
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://192.168.0.105:5000/products/allProduct');
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://192.168.0.105:5000/categories/getAllCategories');
      if (response.data.success) {
        const formattedCategories = response.data.categories.map(cat => ({
          label: cat.name,
          value: cat._id
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
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
      setProduct({ ...product, image: result.assets[0].uri });
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

  // Add new product
  const handleAddProduct = async () => {
    try {
      if (!product.name || !product.price || !product.category) {
        Alert.alert('Error', 'Name, price and category are required');
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('price', product.price);
      formData.append('description', product.description);
      formData.append('quantity', product.quantity);
      formData.append('tags', product.tags);
      formData.append('discount', product.discount);
      formData.append('categorie', product.category);

      if (product.image) {
        const fileInfo = await getFileInfo(product.image);
        formData.append('image', fileInfo);
      }

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        'http://192.168.0.105:5000/products/addProduct',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Success', 'Product added successfully!');
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Add error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    try {
      if (!product.name || !product.price || !product.category) {
        Alert.alert('Error', 'Name, price and category are required');
        return;
      }

      setIsLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `http://192.168.0.105:5000/products/${editingId}`,
        {
          name: product.name,
          price: product.price,
          description: product.description,
          quantity: product.quantity,
          tags: product.tags,
          discount: product.discount,
          categorie: product.category,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Product updated successfully!');
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  // Update product image only
  const handleUpdateImage = async () => {
    try {
      if (!product.image || product.image.startsWith('http')) {
        Alert.alert('Info', 'No new image selected');
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      const fileInfo = await getFileInfo(product.image);
      formData.append('image', fileInfo);

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `http://192.168.0.105:5000/products/${editingId}/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Success', 'Image updated successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Image update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update image');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
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
                `http://192.168.0.105:5000/products/${id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              fetchProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Edit product - populate form
  const handleEditProduct = (item) => {
    setProduct({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      quantity: item.quantity.toString(),
      tags: item.tags,
      discount: item.discount.toString(),
      category: item.categorie?._id || '',
      image: item.image ? `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` : null
    });
    setEditingId(item._id);
    setIsFormVisible(true);
  };

  // Reset form
  const resetForm = () => {
    setProduct({
      name: '',
      price: '',
      description: '',
      quantity: '',
      tags: '',
      discount: '',
      category: '',
      image: null
    });
    setEditingId(null);
    setIsFormVisible(false);
  };

  // Render product item
  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      {item.image && (
        <Image
          source={{ uri: `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` }}
          style={styles.productImage}
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.productCategory}>{item.categorie?.name}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity onPress={() => handleEditProduct(item)}>
          <Ionicons name="pencil" size={24} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteProduct(item._id)}>
          <Ionicons name="trash" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Product Management</Text>

      {isFormVisible ? (
        <View style={styles.formContainer}>
          {/* Image Upload */}
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {product.image ? (
              <Image
                source={{ uri: product.image.startsWith('http') ? product.image : product.image }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image" size={40} color="#95a5a6" />
                <Text style={styles.imageText}>Tap to upload product image</Text>
                <Text style={styles.imageRatio}>(4:3 aspect ratio)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Product Details Form */}
          <TextInput
            style={styles.input}
            placeholder="Name*"
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Price*"
            value={product.price}
            onChangeText={(text) => setProduct({ ...product, price: text })}
            keyboardType="numeric"
          />

          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={categories}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select category*' : '...'}
            searchPlaceholder="Search..."
            value={product.category}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setProduct({ ...product, category: item.value });
              setIsFocus(false);
            }}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={product.description}
            onChangeText={(text) => setProduct({ ...product, description: text })}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={product.quantity}
            onChangeText={(text) => setProduct({ ...product, quantity: text })}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Tags (comma separated)"
            value={product.tags}
            onChangeText={(text) => setProduct({ ...product, tags: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Discount (%)"
            value={product.discount}
            onChangeText={(text) => setProduct({ ...product, discount: text })}
            keyboardType="numeric"
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
                  onPress={handleUpdateProduct}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Update</Text>
                  )}
                </TouchableOpacity>

                {product.image && !product.image.startsWith('http') && (
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
                onPress={handleAddProduct}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Add Product</Text>
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
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>
      )}

      {/* Products List */}
      <Text style={styles.sectionHeader}>Current Products ({products.length})</Text>

      {isLoading && products.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>No products found</Text>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          refreshing={isLoading}
          onRefresh={fetchProducts}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#95a5a6',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
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
  productItem: {
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
  },
  productPrice: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  productActions: {
    flexDirection: 'row',
    gap: 15,
  },
  listContent: {
    paddingBottom: 10,
  },
});

export default ProductManagementScreen;