import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
};

interface DishCategory {
	APPETIZERS: 'appetizers';
	FIRST_COURSES: 'firstCourses';
	SECOND_COURSES: 'secondCourses';
	MAIN_COURSES: 'mainCourses';
	SIDES: 'sides';
	DESSERTS: 'desserts';
	DRINKS: 'drinks';
}

interface AnalyzedDish {
	name: string;
	description: string;
	extra_price: number;
	category: string;
	is_vegetarian: boolean;
	is_lactose_free: boolean;
	is_spicy: boolean;
	is_gluten_free: boolean;
	is_vegan: boolean;
}

interface AnalyzedMenu {
	name: string;
	price: number;
	dishes: AnalyzedDish[];
	first_courses_to_share?: boolean;
	second_courses_to_share?: boolean;
	desserts_to_share?: boolean;
	includes_bread?: boolean;
	drinks?: {
		water: boolean;
		wine: boolean;
		soft_drinks: boolean;
		beer: boolean;
	};
	includes_coffee_and_dessert?: 'none' | 'coffee' | 'dessert' | 'both';
	has_minimum_people?: boolean;
	minimum_people?: number;
}

// Mensajes de error multiidioma
const ERROR_MESSAGES = {
	not_menu: {
		es: 'Esta imagen no contiene un menú de restaurante. Por favor, sube una imagen clara de un menú.',
		ca: "Aquesta imatge no conté un menú de restaurant. Si us plau, puja una imatge clara d'un menú.",
		en: 'This image does not contain a restaurant menu. Please upload a clear image of a menu.',
		fr: "Cette image ne contient pas un menu de restaurant. Veuillez télécharger une image claire d'un menu.",
	},
	quota_exceeded: {
		es: 'Se ha excedido el límite de procesamiento de imágenes. Por favor, inténtalo de nuevo más tarde.',
		ca: "S'ha excedit el límit de processament d'imatges. Si us plau, torna-ho a intentar més tard.",
		en: 'Image processing limit exceeded. Please try again later.',
		fr: "Limite de traitement d'images dépassée. Veuillez réessayer plus tard.",
	},
	processing_error: {
		es: 'Error al procesar la imagen. Por favor, asegúrate de que la imagen es clara y legible.',
		ca: "Error en processar la imatge. Si us plau, assegura't que la imatge és clara i llegible.",
		en: 'Error processing the image. Please make sure the image is clear and readable.',
		fr: "Erreur lors du traitement de l'image. Veuillez vous assurer que l'image est claire et lisible.",
	},
};

// Función para detectar idioma preferido del navegador
function getPreferredLanguage(req: Request): 'es' | 'ca' | 'en' | 'fr' {
	const acceptLanguage = req.headers.get('accept-language') || '';

	if (acceptLanguage.includes('ca')) return 'ca';
	if (acceptLanguage.includes('fr')) return 'fr';
	if (acceptLanguage.includes('en')) return 'en';
	return 'es'; // Por defecto español
}

// Función para limpiar la respuesta de markdown y comentarios
function cleanMarkdownResponse(response: string): string {
	// Remover bloques de código markdown
	let cleaned = response.trim();

	// Remover ```json al principio
	if (cleaned.startsWith('```json')) {
		cleaned = cleaned.substring(7);
	}

	// Remover ``` al final
	if (cleaned.endsWith('```')) {
		cleaned = cleaned.substring(0, cleaned.length - 3);
	}

	// Remover cualquier otro tipo de bloque markdown
	cleaned = cleaned.replace(/^```[\w]*\n?/gm, '');
	cleaned = cleaned.replace(/\n?```$/gm, '');

	// Remover comentarios de línea que rompen el JSON
	cleaned = cleaned.replace(/,\s*\/\/.*$/gm, ','); // Comentarios después de comas
	cleaned = cleaned.replace(/\s*\/\/.*$/gm, ''); // Otros comentarios de línea

	// Remover comentarios de bloque /* */
	cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

	// Limpiar espacios extra
	cleaned = cleaned.replace(/\s+/g, ' ').trim();

	return cleaned;
}

