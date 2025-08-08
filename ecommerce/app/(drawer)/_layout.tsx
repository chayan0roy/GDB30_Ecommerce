import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserProfile {
    username: string;
    email: string;
    image?: string;
    role: 'admin' | 'user';
}

export default function DrawerLayout() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                router.replace('/Login');
                return;
            }

            try {
                const response = await axios.get('http://192.168.0.105:5000/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setUserProfile(response.data);
            } catch (e) {
                Alert.alert('Error', 'Unable to verify login');
                router.replace('/Login');
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        router.replace('/Login');
    };


    const handleImageUpload = async () => {
        // Request permission to access the media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Please allow access to your photo library to upload images');
            return;
        }

        // Launch the image picker
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (pickerResult.canceled) {
            return;
        }

        if (pickerResult.assets && pickerResult.assets.length > 0) {
            const selectedImage = pickerResult.assets[0];
            // Extract the filename and type from the URI
            const fileName = selectedImage.uri.split('/').pop();
            const fileType = `image/${selectedImage.uri.split('.').pop()}`;

            await uploadImage(selectedImage.uri, fileName, fileType);
        }
    };

    const uploadImage = async (uri: string, fileName: string, fileType: string) => {
        setUploading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.replace('/Login');
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append('image', {
                uri,
                name: fileName,
                type: fileType,
            } as any);

            // Make the API call
            const response = await axios.post('http://youtIp/user/upload-profile-picture', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUserProfile(response.data.user);

        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const CustomDrawerContent = (props: any) => {
        // Filter drawer items based on user role
        const filteredProps = {
            ...props,
            state: {
                ...props.state,
                routes: props.state.routes.filter(route => {
                    if (['BannerManagementScreen', 'CategoryManagementScreen', 'ProductManagementScreen'].includes(route.name)) {
                        return userProfile?.role === 'admin';
                    }
                    // Show other screens
                    return true;
                })
            }
        };

        return (
            <DrawerContentScrollView {...filteredProps} contentContainerStyle={{ flex: 1 }}>
                {userProfile && (
                    <View style={styles.profileContainer}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: userProfile?.image ? `http://youtIp/${userProfile.image}` : 'https://randomuser.me/api/portraits/men/75.jpg' }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handleImageUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Feather name="camera" size={18} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.profileName}>{userProfile.username}</Text>
                        <Text style={styles.profileEmail}>{userProfile.email}</Text>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <DrawerItemList {...filteredProps} />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Feather name="log-out" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6200EE" />
            </View>
        );
    }

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerTintColor: '#000',
                drawerActiveTintColor: '#6200EE',
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    title: 'Home',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="BannerManagementScreen"
                options={{
                    title: 'Banner Management',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="image" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="CategoryManagementScreen"
                options={{
                    title: 'Category Management',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="category" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="ProductManagementScreen"
                options={{
                    title: 'Product Management',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="inventory" size={size} color={color} />
                    ),
                }}
            />

        </Drawer>
    );
}

const styles = StyleSheet.create({
    profileContainer: {
        padding: 20,
        backgroundColor: '#6200EE',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginBottom: 30,
        position: 'relative',
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
        borderColor: '#fff',
        borderWidth: 2,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 15,
        right: 0,
        backgroundColor: '#6200EE',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    profileEmail: {
        color: '#ddd',
        fontSize: 14,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d32f2f',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    logoutText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
});