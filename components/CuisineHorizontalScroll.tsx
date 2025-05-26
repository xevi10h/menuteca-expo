import { colors } from '@/assets/styles/colors';
import { useUserStore } from '@/zustand/UserStore';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CuisineHorizontalScroll() {
	const language = useUserStore((state) => state.user.language);

	const cuisines = [
		{
			id: 1,
			name: {
				en_US: 'Mediterranean',
				es_ES: 'Mediterráneo',
				ca_ES: 'Mediterrani',
				fr_FR: 'Méditerranéen',
			},
			image:
				'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
		},
		{
			id: 2,
			name: {
				en_US: 'Japanese',
				es_ES: 'Japonés',
				ca_ES: 'Japonès',
				fr_FR: 'Japonais',
			},
			image:
				'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		},
		{
			id: 3,
			name: {
				en_US: 'Italian',
				es_ES: 'Italiano',
				ca_ES: 'Italià',
				fr_FR: 'Italien',
			},
			image:
				'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
		},
		{
			id: 4,
			name: {
				en_US: 'Mexican',
				es_ES: 'Mexicano',
				ca_ES: 'Mexicà',
				fr_FR: 'Mexicain',
			},
			image:
				'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg',
		},
		{
			id: 5,
			name: {
				en_US: 'American',
				es_ES: 'Americano',
				ca_ES: 'Americà',
				fr_FR: 'Américain',
			},
			image:
				'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		},
		{
			id: 6,
			name: {
				en_US: 'Chinese',
				es_ES: 'Chino',
				ca_ES: 'Xinès',
				fr_FR: 'Chinois',
			},
			image:
				'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
		},
		{
			id: 7,
			name: {
				en_US: 'Indian',
				es_ES: 'Indio',
				ca_ES: 'Indi',
				fr_FR: 'Indien',
			},
			image:
				'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
		},
		{
			id: 8,
			name: {
				en_US: 'Thai',
				es_ES: 'Tailandés',
				ca_ES: 'Tailandès',
				fr_FR: 'Thaïlandais',
			},
			image:
				'https://images.pexels.com/photos/12153467/pexels-photo-12153467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		},
		{
			id: 9,
			name: {
				en_US: 'Korean',
				es_ES: 'Coreano',
				ca_ES: 'Coreà',
				fr_FR: 'Coréen',
			},
			image:
				'https://images.pexels.com/photos/12973148/pexels-photo-12973148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
		},
		{
			id: 10,
			name: {
				en_US: 'Haute cuisine',
				es_ES: 'Alta cocina',
				ca_ES: 'Alta cuina',
				fr_FR: 'Haute cuisine',
			},
			image:
				'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?fm=jpg&q=60&w=3000',
		},
	];

	return (
		<View style={styles.container}>
			<ScrollView
				style={{ paddingHorizontal: 10 }}
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				{cuisines.map((cuisine) => (
					<View
						key={cuisine.id}
						style={{
							alignItems: 'center',
							marginRight: 20,
							gap: 5,
						}}
					>
						<Image src={cuisine.image} style={styles.image} />
						<Text style={styles.text}>{cuisine.name[language]}</Text>
					</View>
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
	image: { width: 48, height: 48, borderRadius: 24 },
	text: {
		color: colors.tertiary,
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 10,
		fontWeight: '700',
		fontFamily: 'Manrope',
	},
});
