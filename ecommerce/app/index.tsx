import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import HomeScreen from './HomeScreen'

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <HomeScreen/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})