const MENU_ANALYSIS_PROMPT = `
Analiza esta imagen y determina si contiene un menú de restaurante.

Si NO es un menú de restaurante, responde únicamente con:
{
  "is_menu": false,
  "error": "Esta imagen no contiene un menú de restaurante. Por favor, sube una imagen de un menú."
}

Si SÍ es un menú de restaurante, EXTRAE TODA LA INFORMACIÓN DEL MENÚ Y TODOS SUS PLATOS y responde únicamente con un JSON válido.
Sobretodo, es muy importante que busques y extraigas todos todos TODOS LOS PLATOS (TODOS LOS APERITIVOS/ENTRANTES, TODOS LOS PRIMEROS, TODOS LOS SEGUNDOS Y TODOS LOS POSTRES => QUIERO ABSOLUTAMENTE TODOS LOS PLATOS QUE ENCUENTRES EN LA IMAGEN) que encuentres en el menú y los intentes organizar segun creas que trata de un aperitivo/entrante, primer plato, segundo plato o postre.
Por favor, tomate el tiempo que sea necesario para extraer todos los platos de la imagen! LOS QUIERO TODOS! TU MISIÓN ES SACAR LA MAYOR INFORMACIÓN POSIBLE DE LA IMÁGEN.
Debe seguir esta estructura exacta:

{
  "is_menu": true,
  "menu": {
    "name": "Nombre del menú (si está especificado, si no usar 'Menú del día')",
    "price": 0.0,
    "dishes": [
      {
        "name": "Nombre del plato",
        "description": "Descripción detallada del plato basada en los ingredientes mencionados",
        "extra_price": 0.0,
        "category": "firstCourses|secondCourses|desserts|appetizers|mainCourses|sides|drinks",
        "is_vegetarian": true/false,
        "is_lactose_free": true/false,
        "is_spicy": true/false,
        "is_gluten_free": true/false,
        "is_vegan": true/false
      }
    ],
    "first_courses_to_share": false,
    "second_courses_to_share": false,
    "desserts_to_share": false,
    "includes_bread": false,
    "drinks": {
      "water": false,
      "wine": false,
      "soft_drinks": false,
      "beer": false
    },
    "includes_coffee_and_dessert": "none",
    "has_minimum_people": false,
    "minimum_people": 1
  }
}

INSTRUCCIONES IMPORTANTES:
1. Responde ÚNICAMENTE con JSON válido, sin bloques de código markdown ni texto adicional
2. NO uses bloques de código en tu respuesta
3. Categoriza los platos correctamente usando SOLO estas categorías: firstCourses, secondCourses, desserts, appetizers, mainCourses, sides, drinks
4. Si hay primeros platos, ensaladas, sopas → usa "firstCourses"
5. Si hay segundos platos, carnes, pescados → usa "secondCourses" 
6. Si hay postres → usa "desserts"
7. Si hay aperitivos/entrantes → usa "appetizers"
8. Deduce las propiedades dietéticas (vegetariano, vegano, sin gluten, etc.) basándote en los ingredientes
9. Si el menú incluye bebidas específicas, márcalas en el objeto "drinks"
10. Si menciona que incluye pan, café, postre, etc., ajusta las propiedades correspondientes
11. Si hay precios diferentes para platos específicos, ponlos en "extra_price"
12. Si no hay precio general del menú visible, usa 0.0

Analiza la imagen ahora:
`;

