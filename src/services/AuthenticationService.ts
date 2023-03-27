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
import {AxiosResponse} from 'axios';
import * as punycode from 'punycode';

import BaseUrlHelper from '@/helpers/baseUrlHelper';
import {ApiClient} from '@/services/ApiClient';
import {Credentials, PasswordRecovery, SignInResponse} from '@/types/auth';

/**
 * Authentication service
 */
export default class AuthenticationService extends ApiClient {

	/**
	 * Requests password recovery
	 * @param {PasswordRecovery} recovery Password recovery parameters
	 */
	public passwordRecovery(recovery: PasswordRecovery): Promise<void> {
		return this.getClient().post('auth/password/recovery', {
			email: punycode.toASCII(recovery.email),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Signs in the user
	 * @param {Credentials} credentials User credentials
	 */
	public signIn(credentials: Credentials): Promise<SignInResponse> {
		return this.getClient().post('auth/sign/in', {
			email: punycode.toASCII(credentials.email),
			password: credentials.password,
		}).then((response: AxiosResponse): SignInResponse => (
			response.data as SignInResponse
		));
	}

}
