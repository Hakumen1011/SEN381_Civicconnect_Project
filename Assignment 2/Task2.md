# Task 2

## 5.1
Our selected operation is the: request creation.
As the requesy creation operation is the main point of data entry that follows and gets used by multiple other operations and functions giving inccorect or parrtially completed data will make it difficult to follow and track back where an error was made, logs might have been saved already with the inccorect data and all operations that followed with the incorrect information will be flawed.


## 5.2) 
- Transaction/atomicity requirements:
When creating a request it may be a large follow down process throughout the database concerning multiple related database changes, for example creating a request does not only populate the request table but will also record its initial state or history. These changes should rather be seen as a single action where incomplete data can leave the system in an incorrect state. Atomicity is the rule that ensures a transaction’s operation completes successfully, or no transaction data is applied at all, an all or nothing operation (PostgreSQL Global Development Group, 2026).
For the chosen operation, Request creation having incomplete transactions executed and accepted will cause multiple issues for future actions, thus using transaction principle if an operation does execute with the proper and complete data but fails to complete through unknown reasons instead of incorrect data being stored a transaction can instead roll back the completed operation when the later operation executed and failed. This protects the data integrity of the request by preventing a partially completed creation (Microsoft, 2026).
Explicit transaction is not required for every database operation as Entity Framework Core automatically uses a transaction when multiple changes are made through a single SaveChanges call, rather than doing manual transaction generation relying on the automatic SaveChanges transaction is an option and manual transaction should rather be made when dealing with specific data or when required to do so (Microsoft, 2026).
Using transactions is greatly supported and suggested however good use of transactions and its principles should be followed. Operations working with multiple persistence steps and data should automatically be handled by SaveChanges. Request operation and multiple other operations may be done each in their own SaveChanges operation EF Core’s default transaction may be sufficient. If request creation does require multiple SaveChanges however and hold important data distributed and used through other operations it would be best to complete the operation as a single unit thus an explicit transaction should be considered and may be a strong recommendation.

-	Validation and Business rules enforcement:
Validation is required to prevent incorrect data to be entered, stored or processed, however different layers may have different forms of validation and strictness to their validation. OWASP distinguishes between syntactic validation, which checks whether data has an appropriate format, and semantic validation, which checks whether the data is meaningful within the application's business context (OWASP, 2026). For example checking if contents length is in an allowed length is syntactic while determining if a selected category is valid for a particular request is a business rule.
Client side validation can be an immediate affect by giving direct feedback to the user and prevent unnecessary submissions containing obvious errors. ASP.NET Core supports client-side validation that can prevent a form from being submitted until its validation requirements are satisfied (Microsoft, 2026). Even though adding validation to the Client UI side is done it is still able to be bypassed by simply disabling the JavaScript.
Application/Service validation is a good place to handle business rules to determine if the operation is logically valid and usable. For request creation this can be used to check if the appropriate business information is given, if a selected category is valid or if the request as a whole is allowed to enter in its current state. Values can be syntactically correct while still violating the application's business rules meaning that validation must consider the business rules and its data. (OWASP, 2026)
Database also gives a form of protection and validation by forcing data integrity constraints. PostgreSQL had rules such as NOT NULL, CHECK, UNIQE, primary key and foreign key constraints (PostgreSQL Global Development Group, 2026). This check from the database can prevent invalid data from being processed even if an application level check was incorrectly implemented or bypassed.
Based on these finding relying on one layer exclusively introduces consequences and problems. Relying on only client side gives better client experiences however this does not provide the strongest security because it is easily bypassed. Relying on only application validation is a strong validation method but database constraints along side it is also very useful as a final integration boundary. Relying solely on database constraints can properly and securely store the data however it offers close to none feedback to the users if data was inputted correctly and validated.

-	Relevant consistency, concurrency and integrity mechanisms:
Consistency, concurrency and integrity are important and should be kept in mind while creating the request as multiple records need to remain valid while multiple users are online and accessing the data. Because of database constraints such as primary keys and foreign keys helps maintain integrity by preventing records from referencing data that doesn’t exist (PostgreSQL Global Development Group, 2026).
Concurrency needs to be taken into account because when multiple users attempt to access, modify or delete data at the same time as well as requests overlapping should not be a problem. Without an appropriate concurrency mechanism a change from one user could overwrite the changes made from another user without the system detecting any errors or confits. Entity Framework Core supports optimistic concurrency, where a concurrency token can be used to detect whether data has changed since it was retrieved. If a conflict is detected, the application can reject or handle the conflicting update rather than silently overwriting existing data (Microsoft, 2026).

For CivicConnect these mechanisms provide protection in their own ways on different layers. The best and appropriate mechanisms should depend on which operation is currently being made and the risks it holds rather than giving a broad view or adding unnecessary complexity.


