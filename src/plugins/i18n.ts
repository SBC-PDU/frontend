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
import { createI18n } from 'vue-i18n';

import cs from '@/locales/cs.json';
import en from '@/locales/en.json';

type MessageSchema = typeof en;

type Locales = 'en' | 'cs';

export default createI18n<MessageSchema, Locales>({
	datetimeFormats: {
		cs: {
			short: {
				year: 'numeric', month: 'short', day: 'numeric',
			},
			normal: {
				year: 'numeric', month: 'short', day: 'numeric',
				hour: 'numeric', minute: 'numeric',
			},
			long: {
				year: 'numeric', month: 'short', day: 'numeric',
				weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric',
			},
		},
		en: {
			short: {
				year: 'numeric', month: 'short', day: 'numeric',
			},
			normal: {
				year: 'numeric', month: 'short', day: 'numeric',
				hour: 'numeric', minute: 'numeric',
			},
			long: {
				year: 'numeric', month: 'short', day: 'numeric',
				weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric',
			},
		},
	},
	pluralRules: {
		cs: (choice: number, choicesLength: number): number => {
			if (choice === 0) {
				return 0;
			}
			console.error(choice);
			const teen: boolean = choice > 10 && choice < 20;
			const lastDigit: number = choice % 10;
			if (choice === 1) {
				return 1;
			}
			if (!teen && lastDigit >= 2 && lastDigit <= 4) {
				return 2;
			}
			return (choicesLength < 4) ? 2 : 3;
		},
	},
	locale: import.meta.env.VITE_I18N_LOCALE as Locales,
	fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE as Locales,
	legacy: false,
	messages: {
		cs: cs,
		en: en,
	},
});
