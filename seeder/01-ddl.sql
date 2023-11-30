-- DDL

CREATE TYPE gender AS ENUM ('M', 'F');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    gender gender,
    date_of_birth DATE,
    is_seller BOOL NOT NULL DEFAULT FALSE,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE FUNCTION generate_wallet_id(id INT)
returns INT
as
$$
  SELECT 2120000000000000 + id;
$$
language sql
immutable;

CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    wallet_id VARCHAR(16) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL NOT NULL DEFAULT 0,
    pin VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id VARCHAR(16) NOT NULL,
    recipient_id VARCHAR(16) NOT NULL,
    sender_id VARCHAR(16),
    amount DECIMAL NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255),
    phone_number VARCHAR(20),
    province VARCHAR(255) NOT NULL,
    province_code INT NOT NULL,
    district VARCHAR(255) NOT NULL,
    district_code INT NOT NULL,
    sub_district VARCHAR(255) NOT NULL,
    sub_sub_district VARCHAR(255) NOT NULL,
    zip_code INT NOT NULL,
    details VARCHAR NOT NULL,
    is_shop_location BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE merchants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    rating float NOT NULL DEFAULT 0,
    opening_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL UNIQUE,
    photo VARCHAR(255),
    banner TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE couriers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE FUNCTION generate_category_id(lvl int, id varchar)
returns text
as
$$
  SELECT 'LV-' ||to_char(lvl,'FM0')|| '-' || id;
$$
language sql
immutable;

CREATE SEQUENCE category_seq1;
CREATE TABLE categories_lv1  (
  seq_id varchar NOT NULL PRIMARY KEY DEFAULT NEXTVAL ('category_seq1'),
  id VARCHAR(100) GENERATED ALWAYS AS ( generate_category_id(1,seq_id)) stored,
  name varchar not null,
  category_icon TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE SEQUENCE category_seq2;
create table categories_lv2 (
        seq_id VARCHAR NOT NULL PRIMARY KEY DEFAULT NEXTVAL ('category_seq2'),
        id VARCHAR(100) GENERATED ALWAYS AS ( generate_category_id(2,seq_id)) stored,
    category_lv1_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE SEQUENCE category_seq3;
create table categories_lv3 (
        seq_id VARCHAR NOT NULL PRIMARY KEY DEFAULT NEXTVAL ('category_seq3'),
        id VARCHAR(100) GENERATED ALWAYS AS ( generate_category_id(3,seq_id)) stored,
    category_lv2_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    title VARCHAR NOT NULL,
    video VARCHAR,
    description TEXT NOT NULL,
    length FLOAT NOT NULL DEFAULT 0,
    width FLOAT NOT NULL DEFAULT 0,
    height FLOAT NOT NULL DEFAULT 0,
    weight FLOAT NOT NULL DEFAULT 0,
    is_used BOOL NOT NULL DEFAULT FALSE,
    is_hazardous BOOL NOT NULL DEFAULT FALSE,
    total_sold INT NOT NULL DEFAULT 0,
    fav_count INT NOT NULL DEFAULT 0,
    average_rating FLOAT NOT NULL DEFAULT 0,
    total_rating int not null default 0,
    total_stock INT NOT NULL DEFAULT 0,
    is_active BOOL NOT NULL DEFAULT TRUE,
    category_lv1_id VARCHAR NOT NULL,
    category_lv2_id VARCHAR,
    category_lv3_id VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE product_couriers (
    id BIGSERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    courier_id VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TYPE promotion_types AS ENUM ('DISC', 'CUT');

CREATE TYPE promotion_scopes AS ENUM ('GLOBAL', 'MERCHANT', 'PRODUCT');

CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    banner TEXT,
    promotion_type promotion_types NOT NULL,
    promotion_scope promotion_scopes NOT NULL,
    promo_name VARCHAR NOT NULL,
    voucher_code VARCHAR NOT NULL,
    amount FLOAT NOT NULL,
    quota INT NOT NULL,
    max_amount FLOAT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE merchant_product_promotions (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT,
    product_id BIGINT,
    promotion_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_detail_id BIGINT not null,
    rating INT NOT NULL,
    photos VARCHAR default NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE product_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE variant_groups (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT not null,
    group_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE variant_types (
    id BIGSERIAL PRIMARY KEY,
    variant_group_id BIGINT NOT NULL,
    type_name VARCHAR(255) NOT NULL,
    variant_image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE variant_combinations (
    id BIGSERIAL PRIMARY KEY,
    variant_type_parent_id BIGINT NOT NULL,
    variant_type_child_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

create table variant_combination_products(
        id BIGSERIAL primary key,
        product_id BIGINT not null,
        variant_combination_id BIGINT not null,
        stock INT not null,
        price decimal not NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
);

CREATE TABLE cart_products (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    variant_combination_product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    voucher_id BIGINT,
    initial_price DECIMAL NOT NULL,
    final_price DECIMAL NOT NULL,
    order_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TYPE order_status AS ENUM ('Waiting for Seller', 'Canceled', 'Processed', 'On Delivery', 'Delivered', 'Received', 'Completed');

CREATE TABLE order_details (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    merchant_id BIGINT NOT NULL,
    courier_id VARCHAR NOT NULL,
    order_status order_status NOT NULL,
    estimated_time TIMESTAMP NOT NULL,
    address varchar NOT NULL,
    courier_price DECIMAL NOT NULL,
    initial_price DECIMAL NOT NULL,
    final_price DECIMAL NOT NULL,
    voucher_id BIGINT,
    invoice VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE order_detail_products (
    id BIGSERIAL PRIMARY KEY,
    order_detail_id BIGINT NOT NULL,
    variant_combination_product_id BIGINT not null,
    quantity INT NOT NULL,
    initial_price DECIMAL NOT NULL,
    final_price DECIMAL NOT NULL,
    name varchar NOT NULL,
    description text NOT NULL,
    price decimal NOT NULL,
    merchant_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    wallet_history_id BIGINT NOT NULL UNIQUE,
    order_detail_id BIGINT NOT NULL UNIQUE,
    payment_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE merchant_addresses (
    id BIGINT PRIMARY KEY,
    merchant_id int NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    gender gender,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE product_photos (
    id BIGSERIAL PRIMARY KEY,
    is_default BOOL DEFAULT FALSE,
    product_id BIGINT NOT NULL,
    url text NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE product_photo_orders (
    id BIGSERIAL PRIMARY KEY,
    is_default BOOL DEFAULT FALSE,
    order_detail_product_id BIGINT NOT NULL,
    url text NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE product_review_photos (
    id BIGSERIAL PRIMARY KEY,
    product_review_id BIGINT NOT NULL,
    url text NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
