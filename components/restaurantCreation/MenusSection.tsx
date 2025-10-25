import { colors } from '@/assets/styles/colors';
import { fonts } from '@/assets/styles/fonts';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenusSectionProps {
	menus?: MenuData[];
	onEditMenu: (index: number) => void;
	onCopyMenu: (index: number) => void;
	onDeleteMenu: (index: number) => void;
	onAddMenu: () => void;
	showTitle?: boolean; // Nueva prop para controlar si mostrar el título
}

export default function MenusSection({
	menus = [],
	onEditMenu,
	onCopyMenu,
	onDeleteMenu,
	onAddMenu,
	showTitle = false,
}: MenusSectionProps) {
	const { t } = useTranslation();

	return (
		<View style={styles.menusSection}>
			{showTitle && (
				<Text style={styles.sectionTitle}>
					{t('registerRestaurant.myMenus')}
				</Text>
			)}
			<View style={{ gap: 10 }}>
				{menus.map((menu, index) => (
					<View style={styles.menuItem} key={index}>
						<View style={styles.menuActions}>
							<View style={styles.menuNameContainer}>
								<Text style={styles.menuName}>
									{menu.name || t('registerRestaurant.defaultMenuName')}
								</Text>
							</View>

							<TouchableOpacity
								onPress={() => onEditMenu(index)}
								style={styles.actionButton}
							>
								<Ionicons
									name="pencil-outline"
									size={18}
									color={colors.primary}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => onCopyMenu(index)}
								style={styles.actionButton}
							>
								<Ionicons
									name="copy-outline"
									size={18}
									color={colors.primary}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => onDeleteMenu(index)}
								style={styles.actionButton}
							>
								<Ionicons
									name="trash-outline"
									size={18}
									color={colors.primary}
								/>
							</TouchableOpacity>
						</View>
					</View>
				))}
			</View>
			<TouchableOpacity style={styles.addMenuButton} onPress={onAddMenu}>
				<Ionicons name="add" size={20} color={colors.primary} />
				<Text style={styles.addMenuText}>
					{t('registerRestaurant.addMenu')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	menusSection: {
		marginVertical: 0, // Removed vertical margin since parent handles it
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: fonts.semiBold,
		color: colors.primary,
		marginBottom: 10,
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	menuNameContainer: {
		paddingHorizontal: 15,
		paddingVertical: 12,
		borderRadius: 12,
		borderColor: colors.primaryLight,
		borderWidth: 1,
		flex: 1,
	},
	menuName: {
		fontSize: 14,
		fontFamily: fonts.regular,
		color: colors.primary,
		flex: 1,
	},
	menuActions: {
		flexDirection: 'row',
		gap: 5,
	},
	actionButton: {
		padding: 8,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 50,
		minHeight: 50,
	},
	addMenuButton: {
		backgroundColor: colors.secondary,
		marginTop: 15,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 15,
		borderWidth: 1,
		borderColor: colors.primary,
		borderStyle: 'dashed',
		borderRadius: 8,
		gap: 8,
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	addMenuText: {
		fontSize: 14,
		fontFamily: fonts.medium,
		color: colors.primary,
	},
});
