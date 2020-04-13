const inquirer = require("inquirer");
const mysql = require("mysql");
// const mysql = require("promise-mysql");

const Role = require("./role");
const Employee = require("./employee");
const Department = require("./department");
const EmployeeDB = require("./employeeDB");

const roleData = new Role();
const employeeData = new Employee();
const departmentData = new Department();
const employeeDB = new EmployeeDB();

function runSystem() {
    employeeDB.connect();
    console.log(`Welcome to EMS, THE premiere Employee Management System`);
    selectMgmtArea();
}

// ================================================================================
//          MANAGEMENT AREAS
// ================================================================================

const mgmtOptions = [
    `Manage Departments`,
    `Manage Roles`,
    `Manage Employees`,
    `Employees by Manager Report`,
    `Budget by Department Report`,
    `Quit`
];
const mgmtOptionQ = [
    {
        name: `mgmtOptionSelected`,
        type: `list`,
        choices: mgmtOptions,
        message: `Select management area: `
    }
];

function selectMgmtArea() {
    inquirer.prompt(mgmtOptionQ).then(function (answers) {
        switch (answers.mgmtOptionSelected) {
            case mgmtOptions[0]:
                manageDepartments();
                break;

            case mgmtOptions[1]:
                manageRoles();
                break;

            case mgmtOptions[2]:
                manageEmployees();
                break;

            case mgmtOptions[3]:
                manageEmployeeReports();
                break;

            case mgmtOptions[4]:
                manageDepartmentBudgetReports();
                break;

            case mgmtOptions[5]:
                console.log(`Thank you for using EMS, THE premiere Employee Management System`);
                employeeDB.disconnect();
                return;

            default:
                selectMgmtArea();
        }
    });
};

// ================================================================================
//          MANAGE DEPARTMENTS
// ================================================================================

const deptOptions = [
    `Return to Management Options`,
    `View All Departments`,
    `Add New Department`,
    `Delete Department`
];
const deptOptionQ = [
    {
        name: `deptOptionSelected`,
        type: `list`,
        choices: deptOptions,
        message: `Select task: `
    },
    {
        when: function (answers) { return answers.deptOptionSelected === deptOptions[2]; },
        name: `newDeptName`,
        type: `input`,
        message: `Enter name of new Department: `
    }
];

function manageDepartments() {
    inquirer.prompt(deptOptionQ).then(function (answers) {
        switch (answers.deptOptionSelected) {
            case deptOptions[0]:
                selectMgmtArea();
                return;

            case deptOptions[1]:
                viewAllDepartments();
                break;

            case deptOptions[2]:
                addDepartment(answers);
                break;

            case deptOptions[3]:
                deleteDepartment();
                break;

            default:
                manageDepartments();

        };

        manageDepartments();
    });
}

function viewAllDepartments() {
    console.log("pre db query call")
    const theRows = departmentData.getAll();
    console.log("post db query call")
    console.log(`viewAllDepartments: ` + theRows);

}

function addDepartment(answers) {
    console.log(`addDepartment ${answers.newDeptName}`);
    const theRows = departmentData.insertInto(answers.newDeptName);
};

function deleteDepartment() {
    console.log(`deleteDepartment`);
    selectExistingDepartment();
};

// ================================================================================
//          MANAGE ROLES
// ================================================================================

const roleOptions = [
    `Return to Management Options`,
    `View All Roles`,
    `Add New Role`,
    `Delete Role`
];
const roleOptionQ = [
    {
        name: `roleOptionSelected`,
        type: `list`,
        choices: roleOptions,
        message: `Select task: `
    },
    {
        when: function (answers) { return answers.roleOptionSelected === roleOptions[2]; },
        name: `newRoleTitle`,
        type: `input`,
        message: `Enter Title of new role: `
    },
    {
        when: function (answers) { return answers.roleOptionSelected === roleOptions[2]; },
        name: `newRoleSalary`,
        type: `input`,
        message: `Enter Salary of new role: `
    }
];

