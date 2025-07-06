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

    const handleProductPress = useCallback(async (url, productName) => {
        try {
            if (url && url !== '#') {
                log(`🔗 Opening product link: ${productName}`);
                log(`🔗 URL: ${url}`);
                
                // Xử lý các loại link khác nhau
                const urlLower = url.toLowerCase();
                
                // Kiểm tra xem có phải link shop app không
                const isShopApp = urlLower.includes('shopee.vn') || 
                                urlLower.includes('lazada.vn') || 
                                urlLower.includes('tiki.vn') || 
                                urlLower.includes('sendo.vn');
                
                // Kiểm tra xem có phải Google Shopping không
                const isGoogleShopping = urlLower.includes('google.com/shopping');
                
                // Ưu tiên 1: Thử mở link trực tiếp (shop app hoặc browser)
                try {
                    const canOpen = await Linking.canOpenURL(url);
                    if (canOpen) {
                        await Linking.openURL(url);
                        log(`✅ Successfully opened link for: ${productName}`);
                        
                        if (__DEV__) {
                            if (isShopApp) {
                                console.log(`🛒 Opened shop app for: ${productName}`);
                            } else if (isGoogleShopping) {
                                console.log(`🛍️ Opened Google Shopping for: ${productName}`);
                            } else {
                                console.log(`🌐 Opened browser for: ${productName}`);
                            }
                        }
                        return; // Thành công, không cần fallback
                    }
                } catch (directLinkError) {
                    log(`⚠️ Direct link failed: ${directLinkError.message}`);
                }
                
                // Ưu tiên 2: Nếu là link shop app, thử mở trong browser
                if (isShopApp) {
                    try {
                        const browserUrl = url.startsWith('http') ? url : `https://${url}`;
                        const canOpenBrowser = await Linking.canOpenURL(browserUrl);
                        if (canOpenBrowser) {
                            await Linking.openURL(browserUrl);
                            log(`✅ Opened shop in browser for: ${productName}`);
                            return;
                        }
                    } catch (browserError) {
                        log(`⚠️ Browser fallback failed: ${browserError.message}`);
                    }
                }
                
                // Ưu tiên 3: Nếu là Google Shopping, thử extract product ID và mở
                if (isGoogleShopping) {
                    try {
                        // Thử mở link Google Shopping trực tiếp
                        await Linking.openURL(url);
                        log(`✅ Opened Google Shopping for: ${productName}`);
                        return;
                    } catch (googleError) {
                        log(`⚠️ Google Shopping failed: ${googleError.message}`);
                    }
                }
            }
            
            // Fallback cuối cùng: Google search
            log(`🔍 Using Google search fallback for: ${productName}`);
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(productName + ' mua')}`;
            
            try {
                await Linking.openURL(searchUrl);
                log(`✅ Opened Google search for: ${productName}`);
            } catch (searchError) {
                log(`❌ Even Google search failed: ${searchError.message}`);
                // Thông báo cho user nếu cần
                if (__DEV__) {
                    console.error(`Failed to open any link for ${productName}`);
                }
            }
            
        } catch (error) {
            log(`❌ Error in handleProductPress for ${productName}:`, error.message);
        }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛍️ Sản phẩm được đề xuất</Text>
            <Text style={styles.subtitle}>Bấm để mở trang mua hàng hoặc tìm kiếm sản phẩm</Text>
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
                            onPress={() => handleProductPress(product.purchaseLink, product.name)}
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

                                {/* Hiển thị thông tin từ SerpAPI */}
                                {product.rating && (
                                    <View style={styles.ratingContainer}>
                                        <Text style={styles.ratingText}>
                                            ⭐ {product.rating}
                                        </Text>
                                        {product.reviews && (
                                            <Text style={styles.reviewsText}>
                                                ({product.reviews} đánh giá)
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {product.source && (
                                    <Text style={styles.sourceText}>
                                        Từ: {product.source}
                                    </Text>
                                )}

                                <View style={styles.categoryContainer}>
                                    <Text style={styles.categoryText}>
                                        {product.category}
                                    </Text>
                                </View>
                                
                                {/* Click indicator */}
                                <View style={styles.clickIndicator}>
                                    <Text style={styles.clickText}>
                                        👆 Bấm để mua ngay
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
        color: '#2E7D32',
        marginBottom: verticalScale(4),
        paddingHorizontal: scale(5),
    },
    subtitle: {
        fontSize: moderateScale(12),
        color: '#666',
        marginBottom: verticalScale(8),
        paddingHorizontal: scale(5),
        fontStyle: 'italic',
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
        borderWidth: 1,
        borderColor: '#f0f0f0',
        // Thêm hiệu ứng hover/press
        transform: [{ scale: 1 }],
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    ratingText: {
        fontSize: moderateScale(12),
        color: '#f39c12',
        marginRight: scale(4),
    },
    reviewsText: {
        fontSize: moderateScale(12),
        color: '#666',
    },
    sourceText: {
        fontSize: moderateScale(11),
        color: '#007bff',
        marginBottom: verticalScale(6),
        fontStyle: 'italic',
    },
    categoryContainer: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: scale(6),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(4),
        alignSelf: 'flex-start',
        marginBottom: verticalScale(4),
    },
    categoryText: {
        fontSize: moderateScale(10),
        color: '#1976d2',
        fontWeight: '500',
    },
    clickIndicator: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(6),
        alignItems: 'center',
        marginTop: verticalScale(4),
        borderWidth: 1,
        borderColor: '#4caf50',
    },
    clickText: {
        fontSize: moderateScale(9),
        color: '#2e7d32',
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ProductSuggestions;
