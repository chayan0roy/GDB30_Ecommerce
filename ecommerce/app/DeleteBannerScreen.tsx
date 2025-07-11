import { useState } from 'react';
import { Alert, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DeleteBannerScreen() {
  const [banner, setBanner] = useState({
    id: '1',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    title: 'Summer Sale',
    isActive: true
  });

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the "${banner.title}" banner?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Banner deleted:', banner.id);
            // Here you would typically call your API to delete the banner
          },
        },
      ]
    );
  };

  const toggleActive = () => {
    setBanner({...banner, isActive: !banner.isActive});
    console.log('Banner active status:', !banner.isActive);
    // Here you would typically update the active status in your backend
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Banner</Text>
      
      <View style={styles.bannerContainer}>
        <Image source={{ uri: banner.image }} style={styles.bannerImage} />
        <Text style={styles.bannerTitle}>{banner.title}</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Active Status</Text>
          <Switch
            value={banner.isActive}
            onValueChange={toggleActive}
            trackColor={{ false: "#767577", true: "#27ae60" }}
            thumbColor={banner.isActive ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      <Text style={styles.warningText}>
        {banner.isActive 
          ? 'This banner is currently visible to users.' 
          : 'This banner is currently hidden from users.'}
      </Text>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Banner</Text>
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
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 10,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    marginBottom: 15,
    borderRadius: 5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  warningText: {
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