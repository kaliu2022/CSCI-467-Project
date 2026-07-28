-- Quote_line_items table
-- Requires quotes and items to already exist

CREATE TABLE IF NOT EXISTS quote_line_items (
    quote_id INT NOT NULL,
    item_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (quote_id, item_id),
    FOREIGN KEY (quote_id) REFERENCES quotes(quote_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

INSERT INTO quote_line_items (quote_id, item_id, price, quantity) VALUES
(1, 1, 9.99, 3),
(1, 2, 14.50, 1),
(2, 3, 3.25, 10),
(3, 1, 9.99, 2),
(3, 2, 14.50, 4),
(4, 1, 9.99, 3),
(4, 2, 14.50, 2);
