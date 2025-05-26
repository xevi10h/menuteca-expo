import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ListFilter() {
	const { t } = useTranslation();
	return (
		<View style={styles.container}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<View style={styles.pill}>
					<Text style={styles.pillText}>{t('filters.price')}</Text>
				</View>
				<View style={styles.pill}>
					<Text style={styles.pillText}>{t('filters.rating')}</Text>
				</View>
				<View style={styles.pill}>
					<Text style={styles.pillText}>{t('filters.sortBy')}</Text>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		height: 32,
		width: '100%',
	},
	pill: {
		backgroundColor: colors.primary,
		opacity: 0.5,
		borderRadius: 12,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	pillText: {
		color: colors.quaternary,
		fontSize: 10,
		fontFamily: 'Manrope',
		fontWeight: '500',
	},
});