function manageRoles() {
    inquirer.prompt(roleOptionQ).then(function (answers) {
        switch (answers.roleOptionSelected) {
            case roleOptions[0]:
                selectMgmtArea();
                return;

            case roleOptions[1]:
                viewAllRoles();
                break;

            case roleOptions[2]:
                addRole(answers);
                break;

            case roleOptions[3]:
                deleteRole();
                break;

            default:
                manageRoles();

        };

        manageRoles();
    });
}

function viewAllRoles() {
    const theRows = roleData.getAll();
    console.log(`viewAllRoles: ` + theRows);
};

function addRole(answers) {
    console.log(`addRole ${answers.newRoleTitle} ${answers.newRoleSalary}`);
    selectExistingDepartment();
    const theRows = roleData.insertInto(answers.newRoleTitle, answers.newRoleSalary, 2);
};

function deleteRole() {
    console.log(`deleteRole`);
    selectExistingRole();
};

// ================================================================================
//          MANAGE EMPLOYEES
// ================================================================================

const employeeOptions = [
    `Return to Management Options`,
    `View All Employees`,
    `Add New Employee`,
    `Delete Employee`,
    `Update Role`,
    'Update Manager'
];
const employeeOptionQ = [
    {
        name: `employeeOptionSelected`,
        type: `list`,
        choices: employeeOptions,
        message: `Select task: `
    },
    {
        when: function (answers) { return answers.employeeOptionSelected === employeeOptions[2]; },
        name: `newEmployeeFirstName`,
        type: `input`,
        message: `Enter First Name of new employee: `
    },
    {
        when: function (answers) { return answers.employeeOptionSelected === employeeOptions[2]; },
        name: `newEmployeeLastName`,
        type: `input`,
        message: `Enter Last Name of new employee: `
    }
];

function manageEmployees() {
    inquirer.prompt(employeeOptionQ).then(function (answers) {
        switch (answers.employeeOptionSelected) {
            case employeeOptions[0]:
                selectMgmtArea();
                return;

            case employeeOptions[1]:
                viewAllEmployees();
                break;

            case employeeOptions[2]:
                addEmployee(answers);
                break;

            case employeeOptions[3]:
                deleteEmployee();
                break;

            case employeeOptions[4]:
                updateEmployeeRole();
                break;

            case employeeOptions[5]:
                updateEmployeeManager();
                break;

            default:
                manageEmployees();

        };

        manageEmployees();
    });
}

function viewAllEmployees() {
    const theRows = employeeData.getAll();
    console.log(`viewAllEmployees: ` + theRows);
};

function addEmployee(answers) {
    console.log(`addEmployee ${answers.newEmployeeFirstName} ${answers.newEmployeeLastName}`);
    selectExistingRole();
    selectExistingManager();
    const theRows = employeeData.insertInto(answers.newEmployeeFirstName, answers.newEmployeeLastName, 2, 1);
};

function deleteEmployee() {
    console.log(`deleteEmployee`);
    selectExistingEmployee();
};

function updateEmployeeRole() {
    console.log(`updateEmployeeRole`);
    selectExistingEmployee();
    selectExistingRole();
};

function updateEmployeeManager() {
    console.log(`updateEmployeeManager`);
    selectExistingEmployee();
    selectExistingManager();
};

function selectExistingDepartment() {
    console.log(`selectExistingDepartment`);
};

function selectExistingRole() {
    console.log(`selectExistingRole`);
};

function selectExistingEmployee() {
    console.log(`selectExistingEmployee`);
};

function selectExistingManager() {
    console.log(`selectExistingManager`);
};

// ================================================================================
//          EMPLOYEE REPORTS
// ================================================================================

const employeeReportOptions = [
    `Return to Management Options`,
    `View Employees of all Managers`,
    `Report by specific Manager`
];
const employeeReportOptionQ = [
    {
        name: `employeeReportOptionSelected`,
        type: `list`,
        choices: employeeReportOptions,
        message: `Select task: `
    }
];

