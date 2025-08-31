import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetCode {
	id: string;
	user_id: string;
	code_hash: string;
	expires_at: string;
	is_used: boolean;
	used_at?: string;
	created_at: string;
	updated_at: string;
}

serve(async (req) => {
	console.log('🚀 Password reset function called');
	console.log('📝 Request method:', req.method);
	console.log('🔑 Headers:', Object.fromEntries(req.headers.entries()));

	if (req.method === 'OPTIONS') {
		console.log('✅ CORS preflight request');
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		console.log('🔧 Creating Supabase client...');

		// Use service role key for admin operations (password reset is public)
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

		console.log('🌐 Supabase URL exists:', !!supabaseUrl);
		console.log('🔐 Service role key exists:', !!serviceRoleKey);

		if (!supabaseUrl || !serviceRoleKey) {
			console.error('❌ Missing environment variables');
			return new Response(
				JSON.stringify({ success: false, error: 'Server configuration error' }),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
		console.log('✅ Supabase client created');

		let requestBody;
		try {
			requestBody = await req.json();
			console.log('📦 Request body:', requestBody);
		} catch (e) {
			console.error('❌ Failed to parse JSON:', e);
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid JSON' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		const { action, ...payload } = requestBody;
		console.log('🎯 Action:', action);
		console.log('📋 Payload:', payload);

		switch (action) {
			case 'send-reset-code':
				console.log('📧 Handling send-reset-code');
				return await sendPasswordResetCode(supabaseClient, payload);
			case 'verify-reset-code':
				console.log('🔍 Handling verify-reset-code');
				return await verifyPasswordResetCode(supabaseClient, payload);
			case 'reset-password':
				console.log('🔄 Handling reset-password');
				return await resetPasswordWithToken(supabaseClient, payload);
			default:
				console.log('❌ Invalid action:', action);
				return new Response(
					JSON.stringify({ success: false, error: 'Invalid action' }),
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					},
				);
		}
	} catch (error) {
		console.error('💥 Function error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: `Server error: ${error.message}`,
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	}
});

async function sendPasswordResetCode(
	supabaseClient: any,
	{ email }: { email: string },
) {
	try {
		console.log('📧 Starting sendPasswordResetCode for:', email);

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			console.log('❌ Invalid email format:', email);
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid email format' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		console.log('✅ Email format valid');

		// Check if user exists
		const { data: user, error: userError } = await supabaseClient
			.from('profiles')
			.select('id, email, name, language, has_password')
			.eq('email', email.toLowerCase())
			.maybeSingle();

		if (userError) {
			throw userError;
		}

		if (!user) {
			return new Response(
				JSON.stringify({ success: false, error: 'User not found' }),
				{
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		if (!user.has_password) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'User registered with social login',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Generate 6-digit code
		const code = Math.floor(100000 + Math.random() * 900000).toString();

		// Create hash of the code for secure storage (SIN timestamp)
		const encoder = new TextEncoder();
		const data = encoder.encode(code + user.id);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const codeHash = hashArray
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

		// Set expiration (10 minutes from now)
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

		// Delete any existing codes for this user
		await supabaseClient
			.from('password_reset_codes')
			.delete()
			.eq('user_id', user.id);

		// Insert new reset code
		const { error: insertError } = await supabaseClient
			.from('password_reset_codes')
			.insert({
				user_id: user.id,
				code_hash: codeHash,
				expires_at: expiresAt,
				is_used: false,
			});

		if (insertError) {
			throw insertError;
		}

		// Send email with the code
		await sendResetCodeEmail(email, code, user.name, user.language || 'es_ES');

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Reset code sent successfully',
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	} catch (error) {
		console.error('Send reset code error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to send reset code',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	}
}

async function verifyPasswordResetCode(
	supabaseClient: any,
	{ email, code }: { email: string; code: string },
) {
	try {
		// Validate inputs
		if (!email || !code) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Email and code are required',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		if (!/^\d{6}$/.test(code)) {
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid code format' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Get user by email
		const { data: user, error: userError } = await supabaseClient
			.from('profiles')
			.select('id, email')
			.eq('email', email.toLowerCase())
			.maybeSingle();

		if (userError) {
			throw userError;
		}

		if (!user) {
			return new Response(
				JSON.stringify({ success: false, error: 'User not found' }),
				{
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Get all active reset codes for this user
		const { data: resetCodes, error: findError } = await supabaseClient
			.from('password_reset_codes')
			.select('*')
			.eq('user_id', user.id)
			.eq('is_used', false)
			.gt('expires_at', new Date().toISOString());

		if (findError) {
			throw findError;
		}

		if (!resetCodes || resetCodes.length === 0) {
			return new Response(
				JSON.stringify({ success: false, error: 'No valid reset code found' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Check if any of the codes match
		let validResetCode = null;
		for (const resetCode of resetCodes) {
			const encoder = new TextEncoder();
			const data = encoder.encode(code + user.id);
			const hashBuffer = await crypto.subtle.digest('SHA-256', data);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const codeHash = hashArray
				.map((b) => b.toString(16).padStart(2, '0'))
				.join('');

			if (codeHash === resetCode.code_hash) {
				validResetCode = resetCode;
				break;
			}
		}

		if (!validResetCode) {
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid code' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Generate token for password reset (using the reset code ID as token)
		const token = `${validResetCode.id}_${Date.now()}`;

		return new Response(
			JSON.stringify({
				success: true,
				data: { token },
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	} catch (error) {
		console.error('Verify reset code error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to verify code',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	}
}

async function resetPasswordWithToken(
	supabaseClient: any,
	{ token, newPassword }: { token: string; newPassword: string },
) {
	try {
		// Validate inputs
		if (!token || !newPassword) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Token and new password are required',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Validate password strength
		if (newPassword.length < 8) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Password must be at least 8 characters long',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Parse token (format: resetCodeId_timestamp)
		const tokenParts = token.split('_');
		if (tokenParts.length !== 2) {
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid token format' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		const resetCodeId = tokenParts[0];

		// Find the reset code by ID
		const { data: resetCode, error: findError } = await supabaseClient
			.from('password_reset_codes')
			.select('*')
			.eq('id', resetCodeId)
			.eq('is_used', false)
			.maybeSingle();

		if (findError) {
			throw findError;
		}

		if (!resetCode) {
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid or expired token' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Check if token has expired
		const now = new Date();
		const expiresAt = new Date(resetCode.expires_at);

		if (now > expiresAt) {
			// Delete expired code
			await supabaseClient
				.from('password_reset_codes')
				.delete()
				.eq('id', resetCode.id);

			return new Response(
				JSON.stringify({ success: false, error: 'Token has expired' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// Update the user's password using admin client (already has service role key)
		const { error: updateError } =
			await supabaseClient.auth.admin.updateUserById(resetCode.user_id, {
				password: newPassword,
			});

		if (updateError) {
			throw updateError;
		}

		// Mark the reset code as used
		await supabaseClient
			.from('password_reset_codes')
			.update({
				is_used: true,
				used_at: new Date().toISOString(),
			})
			.eq('id', resetCode.id);

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Password reset successfully',
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	} catch (error) {
		console.error('Reset password error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to reset password',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			},
		);
	}
}

async function sendResetCodeEmail(
	email: string,
	code: string,
	userName: string,
	userLanguage: string,
) {
	try {
		const emailTemplates = getLocalizedEmailTemplates(
			userName,
			code,
			userLanguage,
		);

		const resendApiKey = Deno.env.get('RESEND_API_KEY');

		if (!resendApiKey) {
			// Development mode - just log the code
			console.log(
				`🔑 Password reset code for ${email} (${userLanguage}): ${code}`,
			);
			console.log(`📧 Subject: ${emailTemplates.subject}`);
			return;
		}

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${resendApiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: 'Menuteca <noreply@password.menutecaapp.com>',
				to: [email],
				subject: emailTemplates.subject,
				html: emailTemplates.html,
				text: emailTemplates.text,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Resend API error:', errorData);
			throw new Error(`Failed to send email: ${response.status}`);
		}

		console.log(`✅ Password reset email sent to ${email}`);
	} catch (error) {
		console.error('Email sending error:', error);
		throw error;
	}
}

function getLocalizedEmailTemplates(
	name: string,
	code: string,
	language: string,
) {
	const templates = {
		es_ES: {
			subject: 'Código de verificación - Menuteca',
			html: getSpanishEmailTemplate(name, code),
			text: getSpanishTextTemplate(name, code),
		},
		en_US: {
			subject: 'Verification Code - Menuteca',
			html: getEnglishEmailTemplate(name, code),
			text: getEnglishTextTemplate(name, code),
		},
		ca_ES: {
			subject: 'Codi de verificació - Menuteca',
			html: getCatalanEmailTemplate(name, code),
			text: getCatalanTextTemplate(name, code),
		},
		fr_FR: {
			subject: 'Code de vérification - Menuteca',
			html: getFrenchEmailTemplate(name, code),
			text: getFrenchTextTemplate(name, code),
		},
	};

	return templates[language as keyof typeof templates] || templates.es_ES;
}

function getSpanishEmailTemplate(name: string, code: string): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de verificación</title>
        <style>
            body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #2D5016; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2D5016; }
            .code-container { 
                background-color: #F5F7F0; 
                border: 2px solid #2D5016; 
                border-radius: 12px; 
                padding: 20px; 
                text-align: center; 
                margin: 30px 0;
            }
            .code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #2D5016; 
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Menuteca</div>
            </div>
            
            <h2>Código de verificación</h2>
            
            <p>Hola ${name},</p>
            
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Menuteca.</p>
            
            <p>Utiliza el siguiente código de verificación para continuar:</p>
            
            <div class="code-container">
                <div class="code">${code}</div>
            </div>
            
            <p>Este código expirará en 10 minutos por razones de seguridad.</p>
            
            <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
            
            <p>Saludos,<br>El equipo de Menuteca</p>
            
            <div class="footer">
                <p>Este código es confidencial. No lo compartas con nadie.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getEnglishEmailTemplate(name: string, code: string): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
            body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #2D5016; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2D5016; }
            .code-container { 
                background-color: #F5F7F0; 
                border: 2px solid #2D5016; 
                border-radius: 12px; 
                padding: 20px; 
                text-align: center; 
                margin: 30px 0;
            }
            .code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #2D5016; 
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Menuteca</div>
            </div>
            
            <h2>Verification Code</h2>
            
            <p>Hello ${name},</p>
            
            <p>We received a request to reset the password for your Menuteca account.</p>
            
            <p>Use the following verification code to continue:</p>
            
            <div class="code-container">
                <div class="code">${code}</div>
            </div>
            
            <p>This code will expire in 10 minutes for security reasons.</p>
            
            <p>If you didn't request this change, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The Menuteca Team</p>
            
            <div class="footer">
                <p>This code is confidential. Don't share it with anyone.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getCatalanEmailTemplate(name: string, code: string): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Codi de verificació</title>
        <style>
            body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #2D5016; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2D5016; }
            .code-container { 
                background-color: #F5F7F0; 
                border: 2px solid #2D5016; 
                border-radius: 12px; 
                padding: 20px; 
                text-align: center; 
                margin: 30px 0;
            }
            .code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #2D5016; 
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Menuteca</div>
            </div>
            
            <h2>Codi de verificació</h2>
            
            <p>Hola ${name},</p>
            
            <p>Hem rebut una sol·licitud per restablir la contrasenya del teu compte a Menuteca.</p>
            
            <p>Utilitza el següent codi de verificació per continuar:</p>
            
            <div class="code-container">
                <div class="code">${code}</div>
            </div>
            
            <p>Aquest codi expirarà en 10 minuts per motius de seguretat.</p>
            
            <p>Si no has sol·licitat aquest canvi, pots ignorar aquest email de forma segura.</p>
            
            <p>Salutacions,<br>L'equip de Menuteca</p>
            
            <div class="footer">
                <p>Aquest codi és confidencial. No el comparteixis amb ningú.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getFrenchEmailTemplate(name: string, code: string): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code de vérification</title>
        <style>
            body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #2D5016; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2D5016; }
            .code-container { 
                background-color: #F5F7F0; 
                border: 2px solid #2D5016; 
                border-radius: 12px; 
                padding: 20px; 
                text-align: center; 
                margin: 30px 0;
            }
            .code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #2D5016; 
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Menuteca</div>
            </div>
            
            <h2>Code de vérification</h2>
            
            <p>Bonjour ${name},</p>
            
            <p>Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte Menuteca.</p>
            
            <p>Utilisez le code de vérification suivant pour continuer :</p>
            
            <div class="code-container">
                <div class="code">${code}</div>
            </div>
            
            <p>Ce code expirera dans 10 minutes pour des raisons de sécurité.</p>
            
            <p>Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet email en toute sécurité.</p>
            
            <p>Cordialement,<br>L'équipe Menuteca</p>
            
            <div class="footer">
                <p>Ce code est confidentiel. Ne le partagez avec personne.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getSpanishTextTemplate(name: string, code: string): string {
	return `
    Código de verificación - Menuteca

    Hola ${name},

    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Menuteca.

    Tu código de verificación es: ${code}

    Este código expirará en 10 minutos por razones de seguridad.

    Si no solicitaste este cambio, puedes ignorar este email de forma segura.

    Saludos,
    El equipo de Menuteca
  `;
}

function getEnglishTextTemplate(name: string, code: string): string {
	return `
    Verification Code - Menuteca

    Hello ${name},

    We received a request to reset the password for your Menuteca account.

    Your verification code is: ${code}

    This code will expire in 10 minutes for security reasons.

    If you didn't request this change, you can safely ignore this email.

    Best regards,
    The Menuteca Team
  `;
}

function getCatalanTextTemplate(name: string, code: string): string {
	return `
    Codi de verificació - Menuteca

    Hola ${name},

    Hem rebut una sol·licitud per restablir la contrasenya del teu compte a Menuteca.

    El teu codi de verificació és: ${code}

    Aquest codi expirarà en 10 minuts per motius de seguretat.

    Si no has sol·licitat aquest canvi, pots ignorar aquest email de forma segura.

    Salutacions,
    L'equip de Menuteca
  `;
}

function getFrenchTextTemplate(name: string, code: string): string {
	return `
    Code de vérification - Menuteca

    Bonjour ${name},

    Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte Menuteca.

    Votre code de vérification est : ${code}

    Ce code expirera dans 10 minutes pour des raisons de sécurité.

    Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet email en toute sécurité.

    Cordialement,
    L'équipe Menuteca
  `;
}
