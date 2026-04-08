CREATE TABLE IF NOT EXISTS customer_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS areas (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_type_id BIGINT NOT NULL,
    area_id BIGINT NOT NULL,
    CONSTRAINT fk_customers_customer_type FOREIGN KEY (customer_type_id) REFERENCES customer_types(id),
    CONSTRAINT fk_customers_area FOREIGN KEY (area_id) REFERENCES areas(id)
);