function manageEmployeeReports() {
    inquirer.prompt(employeeReportOptionQ).then(function (answers) {
        switch (answers.employeeReportOptionSelected) {
            case employeeReportOptions[0]:
                selectMgmtArea();
                return;

            case employeeReportOptions[1]:
                viewAllEmployeesReport();
                break;

            case employeeReportOptions[2]:
                viewByManagerReport();
                break;

            default:
                manageEmployeeReports();

        };

        manageEmployeeReports();
    });
}

function viewAllEmployeesReport() {
    console.log(`viewAllEmployeesReport`);
};

function viewByManagerReport() {
    console.log(`viewByManagerReport`);
    selectExistingManager();
};

// ================================================================================
//          BUDGET REPORTS
// ================================================================================

const budgetReportOptions = [
    `Return to Management Options`,
    `View Budgets of all Departments`,
    `Report by specific Department`
];
const budgetReportOptionQ = [
    {
        name: `budgetReportOptionSelected`,
        type: `list`,
        choices: budgetReportOptions,
        message: `Select task: `
    }
];

function manageDepartmentBudgetReports() {
    inquirer.prompt(budgetReportOptionQ).then(function (answers) {
        switch (answers.budgetReportOptionSelected) {
            case budgetReportOptions[0]:
                selectMgmtArea();
                return;

            case budgetReportOptions[1]:
                viewAllBudgetsReport();
                break;

            case budgetReportOptions[2]:
                viewByDepartmentReport();
                break;

            default:
                manageDepartmentBudgetReports();

        };

        manageDepartmentBudgetReports();
    });
}

function viewAllBudgetsReport() {
    console.log(`viewAllBudgetsReport`);
};

function viewByDepartmentReport() {
    console.log(`viewByDepartmentReport`);
    selectExistingDepartment();
};

// function test() {
//     // get some table data and display
//     getEmployees();

//     // insert a new ...something...
//     const answers = {
//         firstName: "Makayla",
//         lastName: "S",
//         roleId: 2,
//         managerId: 1
//     }

//     hireEmployee(answers);

//     // insert a new ...something...
//     const answers2 = {
//         firstName: "Diana",
//         lastName: "S",
//         roleId: 1,
//         managerId: 1
//     }

//     // update a record
//     updateEmployeeRole(answers2);

//     // delete a record
//     // youreFired();
// }

// function getEmployees() {
//     const query = connection.query(
//         "SELECT * FROM employee", function (err, response) {
//             if (err) throw err;
//             console.table(response);
//         }
//     )
// }

// function hireEmployee(newEmployeeData) {
//     const query = connection.query(
//         "INSERT INTO employee SET ?",
//         {
//             first_name: newEmployeeData.firstName,
//             last_name: newEmployeeData.lastName,
//             role_id: newEmployeeData.roleId,
//             manager_id: newEmployeeData.managerId
//         }, function (err, response) {
//             if (err) throw err;
//             console.log(response.affectedRows + " employee hired!\n");
//         }
//     )
// }

// function updateEmployeeRole(updatedData) {
//     const query = connection.query(
//         "UPDATE employee SET ?",
//         {
//             first_name: newEmployeeData.firstName,
//             last_name: newEmployeeData.lastName,
//             role_id: newEmployeeData.roleId,
//             manager_id: newEmployeeData.managerId
//         }, function (err, response) {
//             if (err) throw err;
//             console.log(response.affectedRows + " employee hired!\n");
//         }
//     )
// }

// console.log("postANewItem");
//     var query = connection.query(

//         // name, actionType, itemType, item, description, minPrice, addAnother
//       "INSERT INTO items SET ?",
//       {
//         title: userInput.item,
//         itemType: userInput.itemType,
//         itemDescription: VARCHAR(100),
//         sellerName: VARCHAR(100),
//         highBid: 

//         flavor: "Rocky Road",
//         price: 3.0,
//         quantity: 50
//       },
//       function(err, res) {
//         if (err) throw err;
//         console.log(res.affectedRows + " product inserted!\n");
//         // Call updateProduct AFTER the INSERT completes
//         updateProduct();
//       }
//     );

//     // logs the actual query being run
//     console.log(query.sql);

runSystem();