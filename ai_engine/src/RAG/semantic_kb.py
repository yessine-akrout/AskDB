SEMANTIC_KB = {
    # -------------------------
    # Tables
    # -------------------------
    "customers": "corresponds to the Customers table",
    "clients": "corresponds to the Customers table",
    "orders": "corresponds to the Orders table",
    "sales": "mainly corresponds to Orders and Order Details tables",
    "products": "corresponds to the Products table",
    "suppliers": "corresponds to the Suppliers table",
    "employees": "corresponds to the Employees table",
    "staff": "corresponds to the Employees table",
    "shippers": "corresponds to the Shippers table",
    "categories": "corresponds to the Categories table",

    # -------------------------
    # Columns / business terms
    # -------------------------
    "customer name": "CompanyName column in Customers",
    "client name": "CompanyName column in Customers",
    "customer country": "Country column in Customers",
    "customer city": "City column in Customers",

    "order date": "OrderDate column in Orders",
    "shipping date": "ShippedDate column in Orders",
    "required date": "RequiredDate column in Orders",
    "shipping country": "ShipCountry column in Orders",
    "shipping city": "ShipCity column in Orders",
    "shipping cost": "Freight column in Orders",
    "freight": "Freight column in Orders",

    "product name": "ProductName column in Products",
    "product price": "UnitPrice column in Products",
    "unit price": "UnitPrice column in Products",
    "stock": "UnitsInStock column in Products",
    "quantity in stock": "UnitsInStock column in Products",
    "units ordered": "UnitsOnOrder column in Products",

    "employee name": "FirstName and LastName columns in Employees",
    "hire date": "HireDate column in Employees",

    # -------------------------
    # Business logic
    # -------------------------
    "total sales": "calculate SUM(Order Details.UnitPrice * Order Details.Quantity * (1 - Order Details.Discount))",
    "revenue": "calculate SUM(Order Details.UnitPrice * Order Details.Quantity * (1 - Order Details.Discount))",
    "sales amount": "calculate SUM(Order Details.UnitPrice * Order Details.Quantity * (1 - Order Details.Discount))",

    "number of orders": "calculate COUNT(Orders.OrderID)",
    "orders count": "calculate COUNT(Orders.OrderID)",
    "average product price": "calculate AVG(Products.UnitPrice)",

    "out of stock products": "Products where UnitsInStock = 0",
    "products in stock": "Products where UnitsInStock > 0",
    "discontinued products": "Products where Discontinued = 1",
    "available products": "Products where Discontinued = 0",

    "shipped orders": "Orders where ShippedDate IS NOT NULL",
    "not shipped orders": "Orders where ShippedDate IS NULL",
    "unshipped orders": "Orders where ShippedDate IS NULL",

    "expensive products": "Products with high UnitPrice",
    "cheap products": "Products with low UnitPrice",
    "recent orders": "Orders with recent OrderDate",
    "late orders": "Orders where ShippedDate > RequiredDate",

    # -------------------------
    # Join hints
    # -------------------------
    "orders by customer": "join Orders with Customers using Orders.CustomerID = Customers.CustomerID",
    "customer orders": "join Customers with Orders using Customers.CustomerID = Orders.CustomerID",
    "orders by employee": "join Orders with Employees using Orders.EmployeeID = Employees.EmployeeID",
    "products by supplier": "join Products with Suppliers using Products.SupplierID = Suppliers.SupplierID",
    "products by category": "join Products with Categories using Products.CategoryID = Categories.CategoryID",
    "orders with shipper": "join Orders with Shippers using Orders.ShipVia = Shippers.ShipperID",
    "order details": "join Orders with Order Details using Orders.OrderID = Order Details.OrderID",
    "ordered products": "join Order Details with Products using Order Details.ProductID = Products.ProductID",

    # -------------------------
    # Common query meanings
    # -------------------------
    "customers in germany": "Customers where Country = 'Germany'",
    "customers in france": "Customers where Country = 'France'",
    "suppliers in france": "Suppliers where Country = 'France'",
    "employees in london": "Employees where City = 'London'",
    "orders shipped to germany": "Orders where ShipCountry = 'Germany'",
    "orders shipped to france": "Orders where ShipCountry = 'France'"
}
