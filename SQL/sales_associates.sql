-- Sales associates table

CREATE TABLE IF NOT EXISTS sales_associates (
    associate_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(150),
    accumulated_commission DECIMAL(10,2) DEFAULT 0.00
);

INSERT INTO sales_associates (associate_id, user_id, password, name, address, accumulated_commission) VALUES
('1', 'mjones', 'pass123', 'Maria Jones', '456 Oak Ave', 0.00),
('2', 'tking', 'pass456', 'Tyler King', '789 Pine Rd', 0.00),
('3', 'agarcia', 'pass789', 'Ana Garcia', '321 Elm St', 0.00),
('4', 'jsmith', 'test123', 'John Smith', '123 Main St', 10.76);
