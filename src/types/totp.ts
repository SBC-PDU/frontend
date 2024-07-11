/**
 * Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>
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

/**
 * TOTP detail response (base)
 */
export interface UserTotpBase {
	name: string;
	uuid: string;
}

/**
 * TOTP detail response
 */
export interface UserTotp extends UserTotpBase {
	createdAt: Date;
	lastUsedAt: Date|null;
}

/**
 * TOTP detail response
 */
export interface UserTotpRaw extends UserTotpBase {
	createdAt: string;
	lastUsedAt: string|null;
}

/**
 * TOTP add request
 */
export interface UserTotpAdd {
	code: string;
	name: string;
	password: string;
	secret: string;
}

/**
 * TOTP remove request
 */
export interface UserTotpRemove {
	code: string;
	password: string;
}
