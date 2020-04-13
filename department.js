const EmployeeDB = require("./employeeDB");

class Department extends EmployeeDB {
    constructor() {
        super();
        this.table = `department`;
    }

    getAll() {
        const rows = super.getAll();
        console.log(`Department.getAll: ` + rows);
        this.rows = super.rows;
        console.log(`Department.getAll: ${this.rows}`);
    }

    insertInto(name) {
        const newParams = { name: `${name}` };
        super.insertInto(newParams);
    };
}

module.exports = Department;