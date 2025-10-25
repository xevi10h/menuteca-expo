import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { Restaurant } from '@/shared/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface RestaurantCardProps {
	restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const handleRestaurantPress = (restaurant_id: string) => {
		router.push(`/restaurant/${restaurant_id}`);
	};

	return (
		<TouchableOpacity
			key={restaurant.id}
			style={{
				marginRight: 12,
				width: width * 0.8,
				marginLeft: 24,
				borderTopRightRadius: 24,
				borderTopLeftRadius: 24,
				// backgroundColor: colors.quaternary,
				// paddingBottom: 10,
			}}
			onPress={() => handleRestaurantPress(restaurant.id)}
			activeOpacity={0.7}
		>
			<Image
				source={{ uri: restaurant.images?.[0] || '' }}
				style={{
					borderTopRightRadius: 24,
					borderTopLeftRadius: 24,
					width: '100%',
					height: 120,
				}}
				resizeMode="cover"
			/>
			{restaurant.rating && (
				<View
					style={{
						position: 'absolute',
						top: 12,
						right: 12,
						borderRadius: 6,
						borderWidth: 0.5,
						borderColor: colors.quaternary,
						backgroundColor: colors.primary,
					}}
				>
					<Text
						style={{
							fontSize: 10,
							fontFamily: fonts.medium,
							color: colors.quaternary,
							paddingHorizontal: 6,
							paddingVertical: 2,
						}}
					>
						{restaurant.rating} ★
					</Text>
				</View>
			)}
			<View
				style={{
					justifyContent: 'space-between',
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: 10,
					// paddingHorizontal: 10,
				}}
			>
				<Text
					style={{
						fontSize: 12,
						fontFamily: fonts.bold,
						color: colors.primary,
					}}
					numberOfLines={1}
				>
					{restaurant.name}
				</Text>
				<Text
					style={{
						fontSize: 16,
						fontFamily: fonts.bold,
						color: colors.primary,
					}}
				>
					{`${t('general.from')} ${restaurant.minimum_price}€`}
				</Text>
			</View>
			<View
				style={{
					justifyContent: 'space-between',
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: 5,
					// paddingHorizontal: 10,
				}}
			>
				<Text
					style={{
						fontSize: 10,
						fontFamily: fonts.medium,
						color: colors.primary,
					}}
					numberOfLines={1}
				>
					{restaurant?.cuisine?.name || ''}
				</Text>
				<Text
					style={{
						fontSize: 10,
						fontFamily: fonts.medium,
						color: colors.primary,
					}}
				>
					{restaurant.distance ? `${restaurant.distance.toFixed(2)} km` : ''}
				</Text>
			</View>
		</TouchableOpacity>
	);
}
