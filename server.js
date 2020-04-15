const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

// ================================================================================
//          MOSTLY BOILERPLATE SECTION
// ================================================================================

const dbConfig = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
};

const connection = mysql.createConnection(dbConfig);
const cancelDeleteOption = `Cancel delete`;

function runSystem() {
    connection.connect(function (err) {
        if (err) {
            console.log(`unable to connect to database: ${err}`);
            return;
        }
    });
    displayWithSpace(`Welcome to EMS, THE premiere Employee Management System`);
    selectMgmtArea();
}

// ================================================================================
//          MANAGEMENT AREAS
// ================================================================================

const mgmtOptions = [
    `Manage Departments`,
    `Manage Roles`,
    `Manage Employees`,
    `Reports`,
    `Exit`
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
                manageReports();
                break;

            case mgmtOptions[4]:
                displayWithSpace(`Thank you for using EMS, THE premiere Employee Management System`);
                connection.end();
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
const deptOptionQuestions = [
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
    inquirer.prompt(deptOptionQuestions).then(function (answers) {
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
    })
}

function viewAllDepartments() {
    connection.query(`SELECT id AS 'ID', name as 'Department Name' FROM department`, function (err, results) {
        if (err) throw err;

        displayWithSpace(results);
        manageDepartments();
    });
}

function addDepartment(answers) {
    connection.query(`INSERT INTO department SET ?`, { name: answers.newDeptName }, function (err, results) {
        if (err) throw err;

        displayWithSpace(`New department '${answers.newDeptName}' with id ${results.insertId} added.`)
        manageDepartments();
    });
};

function deleteDepartment() {
    connection.query(`SELECT * FROM department`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices that can be deleted
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(row.name);
            idArray.push(row.id);
        });

        // add an option to back out
        choicesArray.push(cancelDeleteOption);

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select department to delete: `
            }
        ]).then(function (selection) {
            if (selection.selected !== cancelDeleteOption) {
                // get index of selection so we can grab corresponding database id
                const index = choicesArray.indexOf(selection.selected);
                const idToDelete = idArray[index];

                // delete from the database
                connection.query(`DELETE FROM department WHERE id = ${idToDelete}`), function (deleteErr, deleteResults) {
                    if (deleteErr) throw deleteErr;
                };
                
                displayWithSpace(`Department '${selection.selected}' with id ${idToDelete} deleted.`)
            }
            manageDepartments();
        });
    });
}

// ================================================================================
//          MANAGE ROLES
// ================================================================================

const roleOptions = [
    `Return to Management Options`,
    `View All Roles`,
    `Add New Role`,
    `Delete Role`
];
const roleOptionQuestions = [
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
    inquirer.prompt(roleOptionQuestions).then(function (answers) {
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
    });
}

function viewAllRoles() {
    connection.query(`SELECT id AS 'ID', title AS 'Job Title', LPAD(CONCAT('$',FORMAT(salary,2)),15,' ') AS 'Salary', department_id AS 'Department ID' FROM role`, function (err, results) {
        if (err) throw err;

        displayWithSpace(results);
        manageRoles();
    });
}

function addRole(answers) {
    // new role also needs an associated department so build a valid list for user to select from
    connection.query(`SELECT * FROM department`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(row.name);
            idArray.push(row.id);
        });

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select department associated to new role: `
            }
        ]).then(function (selection) {
            // get index of selection so we can grab corresponding database id
            const index = choicesArray.indexOf(selection.selected);
            const associatedDeptId = idArray[index];

            connection.query(`INSERT INTO role SET ?`,
                {
                    title: answers.newRoleTitle,
                    salary: answers.newRoleSalary,
                    department_id: associatedDeptId
                }, function (err, results) {
                    if (err) throw err;

                    displayWithSpace(`New role '${answers.newRoleTitle}' with id ${results.insertId} added.`)
                    manageRoles();
                });
        });
    });
};

function deleteRole() {
    connection.query(`SELECT * FROM role`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices that can be deleted
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(row.title);
            idArray.push(row.id);
        });

        // add an option to back out
        choicesArray.push(cancelDeleteOption);

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select role to delete: `
            }
        ]).then(function (selection) {
            if (selection.selected !== cancelDeleteOption) {
                // get index of selection so we can grab corresponding database id
                const index = choicesArray.indexOf(selection.selected);
                const idToDelete = idArray[index];

                // delete from the database
                connection.query(`DELETE FROM role WHERE id = ${idToDelete}`), function (deleteErr, deleteResults) {
                    if (deleteErr) throw deleteErr;
                };

                displayWithSpace(`Role '${selection.selected}' with id ${idToDelete} deleted.`);
            }
            manageRoles();
        });
    });
}

// ================================================================================
//          MANAGE EMPLOYEES
// ================================================================================

const employeeOptions = [
    `Return to Management Options`,
    `View All Employees`,
    `Add New Employee`,
    `Delete Employee`,
    `Update Employee's Role`,
    `Update Employee's Manager`
];
const employeeOptionQuestions = [
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
    inquirer.prompt(employeeOptionQuestions).then(function (answers) {
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
    });
}

