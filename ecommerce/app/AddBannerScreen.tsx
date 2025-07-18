import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

export default function AddBannerScreen() {
  const [banner, setBanner] = useState({
    image: null,
    title: '',
    subtitle: '',
    link: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setBanner({...banner, image: result.assets[0].uri});
    }
  };

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

      if (banner.image) {
        formData.append('image', {
          uri: banner.image,
          type: 'image/jpeg',
          name: `banner_${Date.now()}.jpg`
        });
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('http://192.168.0.105:5000/banners/addBanner', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Banner added successfully!');
        // Reset form
        setBanner({
          image: null,
          title: '',
          subtitle: '',
          link: '',
          isActive: true
        });
      } else {
        throw new Error('Failed to add banner');
      }
    } catch (error) {
      console.error('Banner addition failed:', error);
      Alert.alert('Error', error.message || 'Failed to add banner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Banner</Text>
      
      {/* Image Upload */}
      <TouchableOpacity 
        style={styles.imageUpload} 
        onPress={pickImage}
        disabled={isLoading}
      >
        {banner.image ? (
          <Image source={{ uri: banner.image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color="#95a5a6" />
            <Text style={styles.imageText}>Upload Banner Image (16:9 ratio)</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Banner Details */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title*</Text>
        <TextInput
          style={styles.input}
          value={banner.title}
          onChangeText={(text) => setBanner({...banner, title: text})}
          placeholder="Enter banner title"
          editable={!isLoading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Subtitle</Text>
        <TextInput
          style={styles.input}
          value={banner.subtitle}
          onChangeText={(text) => setBanner({...banner, subtitle: text})}
          placeholder="Enter banner subtitle"
          editable={!isLoading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Link URL</Text>
        <TextInput
          style={styles.input}
          value={banner.link}
          onChangeText={(text) => setBanner({...banner, link: text})}
          placeholder="Enter link URL"
          keyboardType="url"
          editable={!isLoading}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Active Banner</Text>
        <Switch
          value={banner.isActive}
          onValueChange={(value) => setBanner({...banner, isActive: value})}
          trackColor={{ false: "#767577", true: "#27ae60" }}
          thumbColor={banner.isActive ? "#f4f3f4" : "#f4f3f4"}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.addButton, isLoading && styles.disabledButton]} 
        onPress={handleAddBanner}
        disabled={isLoading}
      >
        <Text style={styles.addButtonText}>
          {isLoading ? 'Adding...' : 'Add Banner'}
        </Text>
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
    textAlign: 'center',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});