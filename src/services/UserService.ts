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
import { type AxiosResponse } from 'axios';
import * as punycode from 'punycode/';

import BaseUrlHelper from '@/helpers/baseUrlHelper';
import { ApiClient } from '@/services/ApiClient';
import { type UserInfo, type UserModify } from '@/types/user';

/**
 * User manager service
 */
export default class UserService extends ApiClient {

	/**
	 * Creates a new user
	 * @param user User to create
	 * @return Empty promise
	 */
	public create(user: UserModify): Promise<void> {
		return this.getClient().post('users', {
			...this.serializeUser(user),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Deletes a user
	 * @param id User ID to delete
	 * @return Empty promise
	 */
	public delete(id: number): Promise<void> {
		return this.getClient().delete(`users/${id}`);
	}

	/**
	 * Edits a user
	 * @param id User ID to edit
	 * @param user Modified user
	 * @return Empty promise
	 */
	public edit(id: number, user: UserModify): Promise<void> {
		return this.getClient().put(`users/${id}`, {
			...this.serializeUser(user),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Lists all users
	 * @return List of users
	 */
	public list(): Promise<UserInfo[]> {
		return this.getClient().get('users')
			.then((response: AxiosResponse<UserInfo[]>): UserInfo[] => {
				return response.data.map((user: UserInfo): UserInfo => {
					/// Convert email to unicode
					user.email = punycode.toUnicode(user.email);
					return user;
				});
			});
	}

	/**
	 * Blocks the user
	 * @param id ID of user to block
	 * @return Empty promise
	 */
	public block(id: number): Promise<void> {
		return this.getClient().post(`users/${id}/block`);
	}

	/**
	 * Unblocks the user
	 * @param id ID of user to unblock
	 * @return Empty promise
	 */
	public unblock(id: number): Promise<void> {
		return this.getClient().post(`users/${id}/unblock`);
	}

	/**
	 * Resends the invitation or verification email
	 * @param id ID of user to resend email
	 * @return Empty promise
	 */
	public resend(id: number): Promise<void> {
		return this.getClient().post(`users/${id}/resend`, {
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Serializes user identity
	 * @param user User entity to serialize
	 * @return Serialized user entity
	 */
	private serializeUser(user: UserModify): UserModify {
		/// Convert email to punycode
		user.email = punycode.toASCII(user.email);
		return user;
	}

}
