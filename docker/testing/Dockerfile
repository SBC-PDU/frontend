# Copyright 2022-2023 Roman Ondráček
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM debian:bullseye

ENV DEBIAN_FRONTEND noninteractive

RUN echo "deb http://deb.debian.org/debian/ bullseye main contrib non-free\n\
deb http://deb.debian.org/debian/ bullseye-updates main contrib non-free\n\
deb http://deb.debian.org/debian-security bullseye-security main\n\
deb http://ftp.debian.org/debian bullseye-backports main" > /etc/apt/sources.list

RUN apt-get update \
 && apt-get install --no-install-recommends -yqq build-essential ca-certificates curl git gnupg2 rsync wget \
 && curl -sL https://deb.nodesource.com/setup_lts.x | bash - \
 && apt-get update \
 && apt-get install --no-install-recommends -yqq nodejs \
 && npm install -g pnpm npm@~8 \
 && npm install -g @sentry/cli --unsafe-perm \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN echo "deb https://deb.debian.org/debian/ bullseye main contrib non-free\n\
deb https://deb.debian.org/debian/ bullseye-updates main contrib non-free\n\
deb https://deb.debian.org/debian-security bullseye-security main\n\
deb https://ftp.debian.org/debian bullseye-backports main" > /etc/apt/sources.list
