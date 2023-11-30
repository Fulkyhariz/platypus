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

INSERT INTO promotions (promotion_type,promotion_scope,promo_name,voucher_code,amount, quota, max_amount ,start_date,end_date,created_at,updated_at,deleted_at) VALUES
	 ('DISC','GLOBAL','Promo Lebaran','LEBARANANJAY',0.2, 3, 20000,          '2023-11-12 00:00:00','2023-11-17 00:00:00','2023-11-20 15:36:17.579427','2023-11-20 15:36:17.579427',NULL),
	 ('CUT','GLOBAL','Gratis Ongkir','GRATISONGKIR',10000.0,  3, NULL,          '2023-11-18 00:00:00','2023-11-30 00:00:00','2023-11-20 15:36:17.579427','2023-11-20 15:36:17.579427',NULL),
	 ('DISC','GLOBAL','Promo Lebaran','LEBARANANJAY',0.2,3, 20000,          '2023-11-18 00:00:00','2023-11-30 00:00:00','2023-11-20 15:36:17.579427','2023-11-20 15:36:17.579427',NULL),
	 ('CUT','GLOBAL','Gratis Ongkir','GRATISONGKIR123',10000.0, 3, NULL,          '2023-11-29 00:00:00','2023-11-30 00:00:00','2023-11-20 15:36:17.579427','2023-11-20 15:36:17.579427',NULL),
	 ('CUT','MERCHANT','Gratis Ongkir','GRATISONGKIR',10000.0,3, NULL,          '2023-11-18 00:00:00','2023-11-30 00:00:00','2023-11-20 15:36:17.579427','2023-11-20 15:36:17.579427',NULL),
	 ('DISC','MERCHANT','Promo Lebaran','LEBARANANJAY',0.2,3, 20000,         '2023-11-18 00:00:00','2023-11-30 00:00:00','2023-11-20 15:36:17.579427','2023-11-20 15:36:17.579427',NULL),
	 ('CUT','PRODUCT','Gratis Ongkir','ONGKIRCOFFEE',10000.0, 3, NULL,          '2023-11-18 00:00:00','2023-11-30 00:00:00','2023-11-21 13:22:27.935266','2023-11-21 13:22:27.935266',NULL),
	 ('DISC','PRODUCT','Promo Lebaran','DISKONCOFFEE',0.2,3, 10000,          '2023-11-18 00:00:00','2023-11-30 00:00:00','2023-11-21 13:22:27.935266','2023-11-21 13:22:27.935266',NULL);

INSERT INTO merchant_product_promotions (merchant_id,product_id,promotion_id,created_at,updated_at,deleted_at) VALUES
	 (1,NULL,   5,'2023-11-21 13:26:01.531679','2023-11-21 13:26:01.531679',NULL),
	 (12,NULL,  6,'2023-11-24 13:52:52.783964','2023-11-24 13:52:52.783964',NULL),
	 (11,6,     8,'2023-11-21 13:26:01.531679','2023-11-21 13:26:01.531679',NULL),
	 (11,6,     7,'2023-11-21 13:26:01.531679','2023-11-21 13:26:01.531679',NULL);


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

CREATE TYPE order_status AS ENUM ('Waiting for Seller', 'Canceled', 'Processed', 'On Delivery', 'Delivered', 'Received', 'Completed', 'Reviewed');

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


-- ==== DATA SEEDING ===

-- COURIERS
INSERT INTO couriers(name, description) VALUES ('jne', 'JNE'), ('pos', 'POS Indonesia'), ('tiki', 'TIKI');

