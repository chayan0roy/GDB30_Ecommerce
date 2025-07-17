import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AddProductScreen from './Register'
import AsyncStorage from '@react-native-async-storage/async-storage';

const index = () => {
  return (
    <View style={{flex:1}}>
      <AddProductScreen/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})