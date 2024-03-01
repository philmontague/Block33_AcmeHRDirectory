const express = require('express')
const { Client } = require('pg')
const morgan = require('morgan')

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory')
const app = express()

const PORT = process.env.PORT || 3000 

app.use(express.json())
app.use(morgan('dev'))


// Get all employees 
app.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM employees;`
        const response = await client.query(SQL) 
        res.send(response.rows)
    } catch (error) {
        next(error) 
    }
})

// Get all departments 
app.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM departments;`
        const response = await client.query(SQL) 
        res.send(response.rows) 
    } catch (error) {
        next(error)
    }
})

// Create a new employee 
app.post('/api/employees', async (req, res, next) => {
    try {
        const { name, department_id } = req.body 
        const SQL = `INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *;`
        const response = await client.query(SQL, [name, department_id])
    } catch (error) {
        next(error) 
    }
})

// Delete an employee by ID number 
app.delete('/api/employees/:id', async (req, res, next) => {
    try {
        const employeeId = req.params.id 
        const SQL = `DELETE FROM employees WHERE id = $1;`
        await client.query(SQL, [employeeId])
        res.sendStatus(204)
    } catch (error) {
        next(error) 
    }
})

// Update an employee by ID number 
app.put('/api/employees/:id', async (req, res, next) => {
    try {
        const employeeId = req.params.id 
        const { name, department_id } = req.body 
        const SQL = `UPDATE employees SET name = $1, department_id = $2, updated_at = now() WHERE id = $3 RETURNING *;`
        const response = await client.query(SQL, [name, department_id, employeeId])
        res.send(response.rows[0])
    } catch (error) {
        next(error) 
    }
})

// Error handling middleware 
app.use((err, req, res, next) => {
    console.error(err) 
    res.status(500).json({ error: 'Internal Server Error' })
})

// Start the server 
const init = async () => { 
    try {
        await client.connect() 
        console.log('Connected to database')

        let SQL = `
            DROP TABLE IF EXISTS employees; 
            DROP TABLE IF EXISTS departments; 

            CREATE TABLE departments (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(100) NOT NULL
            ); 

            CREATE TABLE employees (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(100) NOT NULL, 
                created_at TIMESTAMP DEFAULT now(), 
                updated_at TIMESTAMP DEFAULT now(), 
                department_id INTEGER REFERENCES departments(id) NOT NULL
            ); 
        `

        await client.query(SQL) 
        console.log('Tables created')

        SQL = ` 
            INSERT INTO departments (name) VALUES 
            ('IT'),
            ('Sales'),
            ('Operations'); 

            INSERT INTO employees (name, department_id) VALUES 
            ('John Smith', 1),
            ('Jane Doe', 2),
            ('Alice Johnson', 3); 
        `

            await client.query(SQL) 
            console.log('Data seeded')

            app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`)
         })

    } catch (error) {
        console.error('Error during initialization:', error)
        process.exit(1)
    }
}

init() 