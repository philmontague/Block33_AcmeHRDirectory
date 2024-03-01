const express = require('express')
const { Client } = require('pg')
const morgan = require('morgan')

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory')
const app = express()

const PORT = process.env.PORT || 3000 

app.use(express.json())
app.use(morgan('dev'))







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