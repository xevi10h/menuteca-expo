import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useFilterStore } from '@/zustand/FilterStore';
import {
	Image,
	Platform,
	Pressable,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

export default function FilterSearcher() {
	const { t } = useTranslation();
	const textSearch = useFilterStore((state) => state.main.textSearch);
	const setTextSearch = useFilterStore((state) => state.setTextSearch);

	return (
		<View style={styles.container}>
			<View
				style={{
					marginRight: Platform.OS === 'ios' ? 5 : 2,
					width: 20,
					height: '100%',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Image
					source={require('@/assets/images/text_search_lens.png')}
					style={styles.image}
					resizeMode="contain"
				/>
			</View>

			<View style={{ height: '100%', justifyContent: 'center' }}>
				<TextInput
					placeholder={t('discover.searchMenus') || 'Search'}
					placeholderTextColor={colors.primary}
					value={textSearch}
					onChangeText={setTextSearch}
					style={styles.textInput}
					numberOfLines={1}
				/>
			</View>
			{textSearch && textSearch.length > 0 && (
				<View
					style={{
						position: 'absolute',
						right: 5,
						width: 30,
						height: 40,
					}}
				>
					<Pressable
						onPress={() => setTextSearch('')}
						style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Image
							source={require('@/assets/images/text_search_delete.png')}
							style={{ width: 10, height: 10 }}
							resizeMode="contain"
						/>
					</Pressable>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 24,
		alignItems: 'center',
		flexDirection: 'row',
		paddingHorizontal: 15,
		height: 42,
		borderColor: colors.primary,
		backgroundColor: colors.secondary,
		borderWidth: 2,
		flex: 1,
		width: '100%',
	},
	image: { width: 18, height: 18, marginRight: 10 },
	textInput: {
		color: colors.primary,
		marginRight: 50,
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 16,
		fontFamily: 'Manrope',
	},
});
