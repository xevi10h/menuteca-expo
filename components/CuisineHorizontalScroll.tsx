import { colors } from '@/assets/styles/colors';
import { useCuisineStore } from '@/zustand/CuisineStore';
import { useEffect } from 'react';
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface CuisineHorizontalScrollProps {
	onCuisinePress?: (cuisineId: string) => void;
}

export default function CuisineHorizontalScroll({
	onCuisinePress,
}: CuisineHorizontalScrollProps) {
	const { cuisines, isLoading, error, fetchCuisines } = useCuisineStore();

	useEffect(() => {
		// Only fetch if we don't have cuisines or there's an error
		if (cuisines.length === 0 && !isLoading) {
			fetchCuisines();
		}
	}, [cuisines.length, isLoading, fetchCuisines]);

	const handleCuisinePress = (cuisineId: string) => {
		if (onCuisinePress) {
			onCuisinePress(cuisineId);
		}
	};

	if (isLoading && cuisines.length === 0) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={colors.primary} />
				</View>
			</View>
		);
	}

	if (error && cuisines.length === 0) {
		return (
			<View style={styles.container}>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>
						Error loading cuisines. Please try again.
					</Text>
				</View>
			</View>
		);
	}

	if (cuisines.length === 0) {
		return null; // Don't show anything if no cuisines
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={{ paddingHorizontal: 10 }}
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				{cuisines.map((cuisine) => (
					<TouchableOpacity
						key={cuisine.id}
						style={styles.cuisineItem}
						onPress={() => handleCuisinePress(cuisine.id)}
						activeOpacity={0.7}
					>
						<Image src={cuisine.image} style={styles.image} />
						<Text style={styles.text}>{cuisine.name}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		height: 65,
		width: '100%',
		marginVertical: 20,
	},
	cuisineItem: {
		alignItems: 'center',
		marginRight: 20,
		gap: 5,
	},
	image: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	text: {
		color: colors.tertiary,
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 10,
		fontWeight: '700',
		fontFamily: 'Manrope',
	},
	loadingContainer: {
		height: 65,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		height: 65,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	errorText: {
		fontSize: 12,
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primaryLight,
		textAlign: 'center',
	},
});
