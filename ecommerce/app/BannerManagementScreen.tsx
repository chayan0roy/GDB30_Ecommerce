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
  ScrollView,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BannerManagementScreen = () => {
  const [banners, setBanners] = useState([]);
  const [banner, setBanner] = useState({
    title: '',
    subtitle: '',
    link: '',
    isActive: true,
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://192.168.0.105:5000/banners/allBanner');
      setBanners(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setBanner({...banner, image: result.assets[0].uri});
    }
  };

  // Add new banner
  const handleAddBanner = async () => {
    try {
      if (!banner.title || !banner.image) {
        Alert.alert('Error', 'Title and image are required');
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append('title', banner.title);
      formData.append('subtitle', banner.subtitle);
      formData.append('link', banner.link);
      formData.append('isActive', banner.isActive.toString());
      formData.append('image', {
        uri: banner.image,
        type: 'image/jpeg',
        name: `banner_${Date.now()}.jpg`
      });

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        'http://192.168.0.105:5000/banners/addBanner',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Success', 'Banner added successfully!');
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Add error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add banner');
    } finally {
      setIsLoading(false);
    }
  };

  // Update banner details (without image)
  const handleUpdateBanner = async () => {
    try {
      if (!banner.title) {
        Alert.alert('Error', 'Title is required');
        return;
      }

      setIsLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `http://192.168.0.105:5000/banners/update/${editingId}`,
        {
          title: banner.title,
          subtitle: banner.subtitle,
          link: banner.link,
          isActive: banner.isActive
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Banner updated successfully!');
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update banner');
    } finally {
      setIsLoading(false);
    }
  };

  // Update banner image only
  const handleUpdateImage = async () => {
    try {
      if (!banner.image || banner.image.startsWith('http')) {
        Alert.alert('Info', 'No new image selected');
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append('image', {
        uri: banner.image,
        type: 'image/jpeg',
        name: `banner_${Date.now()}.jpg`
      });

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `http://192.168.0.105:5000/banners/updateImage/${editingId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Success', 'Image updated successfully!');
      fetchBanners();
    } catch (error) {
      console.error('Image update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update image');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this banner?',
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
                `http://192.168.0.105:5000/banners/${id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              fetchBanners();
              Alert.alert('Success', 'Banner deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete banner');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Edit banner - populate form
  const handleEditBanner = (item) => {
    setBanner({
      title: item.title,
      subtitle: item.subtitle,
      link: item.link,
      isActive: item.isActive,
      image: item.image
    });
    setEditingId(item._id);
    setIsFormVisible(true);
  };

  // Reset form
  const resetForm = () => {
    setBanner({
      title: '',
      subtitle: '',
      link: '',
      isActive: true,
      image: null
    });
    setEditingId(null);
    setIsFormVisible(false);
  };

  // Render banner item
  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerItem}>
      <Image source={{ uri: `http://192.168.0.105:5000/${item.image.replace(/\\/g, '/')}` }} style={styles.bannerImage} />
      <View style={styles.bannerInfo}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <Text style={styles.bannerStatus}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <View style={styles.bannerActions}>
        <TouchableOpacity onPress={() => handleEditBanner(item)}>
          <Ionicons name="pencil" size={24} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBanner(item._id)}>
          <Ionicons name="trash" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Banner Management</Text>

        {isFormVisible ? (
          <View style={styles.formContainer}>
            {/* Image Upload */}
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {banner.image ? (
                <Image source={{ uri: `http://192.168.0.105:5000/${banner.image.replace(/\\/g, '/')}` }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image" size={40} color="#95a5a6" />
                  <Text style={styles.imageText}>Tap to upload banner image</Text>
                  <Text style={styles.imageRatio}>(16:9 aspect ratio)</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Banner Details Form */}
            <TextInput
              style={styles.input}
              placeholder="Title*"
              value={banner.title}
              onChangeText={(text) => setBanner({...banner, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Subtitle"
              value={banner.subtitle}
              onChangeText={(text) => setBanner({...banner, subtitle: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Link URL"
              value={banner.link}
              onChangeText={(text) => setBanner({...banner, link: text})}
              keyboardType="url"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Active Banner</Text>
              <Switch
                value={banner.isActive}
                onValueChange={(value) => setBanner({...banner, isActive: value})}
                trackColor={{ false: "#767577", true: "#27ae60" }}
              />
            </View>

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
                    onPress={handleUpdateBanner}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Update</Text>
                    )}
                  </TouchableOpacity>

                  {banner.image && !banner.image.startsWith('http') && (
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
                  onPress={handleAddBanner}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Add Banner</Text>
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
            <Text style={styles.addButtonText}>Add New Banner</Text>
          </TouchableOpacity>
        )}

        {/* Banners List */}
        <Text style={styles.sectionHeader}>Current Banners ({banners.length})</Text>
        
        {isLoading && banners.length === 0 ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : banners.length === 0 ? (
          <Text style={styles.emptyText}>No banners found</Text>
        ) : (
          <FlatList
            data={banners}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item._id}
            refreshing={isLoading}
            onRefresh={fetchBanners}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={<View style={{ height: 30 }} />}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 30,
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
  bannerItem: {
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
  bannerImage: {
    width: 80,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
    resizeMode: 'cover',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
  },
  bannerSubtitle: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 3,
  },
  bannerStatus: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  listContent: {
    paddingBottom: 10,
  },
});

export default BannerManagementScreen;