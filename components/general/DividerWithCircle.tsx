import React from 'react';
import { StyleSheet, View } from 'react-native';

const DividerWithCircle = ({
	color,
	marginVertical,
}: {
	color: string;
	marginVertical: number;
}) => {
	return (
		<View style={[styles.dividerContainer, { marginVertical }]}>
			{/* Línea izquierda */}
			<View style={[styles.line, { backgroundColor: color }]} />

			{/* Círculo central */}
			<View style={[styles.circle, { borderColor: color }]} />

			{/* Línea derecha */}
			<View style={[styles.line, { backgroundColor: color }]} />
		</View>
	);
};

const styles = StyleSheet.create({
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	line: {
		flex: 1,
		height: 1,
		opacity: 0.6,
	},
	circle: {
		width: 12,
		height: 12,
		borderRadius: 6,
		borderWidth: 3,
		marginHorizontal: 15,
	},
});

export default DividerWithCircle;
