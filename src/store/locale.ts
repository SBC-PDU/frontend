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
import {defineStore} from 'pinia';
import {preferredLocale} from 'preferred-locale';

import LocaleHelper from '@/helpers/localeHelper';
import i18n from '@/plugins/i18n';

/**
 * Locale store state
 */
interface LocaleState {
	locale: string;
}

/**
 * Locale
 */
interface Locale {
	/// Locale code
	code: string;
	/// Locale Unicode flag
	flag: string;
}

export const useLocaleStore = defineStore('locale', {
	state: (): LocaleState => ({
		locale: preferredLocale('en', ['cs', 'en'], {languageOnly: true}),
	}),
	actions: {
		/**
		 * Sets a new locale
		 * @param locale Locale to set
		 */
		setLocale(locale: string): void {
			// @ts-ignore
			i18n.global.locale.value = locale;
			this.locale = locale;
		}
	},
	getters: {
		/**
		 * Returns available locales
		 * @return {Locale[]} Available locales
		 */
		getAvailableLocales(): Locale[] {
			return [
				{code: 'cs', flag: '🇨🇿'},
				{code: 'en', flag: '🇬🇧'},
			];
		},
		/**
		 * Returns current locale code
		 * @param {LocaleState} state Current state
		 * @return {string} Current locale code
		 */
		getLocale(state: LocaleState): string {
			return state.locale;
		},
		/**
		 * Returns current locale flag
		 * @param {LocaleState} state Current state
		 * @return {string} Current locale flag
		 */
		getLocaleFlag(state: LocaleState): string {
			return LocaleHelper.getFlag(state.locale);
		},
	},
	persist: true,
});
