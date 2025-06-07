import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface VeganIconProps {
	width?: number;
	height?: number;
	color?: string;
}

const VeganIcon: React.FC<VeganIconProps> = ({
	width = 24,
	height = 24,
	color = '#48280E',
}) => {
	// Calcular el viewBox proporcional basado en el tamaño original 35x32
	const aspectRatio = 35 / 32;
	const adjustedWidth = width;
	const adjustedHeight = width / aspectRatio;

	return (
		<Svg
			width={adjustedWidth}
			height={adjustedHeight}
			viewBox="0 0 35 32"
			fill="none"
		>
			<Path
				d="M15.4923 24.6667C15.4923 24.6667 16.6415 15.6117 20.4894 11.6667C23.5399 8.53917 27.4754 9.53564 30.4837 6.37037C31.6174 5.17746 32.9822 3 32.9822 3C32.9822 3 35.2722 13.6695 32.9822 17.4444C30.6922 21.2194 28.8865 23.0417 24.4871 25.6296C20.0877 28.2176 15.4923 24.6667 15.4923 24.6667ZM15.4923 24.6667C14.1896 27.2032 13.087 28.1355 10.4951 29C11.1823 26.4837 11.2501 25.3656 10.9948 23.7037M15.4923 24.6667C22.8946 21.0263 25.9545 18.1771 29.4842 11.6667M10.9948 23.7037C10.9948 23.7037 14.5017 19.5939 14.4928 16.4815C14.4847 13.6175 13.3361 11.9889 11.4946 9.74074C9.68104 7.52676 8.08756 6.72252 5.49799 5.40741C4.18322 4.7397 2 3.96296 2 3.96296C2 3.96296 2.73487 6.28537 2.99943 7.81481C3.54483 10.9678 2.99943 14.0741 2.99943 16C2.99943 17.9259 3.76399 20.6419 5.99771 22.2593C7.62649 23.4386 10.9948 23.7037 10.9948 23.7037ZM10.9948 23.7037C10.5145 18.0038 9.79125 14.9102 6.99713 9.74074"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</Svg>
	);
};

export default VeganIcon;
