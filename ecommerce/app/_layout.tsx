import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
	return (
		<Drawer>
			<Drawer.Screen
				name="(tabs)"
				options={{
					drawerLabel: "Home",
					title: "Home",
				}}
			/>
			<Drawer.Screen
				name="LoginScreen"
				options={{
					drawerLabel: "Login",
					title: "Login",
				}}
			/>
			<Drawer.Screen
				name="RegisterScreen"
				options={{
					drawerLabel: "Register",
					title: "Register",
				}}
			/>
			<Drawer.Screen
				name="BannerManagementScreen"
				options={{
					drawerLabel: "Banner Management",
					title: "Banner Management",
				}}
			/>
			<Drawer.Screen
				name="CategoryManagementScreen"
				options={{
					drawerLabel: "Category Management",
					title: "Category Management",
				}}
			/>
			<Drawer.Screen
				name="ProductManagementScreen"
				options={{
					drawerLabel: "Product Management",
					title: "Product Management",
				}}
			/>
		</Drawer>
	);
}