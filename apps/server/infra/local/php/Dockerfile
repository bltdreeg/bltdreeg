FROM php:8.3-cli

# intl: Filament; gd: laravel-crm; redis: cache/session/queue;
# opcache: required for artisan serve (CLI SAPI) or every request recompiles.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        $PHPIZE_DEPS \
        default-mysql-client \
        git \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" bcmath gd intl opcache pdo_mysql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/* /tmp/pear

COPY opcache.ini /usr/local/etc/php/conf.d/zz-opcache.ini
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN git config --global --add safe.directory '*'

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html
