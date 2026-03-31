import { pool } from '../../src/db/pool.js';
import crypto from 'crypto';

async function setup() {
  const userId = crypto.randomUUID();
  const reqId = crypto.randomUUID();
  
  try {
    const userEmail = 'postman_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '@example.com';
    
    // 1. Create User
    await pool.query(
      'INSERT INTO public.users (id, email, first_name, last_name) VALUES ($1, $2, $3, $4)',
      [userId, userEmail, 'Postman', 'NewUser']
    );

    // 2. Create Draft Requisition
    await pool.query(
      `INSERT INTO public.job_requisitions 
       (id, creator_id, title, department, location, job_type, experience, description, state, is_locked) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [reqId, userId, 'Postman Fresh Run', 'Product', 'remote', 'full-time', 'senior', 'A fresh test requisition for Postman.', 'draft', false]
    );

    console.log('--- TEST DATA FOR POSTMAN ---');
    console.log('USER_ID: ' + userId);
    console.log('REQUISITION_ID: ' + reqId);
    console.log('-----------------------------');
  } catch (err) {
    console.error('Setup failed:', err.message);
  } finally {
    process.exit();
  }
}
setup();