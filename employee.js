const EmployeeDB = require("./employeeDB");

class Employee extends EmployeeDB {
    constructor() {
        super();
        this.table = `employee`;
    }

    getAll() {
        const rows = super.getAll();
        console.log(`Employee.getAll: ` + rows);
    }

    insertInto(first_name, last_name, role_id, manager_id) {
        const newParams = { 
            first_name: `${first_name}`,
            last_name: `${last_name}`,
            role_id: `${role_id}`,
            manager_id: `${manager_id}`};
        super.insertInto(newParams);
    };
}

module.exports = Employee;
