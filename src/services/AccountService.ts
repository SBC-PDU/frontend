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
import {SignedInUser} from '@/types/auth';
import {UserInfo} from '@/types/user';
import {UserTotp, UserTotpAdd, UserTotpRemove} from '@/types/totp';

/**
 * User account service
 */
export default class AccountService extends ApiClient {

	/**
	 * Returns information about logged-in user
	 * @return {Promise<UserInfo>} Information about logged-in user
	 */
	public get(): Promise<UserInfo> {
		return this.getClient().get('account')
			.then((response: AxiosResponse<UserInfo>): UserInfo => {
				const user: UserInfo = response.data;
				/// Convert email to unicode
				user.email = punycode.toUnicode(user.email);
				return user;
			});
	}

	/**
	 * Edits user account
	 * @param {AccountModify} account Account data
	 * @return {Promise<SignedInUser>} User data with JWT token
	 */
	public edit(account: AccountModify): Promise<SignedInUser> {
		const body: AccountModify = account;
		body.email = punycode.toASCII(account.email);
		if (!account.changePassword) {
			delete body.oldPassword;
			delete body.newPassword;
		}
		return this.getClient().put('account', {
			...body,
			baseUrl: BaseUrlHelper.get(),
		}).then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

	/**
	 * Lists user's TOTP tokens
	 * @return {Promise<UserTotp[]>} List of TOTP tokens
	 */
	public listTotp(): Promise<UserTotp[]> {
		return this.getClient().get('account/totp')
			.then((response: AxiosResponse<Record<string, string>[]>): UserTotp[] => {
				return response.data.map((item: Record<string, string>): UserTotp => {
					return {
						uuid: item.uuid,
						name: item.name,
						createdAt: new Date(item.createdAt),
					};
				});
			});
	}

	/**
	 * Adds a new TOTP token
	 * @param {UserTotpAdd} totp TOTP token data
	 */
	public addTotp(totp: UserTotpAdd): Promise<void> {
		return this.getClient().post('account/totp', {
			...totp,
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Removes a TOTP token
	 * @param {string} uuid TOTP token UUID
	 * @param {UserTotpRemove} totp TOTP token removal confirmation
	 */
	public removeTotp(uuid: string, totp: UserTotpRemove): Promise<void> {
		return this.getClient().delete(`account/totp/${uuid}`, {
			data: {
				...totp,
				baseUrl: BaseUrlHelper.get(),
			}
		});
	}

	/**
	 * Resends verification e-mail
	 */
	public resendVerificationEmail(): Promise<void> {
		return this.getClient().post('account/verification/resend', {
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Verifies user's e-mail
	 * @param {string} uuid Verification UUID
	 * @return {Promise<SignedInUser>} User data with JWT token
	 */
	public verify(uuid: string): Promise<SignedInUser> {
		return this.getClient().post(`account/verification/${uuid}`)
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

}