-	Performance techniques:
Caching can improve performance by reducing repeated database queries and the work required to generate response, having repeated memory to handle repetitive data can improve performance in some cases. cached data can become stale when the underlying database changes while an older value remains in the cache. Microsoft specifically identifies stale data as a concern when caching is used (Microsoft, 2026). 
For CivicConnect caching requests information or other frequently used data could create correctness problems as a request could be reassigned or its status changed in the database but because of stale data could give another user older cached version. This can result in users working on the incorrect data. ASP.NET Core also recommends that applications should not depend on cached data being available or current (Microsoft, 2026).
Based on the research caching might be an undesirable performance technique and should not be introduced for correctness critical request data without an actual performance need to it.
Database indexing however provides a more suitable performance technique for CivicConnect and might be usable for the persistence layer. Indexing can improve speed of frequent filters and searches but the trade off will require more maintenance during inserts and updates and should rather be applied to certain fields that are frequently queried (Microsoft, 2026).

- Plausible implementation approaches or responsibility allocations:

Based on the research done so far and its findings two approaches were highlighted that would follow the recommendations.
Application heavy vs Layered:
Application heavy is where we handle most of the validation and business rules in the application layer, while the database only provides basic constraints. This makes it easier to understand and test businesses rules in one place with its dependencies together and detailed error messages can be provided, however any bypassed data directly sent to the database will not be able to adhere to any of the business rules with its basic constraints (Microsoft, 2026).

Layered/database enforced:
Because multiple layers will be used to enforce business rules, handle transactions and the database independently enforces fundamental integrity through constraints. This gives protection at different levels and any failure with any of the protections calls for a transaction rollback. Because of the database protection even if application checks are bypassed the data will still be protected inside the database, however this requires much larger maintenance and testing across all the layers, harder to keep track of and have a difficult learning curve for integration (Microsoft, 2026).

For CivicConnect the layered approach is recommended because of its multiple protection layers as well as response to clients for validation done in the presentation layer. The application layer should be responsible for business rules and validation while the database will enforce data integrity by itself which for CivicConnect having multiple users that could slip through the business rules keep the data protected. Transaction handling will also be able to be implemented and be a valuable fall back where business operations contain multiple persistence steps that need to success or stop completely upon a failure together. This gives strong protection without placing all protection or rules in a single layer or on the database (OWASP, 2026).

## 5.3) Recommendation feeding the project

For the selected operation request creation operation CivicConnect is recommended to use a layered approach to preserve data correctness. The Application layer should be responsible for handling business rules and validation while the database enforces fundamental data integrity through constraints such as primary keys, required fields, unique records etc. Request creation and any related operation and records that must succussed or fail together will be handled as one transaction so if failure does occur it can be rolled back and not leave partially completed data.
Caching should not be used for correctness critical requests information unless specifically stated or required as a need. For performance problems that might be identified techniques such as database indexing could be considered for queried data that is frequently worked with while ensuring the correctness of persisted information is not compromised.

Based on the research findings Milestone 2’s data design, mainly the request data model, database constraints and the request creation implantation should be informed of the recommendation. It should also inform and be captured by the relevant Architecture Decision Record so the decisions of recommendation can be properly documented. The risks discussed mainly partial writes, invalid data and concurrent updates should also be added into the risk registration if the recommendations are considered.

References
Microsoft, 2026. Cache in-memory in ASP.NET Core. [Online] 
Available at: https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory
Microsoft, 2026. Efficient Querying. [Online] 
Available at: https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying
Microsoft, 2026. Entity Framework Core Documentation. [Online] 
Available at: https://learn.microsoft.com/en-us/ef/core/saving/transactions
Microsoft, 2026. Microsoft Learn. [Online] 
Available at: https://learn.microsoft.com/en-us/aspnet/web-forms/overview/data-access/introduction/creating-a-business-logic-layer-cs
Microsoft, 2026. Microsoft Learn. [Online] 
Available at: https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
Microsoft, 2026. Model validation in ASP.NET Core MVC and Razor Pages. [Online] 
Available at: https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation
Micrososft, 2026. Handling Concurrency Conflicts. [Online] 
Available at: https://learn.microsoft.com/en-us/ef/core/saving/concurrency
OWASP, 2026. OWASP Cheat sheet Series. In: Input Validation Cheat Sheet. s.l.:s.n.
OWASP, 2026. OWASP Cheat Sheet Series. [Online] 
Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
PostgreSQL Global Development Group, 2026. PostgreSQL Documentation. [Online] 
Available at: https://www.postgresql.org/docs/16/tutorial-transactions.html
[Accessed 2026].
PostgreSQL Global Development Group, 2026. PostgreSQL Documentation. [Online].

