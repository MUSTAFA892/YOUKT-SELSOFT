import { pool } from '../../src/db/pool.js';
import crypto from 'crypto';

async function setup() {
  try {
    // 1. Ensure Roles exist
    const companyId = 'd22db9d9-c652-46dd-aea9-c650b050d80e';
    let hrRoles = await pool.query("SELECT id FROM public.roles WHERE name = 'HR'");
    let ceoRoles = await pool.query("SELECT id FROM public.roles WHERE name = 'CEO'");

    if (hrRoles.rowCount === 0) {
      await pool.query('INSERT INTO public.roles (id, name, description, company_id) VALUES ($1, $2, $3, $4)', 
        [crypto.randomUUID(), 'HR', 'Human Resources - Creator', companyId]);
      hrRoles = await pool.query("SELECT id FROM public.roles WHERE name = 'HR'");
    }
    if (ceoRoles.rowCount === 0) {
      await pool.query('INSERT INTO public.roles (id, name, description, company_id) VALUES ($1, $2, $3, $4)', 
        [crypto.randomUUID(), 'CEO', 'Chief Executive Officer - Approver', companyId]);
      ceoRoles = await pool.query("SELECT id FROM public.roles WHERE name = 'CEO'");
    }

    const roles = { HR: hrRoles.rows[0].id, CEO: ceoRoles.rows[0].id };

    // 2. Create Users
    const hrId = crypto.randomUUID();
    const ceoId = crypto.randomUUID();
    
    await pool.query(
      'INSERT INTO public.users (id, email, first_name, last_name, role_id, company_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [hrId, `hr_${Date.now()}@example.com`, 'Sarah', 'HR', roles['HR'], companyId]
    );
    await pool.query(
      'INSERT INTO public.users (id, email, first_name, last_name, role_id, company_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [ceoId, `ceo_${Date.now()}@example.com`, 'John', 'CEO', roles['CEO'], companyId]
    );

    // 3. Create Draft Requisition (Created by HR)
    const reqId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO public.job_requisitions 
       (id, creator_id, title, department, location, job_type, experience, description, state, is_locked, company_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [reqId, hrId, 'Executive Strategy Lead', 'Leadership', 'hybrid', 'full-time', 'executive', 'Strategic role requiring CEO approval.', 'draft', false, companyId]
    );

    console.log('\n--- SYSTEM PERSONAS READY ---');
    console.log('HR_USER_ID (CREATOR): ' + hrId);
    console.log('CEO_USER_ID (APPROVER): ' + ceoId);
    console.log('REQUISITION_ID: ' + reqId);
    console.log('-----------------------------\n');
    console.log('FLOW: Use HR_USER_ID as "creator_id" in the DB, and CEO_USER_ID as "changed_by" in Postman.');
  } catch (err) {
    console.error('Setup failed:', err.message);
  } finally {
    process.exit();
  }
}
setup();
