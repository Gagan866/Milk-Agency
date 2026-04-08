CREATE TABLE IF NOT EXISTS prices (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    customer_type_id BIGINT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_prices_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_prices_customer_type FOREIGN KEY (customer_type_id) REFERENCES customer_types(id),
    CONSTRAINT uk_prices_product_customer_type UNIQUE (product_id, customer_type_id)
);
