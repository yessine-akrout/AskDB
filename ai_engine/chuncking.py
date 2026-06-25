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

question = "give me Orders CustomerID sales"

question = question.lower()

cleaned = ""
for char in question:
    if char.isalnum() or char == " ":
        cleaned += char
    else:
        cleaned += " "

words = cleaned.split()

useless_words = ["show", "all", "the", "in", "from", "give", "list", "me", "of","number"]
clean_question = [word for word in words if word not in useless_words]

print(clean_question)

results = {}

for chunk in chunks:
    chunk_lower = chunk.lower()
    chunk_name = chunk_lower.split("\n")[0]
    chunk_description=chunk_lower[chunk.find("description"):chunk.find("columns")]
    chunk_columns=chunk_lower[chunk.find("columns"):chunk.find("relationships")]

    score = 0
    matched_words = []

    for word in clean_question:
        if word in chunk_name:
            score+=3
            matched_words.append(word)
            continue

        if word in chunk_description:
            score+=2
            matched_words.append(word)
            continue

        if word in chunk_columns:
            score+=1
            matched_words.append(word)
            continue


    results[chunk_name] = {
        "score": score,
        "matched_words": matched_words
    }

print(results)