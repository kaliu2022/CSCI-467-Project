-- Quotes table
-- Requires sales associates to already exist

CREATE TABLE IF NOT EXISTS quotes (
    quote_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    associate_id VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL DEFAULT '',
    status ENUM('draft', 'finalized', 'sanctioned', 'ordered') DEFAULT 'draft',
    discount_type ENUM('percent', 'amount') DEFAULT NULL,
    discount_value DECIMAL(10,2) DEFAULT 0.00,
    final_discount_value DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) DEFAULT NULL,
    secret_notes TEXT,
    po_number VARCHAR(50) DEFAULT NULL,
    processing_date DATE DEFAULT NULL,
    commission_rate DECIMAL(5,2) DEFAULT NULL,
    commission_amount DECIMAL(10,2) DEFAULT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (associate_id) REFERENCES sales_associates(associate_id)
);

INSERT INTO quotes (quote_id, customer_id, associate_id, status, discount_type, discount_value, final_amount, secret_notes, po_number, processing_date, commission_rate, created_date, customer_email, final_discount_value, commission_amount) VALUES
(1, 21, 'RE-112233', 'ordered', 'percent', 10.00, 40.02, NULL, 'PO-1-1784855056009', '2026-08-22', 5.00, '2026-07-20 12:51:44', 'van@celsius.net', 5.00, 1.75),
(2, 22, 'RE-334455', 'draft', NULL, 0.00, NULL, 'Follow up next week', NULL, NULL, NULL, '2026-07-20 12:54:09', 'clever@huland.net', 0.00, NULL),
(3, 23, 'RE-556677', 'finalized', NULL, 0.00, NULL, NULL, NULL, NULL, NULL, '2026-07-20 12:54:09', 'hackebeil@reams.tv', 0.00, NULL),
(4, 21, 'RE-112233', 'ordered', 'percent', 10.00, 53.07, NULL, 'PO-4-1784933073696', '2026-08-31', 18.00, '2026-07-24 17:37:22', 'van@celsius.net', 3.00, 9.01);
