import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function UpdateBannerScreen() {
  const [banner, setBanner] = useState({
    id: '1',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off on selected items',
    link: 'https://example.com/summer-sale',
    isActive: true
  });

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

  const handleUpdateBanner = () => {
    console.log('Banner updated:', banner);
    // Here you would typically send the updated banner to your backend
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Banner</Text>
      
      {/* Image Upload */}
      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        <Image source={{ uri: banner.image }} style={styles.imagePreview} />
        <View style={styles.imageOverlay}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.imageText}>Change Image</Text>
        </View>
      </TouchableOpacity>

      {/* Banner Details */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={banner.title}
          onChangeText={(text) => setBanner({...banner, title: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Subtitle</Text>
        <TextInput
          style={styles.input}
          value={banner.subtitle}
          onChangeText={(text) => setBanner({...banner, subtitle: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Link URL</Text>
        <TextInput
          style={styles.input}
          value={banner.link}
          onChangeText={(text) => setBanner({...banner, link: text})}
          keyboardType="url"
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Active Banner</Text>
        <Switch
          value={banner.isActive}
          onValueChange={(value) => setBanner({...banner, isActive: value})}
          trackColor={{ false: "#767577", true: "#27ae60" }}
          thumbColor={banner.isActive ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateBanner}>
        <Text style={styles.updateButtonText}>Update Banner</Text>
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