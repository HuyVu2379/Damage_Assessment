import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking
} from 'react-native';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

// Tắt logs để giảm lag terminal
const log = __DEV__ ? () => {} : () => {};

const ProductSuggestions = memo(({ products }) => {
    // Tắt logs để giảm lag terminal
    
    if (!products || products.length === 0) {
        return null;
    }

    const handleProductPress = useCallback((url) => {
        try {
            if (url && url !== '#') {
                Linking.openURL(url).catch(() => {
                    // Loại bỏ log để giảm lag
                });
            }
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
        }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📦 Sản phẩm được đề xuất</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                {products.map((product, index) => {
                    if (!product) return null;

                    return (
                        <TouchableOpacity
                            key={`product-${index}-${product.name || 'unknown'}`}
                            style={styles.productCard}
                            onPress={() => handleProductPress(product.purchaseLink)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: product.imageUrl }}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                    onError={() => {
                                        // Tắt log để giảm lag terminal
                                    }}
                                />
                            </View>

                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>
                                    {product.name}
                                </Text>

                                <Text style={styles.productBrand} numberOfLines={1}>
                                    {product.brand}
                                </Text>

                                <Text style={styles.productDescription} numberOfLines={3}>
                                    {product.description}
                                </Text>

                                <Text style={styles.productPrice}>
                                    {product.estimatedPrice}
                                </Text>

                                <View style={styles.categoryContainer}>
                                    <Text style={styles.categoryText}>
                                        {product.category}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(10),
        paddingVertical: verticalScale(5),
        backgroundColor: 'transparent',
        borderRadius: moderateScale(8),
        maxWidth: '100%',
    },
    title: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(10),
        paddingHorizontal: scale(5),
    },
    scrollContent: {
        paddingHorizontal: scale(5),
    },
    productCard: {
        width: scale(180),
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        marginRight: scale(10),
        padding: scale(10),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imageContainer: {
        width: '100%',
        height: verticalScale(120),
        backgroundColor: '#f8f8f8',
        borderRadius: moderateScale(8),
        marginBottom: verticalScale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '90%',
        height: '90%',
        borderRadius: moderateScale(6),
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(4),
        lineHeight: moderateScale(18),
    },
    productBrand: {
        fontSize: moderateScale(12),
        color: '#666',
        marginBottom: verticalScale(4),
        fontStyle: 'italic',
    },
    productDescription: {
        fontSize: moderateScale(11),
        color: '#555',
        marginBottom: verticalScale(6),
        lineHeight: moderateScale(14),
    },
    productPrice: {
        fontSize: moderateScale(13),
        fontWeight: 'bold',
        color: '#e74c3c',
        marginBottom: verticalScale(6),
    },
    categoryContainer: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: scale(6),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(4),
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: moderateScale(10),
        color: '#1976d2',
        fontWeight: '500',
    },
});

export default ProductSuggestions;
