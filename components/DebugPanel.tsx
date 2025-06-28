import { colors } from '@/assets/styles/colors';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { useRestaurantStore } from '@/zustand/RestaurantStore';
import { useUserStore } from '@/zustand/UserStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

// Only show in development mode
const isDev = __DEV__;

interface DebugPanelProps {
	visible?: boolean;
}

export default function DebugPanel({ visible = isDev }: DebugPanelProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [expanded, setExpanded] = useState({
		user: false,
		cuisines: false,
		restaurants: false,
		network: false,
	});

	// Store states
	const userStore = useUserStore();
	const cuisineStore = useCuisineStore();
	const restaurantStore = useRestaurantStore();

	if (!visible) return null;

	const toggleSection = (section: keyof typeof expanded) => {
		setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const clearAllCaches = () => {
		cuisineStore.clearCuisines();
		restaurantStore.clearCache();
		console.log('Debug: All caches cleared');
	};

	const testNetworkConnection = async () => {
		try {
			const response = await fetch('https://httpbin.org/json');
			const data = await response.json();
			console.log('Debug: Network test successful:', data);
		} catch (error) {
			console.error('Debug: Network test failed:', error);
		}
	};

	const formatCacheSize = (cache: Map<any, any>): string => {
		return `${cache.size} entries`;
	};

	const formatTimestamp = (timestamp: number | null): string => {
		if (!timestamp) return 'Never';
		return new Date(timestamp).toLocaleTimeString();
	};

	return (
		<>
			{/* Debug Button */}
			<TouchableOpacity
				style={styles.debugButton}
				onPress={() => setIsVisible(true)}
			>
				<Ionicons name="bug-outline" size={24} color={colors.quaternary} />
			</TouchableOpacity>

			{/* Debug Modal */}
			<Modal
				visible={isVisible}
				animationType="slide"
				presentationStyle="pageSheet"
			>
				<View style={styles.modalContainer}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.headerTitle}>Debug Panel</Text>
						<TouchableOpacity
							onPress={() => setIsVisible(false)}
							style={styles.closeButton}
						>
							<Ionicons name="close" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.content}>
						{/* Quick Actions */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Quick Actions</Text>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={clearAllCaches}
							>
								<Text style={styles.actionButtonText}>Clear All Caches</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={testNetworkConnection}
							>
								<Text style={styles.actionButtonText}>Test Network</Text>
							</TouchableOpacity>
						</View>

						{/* User Store */}
						<View style={styles.section}>
							<TouchableOpacity
								style={styles.sectionHeader}
								onPress={() => toggleSection('user')}
							>
								<Text style={styles.sectionTitle}>User Store</Text>
								<Ionicons
									name={expanded.user ? 'chevron-up' : 'chevron-down'}
									size={20}
									color={colors.primary}
								/>
							</TouchableOpacity>
							{expanded.user && (
								<View style={styles.sectionContent}>
									<Text style={styles.debugText}>
										Authenticated: {userStore.isAuthenticated ? 'Yes' : 'No'}
									</Text>
									<Text style={styles.debugText}>
										Loading: {userStore.isLoading ? 'Yes' : 'No'}
									</Text>
									<Text style={styles.debugText}>
										User ID: {userStore.user.id || 'None'}
									</Text>
									<Text style={styles.debugText}>
										Language: {userStore.user.language}
									</Text>
									<Text style={styles.debugText}>
										Error: {userStore.error || 'None'}
									</Text>
								</View>
							)}
						</View>

						{/* Cuisine Store */}
						<View style={styles.section}>
							<TouchableOpacity
								style={styles.sectionHeader}
								onPress={() => toggleSection('cuisines')}
							>
								<Text style={styles.sectionTitle}>Cuisine Store</Text>
								<Ionicons
									name={expanded.cuisines ? 'chevron-up' : 'chevron-down'}
									size={20}
									color={colors.primary}
								/>
							</TouchableOpacity>
							{expanded.cuisines && (
								<View style={styles.sectionContent}>
									<Text style={styles.debugText}>
										Count: {cuisineStore.cuisines.length}
									</Text>
									<Text style={styles.debugText}>
										Loading: {cuisineStore.isLoading ? 'Yes' : 'No'}
									</Text>
									<Text style={styles.debugText}>
										Last Fetched: {formatTimestamp(cuisineStore.lastFetched)}
									</Text>
									<Text style={styles.debugText}>
										Error: {cuisineStore.error || 'None'}
									</Text>
									<Text style={styles.debugText}>
										Cuisines:{' '}
										{cuisineStore.cuisines.map((c) => c.name).join(', ')}
									</Text>
								</View>
							)}
						</View>

						{/* Restaurant Store */}
						<View style={styles.section}>
							<TouchableOpacity
								style={styles.sectionHeader}
								onPress={() => toggleSection('restaurants')}
							>
								<Text style={styles.sectionTitle}>Restaurant Store</Text>
								<Ionicons
									name={expanded.restaurants ? 'chevron-up' : 'chevron-down'}
									size={20}
									color={colors.primary}
								/>
							</TouchableOpacity>
							{expanded.restaurants && (
								<View style={styles.sectionContent}>
									<Text style={styles.debugText}>
										Cache Size: {formatCacheSize(restaurantStore.cache)}
									</Text>
									<Text style={styles.debugText}>
										Loading: {restaurantStore.isLoading ? 'Yes' : 'No'}
									</Text>
									<Text style={styles.debugText}>
										Error: {restaurantStore.error || 'None'}
									</Text>
									<Text style={styles.debugText}>
										Last Error:{' '}
										{restaurantStore.lastError?.toLocaleTimeString() || 'None'}
									</Text>
								</View>
							)}
						</View>

						{/* Network Info */}
						<View style={styles.section}>
							<TouchableOpacity
								style={styles.sectionHeader}
								onPress={() => toggleSection('network')}
							>
								<Text style={styles.sectionTitle}>Network Info</Text>
								<Ionicons
									name={expanded.network ? 'chevron-up' : 'chevron-down'}
									size={20}
									color={colors.primary}
								/>
							</TouchableOpacity>
							{expanded.network && (
								<View style={styles.sectionContent}>
									<Text style={styles.debugText}>
										Environment: {__DEV__ ? 'Development' : 'Production'}
									</Text>
									<Text style={styles.debugText}>
										Platform: {require('react-native').Platform.OS}
									</Text>
									<Text style={styles.debugText}>
										Check console for detailed network logs
									</Text>
								</View>
							)}
						</View>
					</ScrollView>
				</View>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	debugButton: {
		position: 'absolute',
		top: 100,
		right: 20,
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: colors.secondary,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.primaryLight,
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	closeButton: {
		padding: 5,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	section: {
		marginVertical: 10,
		backgroundColor: colors.quaternary,
		borderRadius: 12,
		overflow: 'hidden',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 12,
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: 'Manrope',
		fontWeight: '600',
		color: colors.primary,
	},
	sectionContent: {
		paddingHorizontal: 15,
		paddingBottom: 15,
		borderTopWidth: 1,
		borderTopColor: colors.primaryLight,
	},
	debugText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '400',
		color: colors.primary,
		marginVertical: 2,
	},
	actionButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 8,
		marginVertical: 5,
	},
	actionButtonText: {
		color: colors.quaternary,
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '500',
		textAlign: 'center',
	},
});
