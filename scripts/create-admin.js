import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const name = await question('Enter admin name: ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    console.log('\nAdmin account created successfully:');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin(); 