function viewAllEmployees() {
    // improvement for readability of more complicated/long query strings
    const selectPhrase = `SELECT emp.id AS 'ID', CONCAT(emp.first_name, " ", emp.last_name) AS Employee, role.title AS Title, dept.name as Department,`;
    const selectPhraseCont = `LPAD(CONCAT('$',FORMAT(role.salary,2)),15,' ') AS Salary, CONCAT(mgr.first_name, " ", mgr.last_name) AS Manager`;
    const joinPhrase = `FROM employee AS emp JOIN role ON emp.role_id = role.id JOIN department AS dept ON role.department_id = dept.id`;
    const joinPhraseCont = `LEFT OUTER JOIN employee AS mgr ON emp.manager_id = mgr.id`;
    
    connection.query(`${selectPhrase} ${selectPhraseCont} ${joinPhrase} ${joinPhraseCont}`, function (err, results) {
        if (err) throw err;

        displayWithSpace(results);
        manageEmployees();
    });
};

function addEmployee(answers) {
    // new employee also needs an associated role and manager so build valid lists for user to select from
    connection.query(`SELECT * FROM role`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(row.title);
            idArray.push(row.id);
        });

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select role of new employee: `
            }
        ]).then(function (selection) {
            // get index of selection so we can grab corresponding database id
            const index = choicesArray.indexOf(selection.selected);
            const associatedRoleId = idArray[index];

            connection.query(`SELECT e.id, e.first_name, e.last_name FROM employee e JOIN role r WHERE e.role_id = r.id AND r.title like '%MANAGER%'`, function (mgrErr, mgrResults) {
                if (mgrErr) throw mgrErr;

                // make a list of existing choices
                // and also keep track of their corresponding database ids
                const mgrChoicesArray = [];
                const mgrIdArray = [];
                mgrResults.forEach(row => {
                    mgrChoicesArray.push(`${row.first_name} ${row.last_name}`);
                    mgrIdArray.push(row.id);
                });

                inquirer.prompt([
                    {
                        name: `mgrSelected`,
                        type: `list`,
                        choices: mgrChoicesArray,
                        message: `Select manager of new employee: `
                    }
                ]).then(function (mgrSelection) {
                    // get index of selection so we can grab corresponding database id
                    const mgrIndex = mgrChoicesArray.indexOf(mgrSelection.mgrSelected);
                    const associatedManagerId = mgrIdArray[mgrIndex];

                    connection.query(`INSERT INTO employee SET ?`,
                        {
                            first_name: answers.newEmployeeFirstName,
                            last_name: answers.newEmployeeLastName,
                            role_id: associatedRoleId,
                            manager_id: associatedManagerId
                        }, function (saveErr, saveResults) {
                            if (saveErr) throw saveErr;

                            displayWithSpace(`New employee '${answers.newEmployeeFirstName}' '${answers.newEmployeeLastName}' with id ${saveResults.insertId} added.`)
                            manageEmployees();
                        });
                });
            });
        });
    });
}

function deleteEmployee() {
    connection.query(`SELECT * FROM employee`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices that can be deleted
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(`${row.first_name} ${row.last_name}`);
            idArray.push(row.id);
        });

        // add an option to back out
        choicesArray.push(cancelDeleteOption);

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select employee to delete: `
            }
        ]).then(function (selection) {
            if (selection.selected !== cancelDeleteOption) {
                // get index of selection so we can grab corresponding database id
                const index = choicesArray.indexOf(selection.selected);
                const idToDelete = idArray[index];

                // delete from the database
                connection.query(`DELETE FROM employee WHERE id = ${idToDelete}`), function (deleteErr, deleteResults) {
                    if (deleteErr) throw deleteErr;
                };

                displayWithSpace(`Employee '${selection.selected}' with id ${idToDelete} deleted.`);
            }
            manageEmployees();
        });
    });
}

