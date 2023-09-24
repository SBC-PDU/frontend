/**
 * Copyright 2022-2023 Roman Ondráček
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {type AxiosResponse} from 'axios';
import * as punycode from 'punycode/';

import BaseUrlHelper from '@/helpers/baseUrlHelper';
import {ApiClient} from '@/services/ApiClient';
import {type Credentials, type PasswordRecovery, type PasswordSet, type SignedInUser} from '@/types/auth';

/**
 * Authentication service
 */
export default class AuthenticationService extends ApiClient {

	/**
	 * Requests password recovery
	 * @param recovery Password recovery parameters
	 * @return Empty promise
	 */
	public passwordRecovery(recovery: PasswordRecovery): Promise<void> {
		return this.getClient().post('auth/password/recovery', {
			email: punycode.toASCII(recovery.email),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Resets the password
	 * @param uuid Password reset request UUID
	 * @param reset Password reset parameters
	 * @return User info with JWT token
	 */
	public passwordReset(uuid: string, reset: PasswordSet): Promise<SignedInUser> {
		return this.getClient().post(`auth/password/reset/${uuid}`, reset)
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

	/**
	 * Sets the password of invited user
	 * @param uuid Password set request UUID
	 * @param set Password set parameters
	 * @return User info with JWT token
	 */
	public passwordSet(uuid: string, set: PasswordSet): Promise<SignedInUser> {
		return this.getClient().post(`auth/password/set/${uuid}`, set)
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

	/**
	 * Signs in the user
	 * @param credentials User credentials
	 * @return User info with JWT token
	 */
	public signIn(credentials: Credentials): Promise<SignedInUser> {
		const body = {
			email: punycode.toASCII(credentials.email),
			password: credentials.password,
			code: credentials.code ?? undefined,
		};
		if (['', null, undefined].includes(body.code)) {
			delete body.code;
		}
		return this.getClient().post('auth/sign/in', body)
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

	/**
	 * Extends the session
	 * @return User info with JWT token
	 */
	public extendSession(): Promise<SignedInUser> {
		return this.getClient().post('auth/token/refresh')
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

}
