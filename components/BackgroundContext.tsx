import React, { createContext, useContext } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface BackgroundContextType {
	BackgroundWrapper: React.FC<{ children: React.ReactNode }>;
}

const BackgroundContext = createContext<BackgroundContextType | null>(null);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({
		children,
	}) => (
		<ImageBackground
			source={require('@/assets/images/background_food.png')}
			style={styles.background}
			imageStyle={styles.backgroundImage}
		>
			{children}
		</ImageBackground>
	);

	return (
		<BackgroundContext.Provider value={{ BackgroundWrapper }}>
			{children}
		</BackgroundContext.Provider>
	);
};

export const useBackground = () => {
	const context = useContext(BackgroundContext);
	if (!context) {
		throw new Error('useBackground must be used within a BackgroundProvider');
	}
	return context;
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	backgroundImage: {
		opacity: 0.8,
	},
});
