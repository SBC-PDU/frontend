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
import {type AccountModify} from '@/types/account';
import {type SignedInUser} from '@/types/auth';
import {type UserTotp, type UserTotpAdd, type UserTotpRemove} from '@/types/totp';
import {type UserInfo} from '@/types/user';

/**
 * User account service
 */
export default class AccountService extends ApiClient {

	/**
	 * Returns information about logged-in user
	 * @return Information about logged-in user
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
	 * @param account Account data
	 * @return User data with JWT token
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
		})
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

	/**
	 * Lists user's TOTP tokens
	 * @return List of TOTP tokens
	 */
	public listTotp(): Promise<UserTotp[]> {
		return this.getClient().get('account/totp')
			.then((response: AxiosResponse<Record<string, string>[]>): UserTotp[] => {
				return response.data.map((item: Record<string, string>): UserTotp => {
					return {
						uuid: item.uuid,
						name: item.name,
						createdAt: new Date(item.createdAt),
						lastUsedAt: item.lastUsedAt !== null ? new Date(item.lastUsedAt) : null,
					};
				});
			});
	}

	/**
	 * Adds a new TOTP token
	 * @param totp TOTP token data
	 * @return Empty promise
	 */
	public addTotp(totp: UserTotpAdd): Promise<void> {
		return this.getClient().post('account/totp', {
			...totp,
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Removes a TOTP token
	 * @param uuid TOTP token UUID
	 * @param totp TOTP token removal confirmation
	 * @return Empty promise
	 */
	public removeTotp(uuid: string, totp: UserTotpRemove): Promise<void> {
		return this.getClient().delete(`account/totp/${uuid}`, {
			data: {
				...totp,
				baseUrl: BaseUrlHelper.get(),
			},
		});
	}

	/**
	 * Resends verification e-mail
	 * @return Empty promise
	 */
	public resendVerificationEmail(): Promise<void> {
		return this.getClient().post('account/verification/resend', {
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Verifies user's e-mail
	 * @param uuid Verification UUID
	 * @return User data with JWT token
	 */
	public verify(uuid: string): Promise<SignedInUser> {
		return this.getClient().post(`account/verification/${uuid}`)
			.then((response: AxiosResponse<SignedInUser>): SignedInUser => response.data);
	}

}
