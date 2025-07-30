import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
	return (
		<Tabs  screenOptions={{headerShown: false}}>
			<Tabs.Screen
				name="HomeScreen"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home-outline" size={24} color="black" />

					),
				}}
			/>
			<Tabs.Screen
				name="CartScreen"
				options={{
					title: "Cart",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="cart" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="WatchlistScreen"
				options={{
					title: "Watchlist",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="heart-outline" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}