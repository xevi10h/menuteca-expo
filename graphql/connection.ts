import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.133:4000';

// PROD https://api.menuteca.es
// DEV http://192.168.1.133:4000

const httpLink = createHttpLink({
	uri: BASE_URL,
});

const authLink = setContext(async (_, { headers }) => {
	try {
		const userStorage = await AsyncStorage.getItem('user-storage');
		const user = userStorage ? JSON.parse(userStorage) : '';
		const { token } = user?.state?.user;
		return {
			headers: {
				...headers,
				authorization: token || '',
			},
		};
	} catch (e) {
		console.log('Error al obtener el token de autenticación:', e);
	}
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});
export default client;
