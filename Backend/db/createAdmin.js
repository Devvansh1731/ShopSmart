const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const models = require('./schema');

const db = 'mongodb+srv://Suryabhagavan:Damithaa%401730@cluster0.w2yhhtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function createDefaultAdmin() {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const adminData = {
            firstname: 'Admin',
            lastname: 'User',
            username: 'admin',
            email: 'admin@shopsmart.com',
            password: 'admin123'
        };

        // Check if admin already exists
        const existingAdmin = await models.Admins.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create new admin
        const newAdmin = new models.Admins({
            ...adminData,
            password: hashedPassword
        });

        await newAdmin.save();
        console.log('Default admin user created successfully');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createDefaultAdmin(); 