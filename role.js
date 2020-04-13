const EmployeeDB = require("./employeeDB");

class Role extends EmployeeDB {
    constructor() {
        super();
        this.table = `role`;
    }

    getAll() {
        const rows = super.getAll();
        console.log(`Role.getAll: ` + rows);
    }

    insertInto(title, salary, department_id) {
        const newParams = { 
            title: `${title}`,
            salary: `${salary}`,
            department_id: `${department_id}`};
        super.insertInto(newParams);
    };
}

module.exports = Role;