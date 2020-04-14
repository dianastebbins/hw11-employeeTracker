USE employee_db;

INSERT INTO department (name)
VALUES ("Management"),
("IS"),
("Payroll"),
("General Office");

INSERT INTO role (title, salary, department_id)
VALUES ("Manager",200000,1),
("Software Architect",120000,2),
("Software Developer",110000,2),
("IS Intern", 10000, 2),
("Accounting Clerk", 55000,3),
("Receptionist", 36000, 4),
("Office Manager", 75000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Joe","Rehfuss",1,null),
("Clint","Brodar",3,1),
("Denis","Molloy",2,1),
("Melanie","O'Rourke",7,null),
("John","Smith",6,4),
("Jane","Doe",5,4);