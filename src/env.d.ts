/// <reference types='vite/client' />
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

/**
 * Environment variables
 */
interface ImportMetaEnv {
	/// REST API base URL
	VITE_API_BASE_URL: string
	/// Default language
	VITE_I18N_LOCALE: string
	/// Fallback language
	VITE_I18N_FALLBACK_LOCALE: string
	/// Matomo enablement
	VITE_MATOMO_ENABLED: boolean
	/// Matomo host
	VITE_MATOMO_HOST: string
	/// Matomo site ID
	VITE_MATOMO_SITEID: number
	/// Sentry enablement
	VITE_SENTRY_ENABLED: boolean
	/// Sentry DSN
	VITE_SENTRY_DSN: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