serve(async (req) => {
	console.log('🔍 Menu image analysis function called');
	console.log('📝 Request method:', req.method);

	if (req.method === 'OPTIONS') {
		console.log('✅ CORS preflight request');
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		console.log('🔧 Initializing Google Gemini AI...');

		const preferredLanguage = getPreferredLanguage(req);
		console.log('🌐 Preferred language:', preferredLanguage);

		const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
		if (!geminiApiKey) {
			console.error('❌ Missing GEMINI_API_KEY environment variable');
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		console.log('🔑 Gemini API Key found, length:', geminiApiKey.length);
		const genAI = new GoogleGenerativeAI(geminiApiKey);
		console.log('✅ Google Gemini AI initialized');

		let requestBody;
		try {
			const requestText = await req.text();
			console.log('📦 Request body text length:', requestText.length);
			console.log('📦 Request body preview:', requestText.substring(0, 200));

			requestBody = JSON.parse(requestText);
			console.log('📦 Request body parsed successfully');
		} catch (e) {
			console.error('❌ Failed to parse JSON:', e);
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		const { imageData, mimeType } = requestBody;

		if (!imageData || !mimeType) {
			console.error('❌ Missing imageData or mimeType');
			console.log(
				'🔍 imageData length:',
				imageData ? imageData.length : 'undefined',
			);
			console.log('🔍 mimeType:', mimeType);
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		console.log('🖼️ Processing image with Gemini AI...');
		console.log('📄 MIME type:', mimeType);
		console.log('📄 Image data length:', imageData.length);
		console.log(
			'📄 Image data preview (first 50 chars):',
			imageData.substring(0, 50),
		);

		// Configurar el modelo Gemini con parámetros optimizados para análisis exhaustivo
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-pro', // Usar pro para mejor comprensión de imágenes
			generationConfig: {
				temperature: 0.2, // Ligeramente más alta para creatividad en encontrar platos
				topK: 40, // Permitir más variedad en las respuestas
				topP: 0.95, // Permitir respuestas más completas
				maxOutputTokens: 8192, // Duplicar los tokens para respuestas más largas
			},
		});

		console.log('🤖 Gemini model configured');

		// Preparar el contenido para Gemini
		const contents = [
			{
				role: 'user',
				parts: [
					{
						inlineData: {
							data: imageData,
							mimeType: mimeType,
						},
					},
					{
						text: MENU_ANALYSIS_PROMPT,
					},
				],
			},
		];

		console.log('📝 Content prepared for Gemini');
		console.log('📝 Prompt length:', MENU_ANALYSIS_PROMPT.length);
		console.log('📝 Contents structure:', {
			role: contents[0].role,
			partsCount: contents[0].parts.length,
			hasImageData: !!contents[0].parts[0].inlineData,
			hasTextData: !!contents[0].parts[1].text,
		});

		// Generar respuesta
		let result;
		let response;
		let text;

		try {
			console.log('🚀 Calling Gemini API...');
			result = await model.generateContent({
				contents: contents,
			});
			console.log('📡 Gemini API call completed');
			console.log('📡 Result object keys:', Object.keys(result || {}));

			response = await result.response;
			console.log('📡 Response extracted');
			console.log('📡 Response object keys:', Object.keys(response || {}));

			text = response.text();
			console.log('📡 Text extracted successfully');
			console.log('📡 Text length:', text ? text.length : 'null/undefined');
		} catch (apiError: any) {
			console.error('❌ Gemini API Error:', apiError);
			console.error('❌ API Error details:', {
				name: apiError.name,
				message: apiError.message,
				stack: apiError.stack,
				cause: apiError.cause,
			});

			// Detectar error de cuota excedida
			if (apiError.message && apiError.message.includes('429')) {
				return new Response(
					JSON.stringify({
						success: false,
						error: ERROR_MESSAGES.quota_exceeded[preferredLanguage],
						errorType: 'quota_exceeded',
					}),
					{
						status: 429,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					},
				);
			}

			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
					errorType: 'api_error',
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		console.log('🤖 AI Response received:', text);
		console.log('🤖 Response type:', typeof text);
		console.log('🤖 Response is empty:', !text || text.trim() === '');

		// Verificar si la respuesta está vacía
		if (!text || text.trim() === '') {
			console.error('❌ Empty response from Gemini API');
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
					errorType: 'empty_response',
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Limpiar la respuesta de markdown antes de parsear
		const cleanedText = cleanMarkdownResponse(text);
		console.log('🧹 Cleaned response:', cleanedText);
		console.log('🧹 Cleaned response length:', cleanedText.length);

		// Parsear la respuesta JSON
		let parsedResponse;
		try {
			parsedResponse = JSON.parse(cleanedText);
			console.log('✅ Response parsed successfully');
			console.log(
				'✅ Parsed response keys:',
				Object.keys(parsedResponse || {}),
			);
		} catch (parseError) {
			console.error('❌ Failed to parse AI response as JSON:', parseError);
			console.error('Raw response:', text);
			console.error('Cleaned response:', cleanedText);
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
					errorType: 'parse_error',
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Verificar si es un menú válido
		if (!parsedResponse.is_menu) {
			console.log('❌ Image is not a menu');
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.not_menu[preferredLanguage],
					errorType: 'not_menu',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Validar estructura del menú
		const menu = parsedResponse.menu;
		if (!menu || !menu.dishes || !Array.isArray(menu.dishes)) {
			console.error('❌ Invalid menu structure in AI response');
			return new Response(
				JSON.stringify({
					success: false,
					error: ERROR_MESSAGES.processing_error[preferredLanguage],
					errorType: 'invalid_structure',
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Asignar IDs únicos a los platos
		const menuWithIds = {
			...menu,
			dishes: menu.dishes.map((dish: AnalyzedDish, index: number) => ({
				...dish,
				id: `ai_dish_${Date.now()}_${index}`,
			})),
		};

		console.log('✅ Menu successfully analyzed and processed');
		console.log('📊 Found', menuWithIds.dishes.length, 'dishes');

		return new Response(
			JSON.stringify({
				success: true,
				data: {
					dishes: menuWithIds.dishes,
					menuData: {
						first_courses_to_share: menuWithIds.first_courses_to_share || false,
						second_courses_to_share:
							menuWithIds.second_courses_to_share || false,
						desserts_to_share: menuWithIds.desserts_to_share || false,
						includes_bread: menuWithIds.includes_bread || false,
						drinks: menuWithIds.drinks || {
							water: false,
							wine: false,
							soft_drinks: false,
							beer: false,
						},
						includes_coffee_and_dessert:
							menuWithIds.includes_coffee_and_dessert || 'none',
						has_minimum_people: menuWithIds.has_minimum_people || false,
						minimum_people: menuWithIds.minimum_people || 1,
					},
					suggestedMenuName: menuWithIds.name || 'Menú del día',
					suggestedPrice: menuWithIds.price || 0,
				},
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	} catch (error) {
		console.error('💥 Function error:', error);
		const preferredLanguage = getPreferredLanguage(req);
		return new Response(
			JSON.stringify({
				success: false,
				error: ERROR_MESSAGES.processing_error[preferredLanguage],
				errorType: 'unexpected_error',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	}
});