function updateEmployeeRole() {
    // pick an employee to update and then pick their new role, build valid lists for user to select from
    connection.query(`SELECT * FROM employee`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(`${row.first_name} ${row.last_name}`);
            idArray.push(row.id);
        });

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select employee: `
            }
        ]).then(function (selection) {
            // get index of selection so we can grab corresponding database id
            const index = choicesArray.indexOf(selection.selected);
            const associatedEmpId = idArray[index];

            connection.query(`SELECT * from role`, function (roleErr, roleResults) {
                if (roleErr) throw roleErr;

                // make a list of existing choices
                // and also keep track of their corresponding database ids
                const roleChoicesArray = [];
                const roleIdArray = [];
                roleResults.forEach(row => {
                    roleChoicesArray.push(`${row.title}`);
                    roleIdArray.push(row.id);
                });

                inquirer.prompt([
                    {
                        name: `roleSelected`,
                        type: `list`,
                        choices: roleChoicesArray,
                        message: `Select new role of employee: `
                    }
                ]).then(function (roleSelection) {
                    // get index of selection so we can grab corresponding database id
                    const roleIndex = roleChoicesArray.indexOf(roleSelection.roleSelected);
                    const associatedRoleId = roleIdArray[roleIndex];

                    connection.query(`UPDATE employee SET role_id = ${associatedRoleId} WHERE id = ${associatedEmpId}`, function (saveErr, saveResults) {
                        if (saveErr) throw saveErr;

                        displayWithSpace(`Employee '${selection.selected}' with id ${associatedEmpId} updated to role ${roleSelection.roleSelected}.`)
                        manageEmployees();
                    });
                });
            });
        });
    });
};

function updateEmployeeManager() {
    // pick an employee to update and then pick their new role, build valid lists for user to select from
    connection.query(`SELECT * FROM employee`, function (err, results) {
        if (err) throw err;

        // make a list of existing choices
        // and also keep track of their corresponding database ids
        const choicesArray = [];
        const idArray = [];
        results.forEach(row => {
            choicesArray.push(`${row.first_name} ${row.last_name}`);
            idArray.push(row.id);
        });

        inquirer.prompt([
            {
                name: `selected`,
                type: `list`,
                choices: choicesArray,
                message: `Select employee: `
            }
        ]).then(function (selection) {
            // get index of selection so we can grab corresponding database id
            const index = choicesArray.indexOf(selection.selected);
            const associatedEmpId = idArray[index];

            connection.query(`SELECT e.id, e.first_name, e.last_name FROM employee e JOIN role r WHERE e.role_id = r.id AND r.title like '%MANAGER%'`, function (mgrErr, mgrResults) {
                if (mgrErr) throw mgrErr;

                // make a list of existing choices
                // and also keep track of their corresponding database ids
                const mgrChoicesArray = [];
                const mgrIdArray = [];
                mgrResults.forEach(row => {
                    mgrChoicesArray.push(`${row.first_name} ${row.last_name}`);
                    mgrIdArray.push(row.id);
                });

                inquirer.prompt([
                    {
                        name: `mgrSelected`,
                        type: `list`,
                        choices: mgrChoicesArray,
                        message: `Select manager of new employee: `
                    }
                ]).then(function (mgrSelection) {
                    // get index of selection so we can grab corresponding database id
                    const mgrIndex = mgrChoicesArray.indexOf(mgrSelection.mgrSelected);
                    const associatedManagerId = mgrIdArray[mgrIndex];

                    connection.query(`UPDATE employee SET manager_id = ${associatedManagerId} WHERE id = ${associatedEmpId}`, function (saveErr, saveResults) {
                        if (saveErr) throw saveErr;

                        displayWithSpace(`Employee '${selection.selected}' with id ${associatedEmpId} now reports to ${mgrSelection.mgrSelected}.`)
                        manageEmployees();
                    });
                });
            });
        });
    });
};


// ================================================================================
//          REPORTS
// ================================================================================

const reportOptions = [
    `Return to Management Options`,
    `Full Management Hierarchy`,
    `View Manager Direct Reports`,
    `Budget Report by Department`
];
const reportOptionQ = [
    {
        name: `reportOptionSelected`,
        type: `list`,
        choices: reportOptions,
        message: `Select task: `
    }
];

function manageReports() {
    inquirer.prompt(reportOptionQ).then(function (answers) {
        switch (answers.reportOptionSelected) {
            case reportOptions[0]:
                selectMgmtArea();
                return;

            case reportOptions[1]:
                viewFullManagementHierarchy();
                break;

            case reportOptions[2]:
                viewManagerDirectReports();
                break;

            case reportOptions[3]:
                viewBudgetReport();
                break;

            default:
                manageReports();
        };
    });
}

function viewFullManagementHierarchy() {
    // improvement for readability of more complicated/long query strings
    const selectPhrase = `SELECT CONCAT(mgr.first_name, " ", mgr.last_name) AS 'Manager', mgrR.title AS 'Title', CONCAT(emp.first_name, " ", emp.last_name) AS 'Employee', empR.title AS 'Position'`;
    const joinPhrase = `FROM employee AS mgr JOIN employee AS emp ON emp.manager_id = mgr.id`;
    const joinPhraseCont = `JOIN role AS mgrR ON mgr.role_id = mgrR.id JOIN role AS empR ON emp.role_id = empR.id`;
    const orderbyPhrase = `ORDER BY mgr.last_name, emp.last_name`;

    connection.query(`${selectPhrase} ${joinPhrase} ${joinPhraseCont} ${orderbyPhrase}`, function (err, results) {
        if (err) throw err;

        displayWithSpace(results);
        manageReports();
    });
};

function viewManagerDirectReports() {
    // get a specific manager to filter results by
    // improvement for readability of more complicated/long query strings
    const selectMgrPhrase = `SELECT emp.id, emp.first_name, emp.last_name`;
    const joinMgrPhrase = `FROM employee AS emp JOIN role ON emp.role_id = role.id`;
    const whereMgrPhrase = `WHERE role.title like '%MANAGER%'`;
    const orderbyMgrPhrase = `ORDER BY emp.last_name`;

    connection.query(`${selectMgrPhrase} ${joinMgrPhrase} ${whereMgrPhrase} ${orderbyMgrPhrase}`, function (mgrErr, mgrResults) {
        if (mgrErr) throw mgrErr;

        // make a list of existing choices
        // and also keep track of their corresponding database ids
        const mgrChoicesArray = [];
        const mgrIdArray = [];
        mgrResults.forEach(row => {
            mgrChoicesArray.push(`${row.first_name} ${row.last_name}`);
            mgrIdArray.push(row.id);
        });

        inquirer.prompt([
            {
                name: `mgrSelected`,
                type: `list`,
                choices: mgrChoicesArray,
                message: `Select specific manager: `
            }
        ]).then(function (mgrSelection) {
            // get index of selection so we can grab corresponding database id
            const mgrIndex = mgrChoicesArray.indexOf(mgrSelection.mgrSelected);
            const associatedManagerId = mgrIdArray[mgrIndex];

            // improvement for readability of more complicated/long query strings
            const selectPhrase = `SELECT CONCAT(mgr.first_name, " ", mgr.last_name) AS 'Manager', mgrR.title AS 'Title', CONCAT(emp.first_name, " ", emp.last_name) AS 'Employee', empR.title AS 'Position'`;
            const joinPhrase = `FROM employee AS mgr JOIN employee AS emp ON emp.manager_id = mgr.id`;
            const joinPhraseCont = `JOIN role AS mgrR ON mgr.role_id = mgrR.id JOIN role AS empR ON emp.role_id = empR.id`;
            const wherePhrase = `WHERE emp.manager_id = ?`;
            const orderbyPhrase = `ORDER BY emp.last_name`;

            connection.query(`${selectPhrase} ${joinPhrase} ${joinPhraseCont} ${wherePhrase} ${orderbyPhrase}`, [associatedManagerId], function (err, results) {
                if (err) throw err;

                displayWithSpace(results);
                manageReports();
            });
        });
    });
};

function viewBudgetReport() {
    // improvement for readability of more complicated/long query strings
    const selectPhrase = `SELECT dept.name AS Department, LPAD(CONCAT('$',FORMAT(COALESCE(SUM(role.salary),0.00),2)),20,' ') AS 'Total Deptartment Salary'`;
    const joinPhrase = `FROM employee AS emp JOIN role ON emp.role_id = role.id RIGHT OUTER JOIN department AS dept ON role.department_id = dept.id`;
    const groupbyPhrase = `GROUP BY Department`;

    connection.query(`${selectPhrase} ${joinPhrase} ${groupbyPhrase}`, function (err, results) {
        if (err) throw err;

        displayWithSpace(results);
        manageReports();
    });
};

// ================================================================================
//          HELPER FUNCTIONS
// ================================================================================

function displayWithSpace(message) {
    console.log(`\n================================================================================`);
    console.table(message);
    console.log(`================================================================================\n`);
}

// ================================================================================
//          START THE APP!!!
// ================================================================================

runSystem();