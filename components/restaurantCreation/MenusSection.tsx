import { colors } from '@/assets/styles/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { MenuData } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenusSectionProps {
	menus?: MenuData[];
	onEditMenu: (index: number) => void;
	onDeleteMenu: (index: number) => void;
	onAddMenu: () => void;
	showTitle?: boolean; // Nueva prop para controlar si mostrar el título
}

export default function MenusSection({
	menus = [],
	onEditMenu,
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
						<View style={styles.menuNameContainer}>
							<Text style={styles.menuName}>
								{menu.name || t('registerRestaurant.defaultMenuName')}
							</Text>
						</View>
						<View style={styles.menuActions}>
							<TouchableOpacity onPress={() => onEditMenu(index)}>
								<Ionicons
									name="pencil-outline"
									size={20}
									color={colors.primary}
								/>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => onDeleteMenu(index)}>
								<Ionicons
									name="trash-outline"
									size={20}
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
		fontFamily: 'Manrope',
		fontWeight: '600',
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
		borderColor: colors.primary,
		borderWidth: 1,
		flex: 1,
		marginRight: 10,
	},
	menuName: {
		fontSize: 14,
		fontFamily: 'Manrope',
		fontWeight: '300',
		color: colors.primary,
		flex: 1,
	},
	menuActions: {
		flexDirection: 'row',
		gap: 15,
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
		fontFamily: 'Manrope',
		fontWeight: '500',
		color: colors.primary,
	},
});
