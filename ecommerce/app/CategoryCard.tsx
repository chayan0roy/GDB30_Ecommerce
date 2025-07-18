import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


interface CategoryCardProps {
  image: any;
  title: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ image, title }) => (
  <TouchableOpacity style={styles.card}>
    <Image source={image} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
  </TouchableOpacity>
);

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#555',
  },
});
