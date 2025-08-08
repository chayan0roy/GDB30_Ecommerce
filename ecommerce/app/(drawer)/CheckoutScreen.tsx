import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';


export default function CheckoutScreen() {
  const isFocused = useIsFocused();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Fetch cart data from API
  useEffect(() => {
    if (isFocused) {
      const fetchCartData = async () => {
        try {
          setLoading(true);
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            setLoading(false);
            return;
          }

          const response = await axios.get('http://192.168.0.105:5000/cart/getCart', {
            headers: { Authorization: `Bearer ${token}` }
          });

          setCartItems(response.data.items || []);
        } catch (err) {
          setError(err.message);
          console.error('Failed to fetch cart:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchCartData();
    }

  }, [isFocused]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = 5.99;
    const tax = subtotal * 0.1;
    return (subtotal + shipping + tax).toFixed(2);
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Login Required', 'Please login to complete your order');
        return;
      }

      // In a real app, you would process the payment here
      // For now, we'll just show a success message
      Alert.alert('Success', 'Order placed successfully!');

      // You might want to clear the cart after successful order
      // await axios.post('http://192.168.0.105:5000/order/create', orderData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

    } catch (err) {
      Alert.alert('Error', 'Failed to place order');
      console.error('Order submission error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Checkout</Text>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="John Doe"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              placeholder="123 Main St"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                placeholder="New York"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => handleInputChange('zipCode', text)}
                placeholder="10001"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => handleInputChange('country', text)}
              placeholder="United States"
            />
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionSelected
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#e74c3c"
            />
            <Text style={styles.paymentText}>Credit/Debit Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'paypal' && styles.paymentOptionSelected
            ]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <Ionicons
              name={paymentMethod === 'paypal' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#e74c3c"
            />
            <Text style={styles.paymentText}>PayPal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentOptionSelected
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Ionicons
              name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color="#e74c3c"
            />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </TouchableOpacity>

          {paymentMethod === 'card' && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cardNumber}
                  onChangeText={(text) => handleInputChange('cardNumber', text)}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiryDate}
                    onChangeText={(text) => handleInputChange('expiryDate', text)}
                    placeholder="MM/YY"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.cvv}
                    onChangeText={(text) => handleInputChange('cvv', text)}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {cartItems.map(item => (
            <View key={item.product._id} style={styles.orderItem}>
              <Image
                source={{ uri: `http://192.168.0.105:5000/${item.product.image.replace(/\\/g, '/')}` }}
                style={styles.orderImage}
              />
              <View style={styles.orderDetails}>
                <Text style={styles.orderName}>{item.product.name}</Text>
                <Text style={styles.orderPrice}>${item.price.toFixed(2)} × {item.quantity}</Text>
              </View>
              <Text style={styles.orderTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ${calculateSubtotal().toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>$5.99</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              ${(calculateSubtotal() * 0.1).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${calculateTotal()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <TouchableOpacity
        style={styles.placeOrderButton}
        onPress={handleSubmit}
        disabled={cartItems.length === 0}
      >
        <Text style={styles.placeOrderText}>
          {cartItems.length > 0 ? `Place Order - $${calculateTotal()}` : 'Cart is Empty'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  paymentOptionSelected: {
    backgroundColor: '#fef5f5',
  },
  paymentText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
  },
  orderName: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '700',
  },
  placeOrderButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center'
  },
  retryText: {
    color: '#3498db',
    fontWeight: 'bold'
  },
});