import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface BookCardProps {
  image: any;
  title: string;
  author: string;
  price: string;
  badge?: string;
}

const BookCard: React.FC<BookCardProps> = ({ image, title, author, price, badge }) => (
  <View style={styles.card}>
    {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
    <Image source={image} style={styles.image} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.author}>{author}</Text>
    <Text style={styles.price}>{price}</Text>
    <TouchableOpacity style={styles.addButton}>
      <Ionicons name="bookmark-outline" size={20} color="#007aff" />
      <Text style={styles.addText}> Add to saved</Text>
    </TouchableOpacity>
  </View>
);

export default BookCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    width: 150,
  },
  image: {
    width: 80,
    height: 110,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  author: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: '#007aff',
    fontWeight: '700',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    fontSize: 12,
    color: '#007aff',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6767',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
  },
});
