-- Items table (product catalog)

CREATE TABLE IF NOT EXISTS items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

INSERT INTO items (item_id, description, price) VALUES
(1, 'Widget', 9.99),
(2, 'Gadget', 14.50),
(3, 'Bracket', 3.25);
