USE employee_db;

INSERT INTO department (name)
VALUES ("Management"),
("IS"),
("Payroll"),
("Office"),
("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("General Manager",200000,1),
("IT Manager",175000,1),
("Office Manager", 75000, 1),
("Sales Manager", 100000, 1),
("Software Architect",130000,2),
("Software Developer",115000,2),
("IS Intern", 10000, 2),
("Accounting Clerk", 55000,3),
("Receptionist", 36000, 4),
("Customer Service Rep", 48000, 4),
("Corporate Sales Rep", 85000, 5),
("International Sales Rep",95000, 5),
("Travel Coordinator", 48000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Diana","Stebbins",1,null),
("Joe","Rehfuss",2,1),
("Melanie","O'Rourke",3,1),
("Jamie","Fraser",4,1),
("Clint","Brodar",5,2),
("Denis","Molloy",5,2),
("Zac","Stowell",6,2),
("Olga","Sadova",6,2),
("John","Huntsperger",6,2),
("Yalda","Aghazade",6,2),
("Dion","Leung",6,2),
("Devin","Heigert",6,2),
("Fred","Flintstone",7,2),
("Barney","Rubble",7,2),
("Wilma","Flintstone",8,3),
("Brianna","Randall",8,3),
("Betty","Rubble",9,3),
("Bam Bam","Rubble",10,4),
("Roger","Wakefield",10,4),
("Pebbles","Flintstone",11,4),
("Ian","Murray",11,4),
("Lord John","Grey",11,4),
("Makayla","Stebbins",12,4),
("Lauren","Baumgartner",12,4),
("Kelly","Morris",12,4),
("Claire","Fraser",13,4);