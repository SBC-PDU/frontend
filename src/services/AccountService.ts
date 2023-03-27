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
import punycode from 'punycode/';

import BaseUrlHelper from '@/helpers/baseUrlHelper';
import {ApiClient} from '@/services/ApiClient';
import {AccountModify} from '@/types/account';
import {SignInResponse} from '@/types/auth';
import {UserInfo} from '@/types/user';

/**
 * User account service
 */
export default class AccountService extends ApiClient {

	/**
	 * Returns information about logged in user
	 * @return {Promise<UserInfo>} Information about logged in user
	 */
	public get(): Promise<UserInfo> {
		return this.getClient().get('account')
			.then((response: AxiosResponse): UserInfo => {
				const user = response.data as UserInfo;
				/// Convert email to unicode
				user.email = punycode.toUnicode(user.email);
				return user;
			});
	}

	/**
	 * Edits user account
	 * @param {AccountModify} account Account data
	 * @return {Promise<SignInResponse>} User data
	 */
	public edit(account: AccountModify): Promise<SignInResponse> {
		const body: AccountModify = account;
		body.email = punycode.toASCII(account.email);
		if (!account.changePassword) {
			delete body.oldPassword;
			delete body.newPassword;
		}
		return this.getClient().put('account', {
			...body,
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Resends verification e-mail
	 */
	public resendVerificationEmail(): Promise<void> {
		return this.getClient().post('account/verification/resend');
	}

	/**
	 * Verifies user's e-mail
	 */
	public verify(uuid: string): Promise<SignInResponse> {
		return this.getClient().post(`account/verification/${uuid}`)
			.then((response: AxiosResponse): SignInResponse => response.data as SignInResponse);
	}

}
