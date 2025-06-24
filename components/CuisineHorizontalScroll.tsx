import { allCuisines } from '@/api/responses';
import { colors } from '@/assets/styles/colors';

import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CuisineHorizontalScroll() {
	return (
		<View style={styles.container}>
			<ScrollView
				style={{ paddingHorizontal: 10 }}
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				{allCuisines.map((cuisine) => (
					<View
						key={cuisine.id}
						style={{
							alignItems: 'center',
							marginRight: 20,
							gap: 5,
						}}
					>
						<Image src={cuisine.image} style={styles.image} />
						<Text style={styles.text}>{cuisine.name}</Text>
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
