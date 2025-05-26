import { Language } from '../types/Language';

export default interface IUser {
	id?: string;
	email?: string;
	username?: string;
	createdAt: string;
	name?: string;
	photo?: string;
	hashedPassword?: string;
	googleId?: string;
	token?: string;
	language: Language;
	hasPassword?: boolean;
	deviceId?: string;
	thirdPartyAccount?: 'google' | 'apple';
	thirdPartyEmail?: string;
	websiteUrl?: string;
}
