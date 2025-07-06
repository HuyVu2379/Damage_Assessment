import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from '../utils/scaling';

const ProductLoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#007bff" />
      <Text style={styles.text}>Đang tìm kiếm sản phẩm...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(15),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(5),
  },
  text: {
    marginLeft: moderateScale(8),
    fontSize: moderateScale(14),
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ProductLoadingIndicator;