-- CATEGORIES
-- LEVEL 1
INSERT INTO categories_lv1(name, category_icon) VALUES
('Electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Food & Beverages', 'https://images.unsplash.com/photo-1632687380457-05a1271e873b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Automotive', 'https://images.unsplash.com/photo-1599082267768-4815b2ea6bd2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dHlyZXxlbnwwfHwwfHx8MA%3D%3D'),
('Health', 'https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Fashion', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tZW4lMjBjbG90aGluZ3xlbnwwfHwwfHx8MA%3D%3D'),
('Hobbies', 'https://images.unsplash.com/photo-1578353022142-09264fd64295?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2V3aW5nJTIwbWFjaGluZXxlbnwwfHwwfHx8MA%3D%3D'),
('Home & Decorations', 'https://images.unsplash.com/photo-1587145990306-28960c0cb77b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGRlY29yYXRpb258ZW58MHx8MHx8fDA%3D'),
('Beauty', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Vouchers', 'https://images.unsplash.com/photo-1600134637836-9d015f520941?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGlja2V0fGVufDB8fDB8fHww'),
('Books and Stationaries', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1546&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Others', NULL);

-- LEVEL 2
-- LV-2 FOR Electronics
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Home Appliances', 'LV-1-1'),
('Kitchen Appliances', 'LV-1-1'),
('Office Electronics', 'LV-1-1'),
('TV & Accessories', 'LV-1-1'),
('Telephones', 'LV-1-1');

-- LV-2 FOR Food & Beverages
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Fruits', 'LV-1-2'),
('Vegetables', 'LV-1-2'),
('Meats', 'LV-1-2'),
('Seafoods', 'LV-1-2'),
('Frozen Foods', 'LV-1-2'),
('Canned Foods', 'LV-1-2'),
('Cakes', 'LV-1-2'),
('Snacks', 'LV-1-2'),
('Eggs', 'LV-1-2'),
('Dairy Products', 'LV-1-2'),
('Grains', 'LV-1-2'),
('Oils', 'LV-1-2'),
('Spices & Cooking Ingredients', 'LV-1-2'),
('Flours', 'LV-1-2'),
('Beverages', 'LV-1-2');

-- LV-2 FOR Automotive
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Motorbike Accessories', 'LV-1-3'),
('Car Exteriors', 'LV-1-3'),
('Vehicle Maintenance', 'LV-1-3'),
('Vehicle Tools', 'LV-1-3'),
('Motorbike Spare Parts', 'LV-1-3'),
('Car Spare Parts', 'LV-1-3'),
('Lubricants', 'LV-1-3'),
('Helmets', 'LV-1-3'),
('Rider Accessories', 'LV-1-3');

-- LV-2 FOR Health
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Women''s Health', 'LV-1-4'),
('Medicines', 'LV-1-4'),
('Vitamins', 'LV-1-4'),
('Supplements', 'LV-1-4'),
('Medical Equipments', 'LV-1-4'),
('Adults', 'LV-1-4'),
('Hygiene Kits', 'LV-1-4'),
('Pregnancy and Fertility', 'LV-1-4');

-- LV-2 FOR Fashion
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Men''s Accessories', 'LV-1-5'),
('Women''s Accessories', 'LV-1-5'),
('Men''s Tops', 'LV-1-5'),
('Women''s Tops', 'LV-1-5'),
('Men''s Bottoms', 'LV-1-5'),
('Women''s Bottoms', 'LV-1-5'),
('Men''s Jewelries', 'LV-1-5'),
('Women''s Jewelries', 'LV-1-5'),
('Men''s Underwears', 'LV-1-5'),
('Women''s Underwears', 'LV-1-5'),
('Bags', 'LV-1-5'),
('Headwears', 'LV-1-5'),
('Outerwears', 'LV-1-5'),
('Shoes & Footwears', 'LV-1-5');

-- LV-2 FOR Hobbies
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Figures', 'LV-1-6'),
('Model Kits', 'LV-1-6'),
('Fishing Equipments', 'LV-1-6'),
('Art Supplies', 'LV-1-6'),
('Board Games', 'LV-1-6'),
('Card Games', 'LV-1-6'),
('Board Games', 'LV-1-6'),
('Puzzles', 'LV-1-6'),
('Diecasts', 'LV-1-6'),
('Stress Relief Toys', 'LV-1-6');

-- LV-2 FOR Home & Decorations
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Decorations', 'LV-1-7'),
('Furnitures', 'LV-1-7'),
('Bathroom', 'LV-1-7'),
('Bedroom', 'LV-1-7'),
('Living room', 'LV-1-7'),
('Garden', 'LV-1-7'),
('Hygiene', 'LV-1-7'),
('Laundry', 'LV-1-7'),
('Household Needs', 'LV-1-7'),
('Storages', 'LV-1-7');

-- LV-2 FOR Beauty
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Face Make-up', 'LV-1-8'),
('Lip Color & Lip Care', 'LV-1-8'),
('Nail Care', 'LV-1-8'),
('Hair Accessories', 'LV-1-8'),
('Brush Applicator', 'LV-1-8'),
('Nail Care', 'LV-1-8'),
('Eyebrow Kits', 'LV-1-8'),
('Make-up Tools', 'LV-1-8'),
('Hair Styling', 'LV-1-8'),
('Make-up Cleaning', 'LV-1-8'),
('Nail Care', 'LV-1-8'),
('Eye Make-up', 'LV-1-8'),
('Beauty Supplements', 'LV-1-8'),
('Face Treatment', 'LV-1-8'),
('Beauty Mask', 'LV-1-8');

-- LV-2 FOR Vouchers
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Events', 'LV-1-9'),
('Travel & Tour', 'LV-1-9'),
('Data', 'LV-1-9'),
('Phone Credit', 'LV-1-9');

-- LV-2 FOR Books & Stationaries
INSERT INTO categories_lv2 (name, category_lv1_id) VALUES
('Stationary', 'LV-1-10'),
('Notebooks & Papers', 'LV-1-10'),
('Magazines', 'LV-1-10'),
('Children''s Books', 'LV-1-10'),
('Educational Books', 'LV-1-10'),
('Non-Fictions', 'LV-1-10'),
('Fictions', 'LV-1-10'),
('Comics & Manga', 'LV-1-10');

-- LEVEL 3
-- LV-3 FOR Electronics
INSERT INTO categories_lv3 (name, category_lv2_id) VALUES
('Clothes Dryer', 'LV-2-1'),
('Hand Blower', 'LV-2-1'),
('Washing Machine', 'LV-2-1'),
('Clothes Iron', 'LV-2-1'),
('Vacuum Cleaner', 'LV-2-1'),
('Blender & Chopper', 'LV-2-2'),
('Air Fryer', 'LV-2-2'),
('Dish Dryer', 'LV-2-2'),
('Dishwasher', 'LV-2-2'),
('Water Dispenser', 'LV-2-2'),
('Juicer', 'LV-2-2'),
('Electric Stove', 'LV-2-2'),
('Refrigerator', 'LV-2-2'),
('Microwave', 'LV-2-2'),
('Mixer', 'LV-2-2'),
('Multicooker', 'LV-2-2'),
('Electric Oven', 'LV-2-2'),
('Rice Cooker', 'LV-2-2'),
('Electric Steamer', 'LV-2-2'),
('Electric Kettle', 'LV-2-2'),
('Toaster & Sandwich Maker', 'LV-2-2'),
('Attendance Machine', 'LV-2-3'),
('Fax Machine', 'LV-2-3'),
('Photocopy Machine', 'LV-2-3'),
('Money Counter', 'LV-2-3'),
('Binding Machine', 'LV-2-3'),
('Cash Register', 'LV-2-3'),
('Laminating Machine', 'LV-2-3'),
('Paper Shredder', 'LV-2-3'),
('RFID Reader', 'LV-2-3'),
('TV Antenna & Satellite Disk', 'LV-2-4'),
('TV Bracket', 'LV-2-4'),
('Cables and Connectors', 'LV-2-4'),
('TV Signal Booster', 'LV-2-4'),
('TV Receiver', 'LV-2-4'),
('TV Remote', 'LV-2-4'),
('TV Box', 'LV-2-4'),
('TV', 'LV-2-4'),
('Phone Cables & Connectors', 'LV-2-5'),
('Telephone', 'LV-2-5'),
('Cable Phone', 'LV-2-5'),
('Satellite Phone', 'LV-2-5'),
('Wireless Phone', 'LV-2-5'),
('Walkie Talkie', 'LV-2-5');

-- LV-3 FOR Food & Beverages
INSERT INTO categories_lv3 (name, category_lv2_id) VALUES
('Frozen Fruits', 'LV-2-6'),
('Fresh Fruits', 'LV-2-6'),
('Broccoli', 'LV-2-7'),
('Beans', 'LV-2-7'),
('Chili', 'LV-2-7'),
('Champignon', 'LV-2-7'),
('Enoki', 'LV-2-7'),
('Cauliflower', 'LV-2-7'),
('Cabbage', 'LV-2-7'),
('Pumpkin', 'LV-2-7'),
('Paprika', 'LV-2-7'),
('Frozen Vegetables', 'LV-2-7'),
('Lettuce', 'LV-2-7'),
('Celery', 'LV-2-7'),
('Shitake', 'LV-2-7'),
('Bean Sprouts', 'LV-2-7'),
('Eggplant', 'LV-2-7'),
('Cucumber', 'LV-2-7'),
('Tomato', 'LV-2-7'),
('Carrot', 'LV-2-7'),
('Chicken', 'LV-2-8'),
('Lamb', 'LV-2-8'),
('Beef', 'LV-2-8'),
('Pork', 'LV-2-8'),
('Steak', 'LV-2-8'),
('Nuggets', 'LV-2-8'),
('Sausages', 'LV-2-8'),
('Processed Meats', 'LV-2-8'),
('Salt Water Fish', 'LV-2-9'),
('Fresh Water Fish', 'LV-2-9'),
('Squid', 'LV-2-9'),
('Shellfish', 'LV-2-9'),
('Udang', 'LV-2-9'),
('Sausages', 'LV-2-10'),
('Desserts', 'LV-2-10'),
('Canned Fruits', 'LV-2-11'),
('Canned Meats', 'LV-2-11'),
('Canned Fish', 'LV-2-11'),
('Canned Instant Foods', 'LV-2-11'),
('Canned Fruits', 'LV-2-11'),
('Pastry', 'LV-2-12'),
('Birthday Cake', 'LV-2-12'),
('Biscuits & Wafers', 'LV-2-13'),
('Frozen Snacks', 'LV-2-13'),
('Chocolate', 'LV-2-13'),
('Peanut', 'LV-2-13'),
('Chips', 'LV-2-13'),
('Candies', 'LV-2-13'),
('Pudding & Jelly', 'LV-2-13'),
('Chicken Egg', 'LV-2-14'),
('Duck Egg', 'LV-2-14'),
('Quail Egg', 'LV-2-14'),
('Cheese', 'LV-2-15'),
('Butter & Margarine', 'LV-2-15'),
('Powdered Milk', 'LV-2-15'),
('Condensed Milk', 'LV-2-15'),
('Whip Cream', 'LV-2-15'),
('Yogurt', 'LV-2-15'),
('Wheat', 'LV-2-16'),
('Rice', 'LV-2-16'),
('Oat', 'LV-2-16'),
('Barley', 'LV-2-16'),
('Salt & Pepper', 'LV-2-18'),
('Sugar', 'LV-2-18'),
('Vinegar', 'LV-2-18'),
('Broth & Flavorings', 'LV-2-18'),
('Mayonnaise', 'LV-2-18'),
('Herbs', 'LV-2-18'),
('Sauces & Dressings', 'LV-2-18'),
('Mineral Water', 'LV-2-20'),
('Powdered Drink', 'LV-2-20'),
('Energy Drink', 'LV-2-20'),
('Juice', 'LV-2-20'),
('Coffee', 'LV-2-20'),
('Honey', 'LV-2-20'),
('Traditional Drink', 'LV-2-20'),
('Syrup', 'LV-2-20'),
('Soft Drink', 'LV-2-20'),
('Tea', 'LV-2-20');

-- LV-3 FOR Health
INSERT INTO categories_lv3 (name, category_lv2_id) VALUES
('Menstrual Medicine', 'LV-2-30'),
('Feminine Supplement', 'LV-2-30'),
('Allergy Medicine', 'LV-2-31'),
('Anti-pain Medication', 'LV-2-31'),
('Antibiotics & Anti-fungal drugs', 'LV-2-31'),
('Antivirus', 'LV-2-31'),
('Asthma Medication', 'LV-2-31'),
('Cough & Cold Medicine', 'LV-2-31'),
('Diabetes Medicine', 'LV-2-31'),
('Herbal Medicine', 'LV-2-31'),
('Cholesterol Medicine', 'LV-2-31'),
('Maternal & Child Medicine', 'LV-2-31'),
('Skin & Hair Medicine', 'LV-2-31'),
('Eye Medicine', 'LV-2-31'),
('Mouth Medicine', 'LV-2-31'),
('Digestive Medicine', 'LV-2-31'),
('Muscle, Bone & Joint Medicine', 'LV-2-31'),
('Headache & Fever Medicine', 'LV-2-31'),
('Vitamin A', 'LV-2-32'),
('Vitamin B', 'LV-2-32'),
('Vitamin C', 'LV-2-32'),
('Vitamin D', 'LV-2-32'),
('Vitamin E', 'LV-2-32'),
('Immune System', 'LV-2-32'),
('Calcium', 'LV-2-32'),
('Children''s Vitamin', 'LV-2-32'),
('Babies'' Vitamin', 'LV-2-32'),
('Pregnancy Vitamin', 'LV-2-32'),
('Thermometer', 'LV-2-34'),
('Body Scales', 'LV-2-34'),
('First Aid Kit', 'LV-2-34'),
('Thermometer', 'LV-2-34'),
('Visual Aids', 'LV-2-34'),
('Hearing Aids', 'LV-2-34'),
('Breathing Aids', 'LV-2-34'),
('Movement Support Devices', 'LV-2-34'),
('Diagnostic Tools', 'LV-2-34'),
('Sexual Aids', 'LV-2-35'),
('Contraceptions', 'LV-2-35'),
('Lubricants', 'LV-2-35'),
('Pregnancy Test', 'LV-2-37'),
('Fertility Test', 'LV-2-37');
