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

import {ApiClient} from '@/services/ApiClient';

/**
 * OpenAPI service
 */
export class OpenApiService extends ApiClient {

	/**
	 * Returns OpenAPI specification
	 * @return {object} OpenAPI specification
	 */
	public getSpecification(): Promise<object> {
		return this.getClient().get('/openapi')
			.then((response: AxiosResponse): object => {
				const regEx: RegExp = /https:\/\/sbc-pdu\.romanondracek\.cz\/apiSchemas\/(requests|responses)\/(\w*)\.json/g;
				const replacement: string = import.meta.env.VITE_API_BASE_URL + '/openapi/schemas/$1/$2';
				const spec = JSON.parse(JSON.stringify(response.data).replaceAll(regEx, replacement));
				spec.servers[0] = {url: import.meta.env.VITE_API_BASE_URL};
				return spec;
			});
	}

}
