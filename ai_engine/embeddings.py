from sentence_transformers import SentenceTransformer, util

chunks =["""Table: Orders

Description: Stores order information, sales related , showing IDs, dates , ship details

Columns:
         
- OrderID (Primary Key)
- CustomerID
- EmployeeID
- OrderDate
- RequiredDate
- ShippedDate
- ShipVia
- Freight
- ShipName
- ShipAddress
- ShipCity
- ShipRegion
- ShipPostalCode
- ShipCountry

Relationships:

- Orders.EmployeeID → Employees.EmployeeID""",
"""Table: Customers

Description: stores all customers personal information

Columns:

- CustomerID (Primary Key)
- CompanyName
- ContactName
- ContactTitle
- Address
- City
- Region
- PostalCode
- Country
- Phone
- Fax

Relationships:

- Customers.CustomerID → Orders.CustomerID
- Customers.CustomerID → CustomerCustomerDemo.CustomerID""",
"""Table: Employees

Description: stores employees personal information

Columns:

- EmployeeID (Primary Key)
- LastName
- FirstName
- Title
- TitleOfCourtesy
- BirthDate
- HireDate
- Address
- City
- Region
- PostalCode
- Country
- HomePhone
- Extension
- Photo
- Notes
- ReportsTo
- PhotoPath

- Relationships:

- Employees.EmployeeID → Employees.EmployeeID
- Employees.EmployeeID → Orders.EmployeeID
- Employees.EmployeeID → EmployeeTerritories.EmployeeID"""]

model = SentenceTransformer("all-MiniLM-L6-v2")
chunk_embeddings = model.encode(chunks)
question = "shipping cost of orders"
question_embedding = model.encode(question)
scores = util.cos_sim(question_embedding, chunk_embeddings)[0]
ranked_results = sorted(
    zip(chunks, scores),
    key=lambda x: x[1],
    reverse=True
)

for chunk, score in ranked_results:
    chunk_name = chunk.split("\n")[0]
    print(chunk_name, "→", float(score))