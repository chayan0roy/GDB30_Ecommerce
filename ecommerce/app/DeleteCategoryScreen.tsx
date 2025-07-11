import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeleteCategoryScreen() {
  const [category] = useState({
    id: '1',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'
  });

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the "${category.name}" category? All products in this category will be affected.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Category deleted:', category.id);
            // Here you would typically call your API to delete the category
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delete Category</Text>
      
      <View style={styles.categoryContainer}>
        <Image source={{ uri: category.image }} style={styles.categoryImage} />
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>

      <Text style={styles.warningText}>
        Warning: Deleting this category will affect all products under it. This action cannot be undone.
      </Text>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Category</Text>
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
  categoryContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 10,
  },
  categoryImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
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