-- Sales associates table

CREATE TABLE IF NOT EXISTS sales_associates (
    associate_id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(150),
    accumulated_commission DECIMAL(10,2) DEFAULT 0.00
);

INSERT INTO sales_associates (associate_id, user_id, password, name, address, accumulated_commission) VALUES
('RE-112233', 'mjones', 'pass123', 'Maria Jones', '456 Oak Ave', 0.00),
('RE-334455', 'tking', 'pass456', 'Tyler King', '789 Pine Rd', 0.00),
('RE-556677', 'agarcia', 'pass789', 'Ana Garcia', '321 Elm St', 0.00),
('RE-676732', 'jsmith', 'test123', 'John Smith', '123 Main St', 10.76);
