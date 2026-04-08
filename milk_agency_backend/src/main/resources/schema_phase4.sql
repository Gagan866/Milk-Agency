CREATE TABLE IF NOT EXISTS stocks (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS stock_items (
    id BIGSERIAL PRIMARY KEY,
    stock_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    CONSTRAINT fk_stock_items_stock FOREIGN KEY (stock_id) REFERENCES stocks(id),
    CONSTRAINT fk_stock_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);
