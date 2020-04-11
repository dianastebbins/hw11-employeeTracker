USE employee_db;

INSERT INTO department (name)
VALUES ("Management"),
("Custodial");

INSERT INTO role (title, salary, department_id)
VALUES ("Manager",200000,1),
("Duster",20000,2),
("Vacuumer",18000,2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Joe","R",1,null),
("Clint","B",3,1),
("Denis","M",2,1);