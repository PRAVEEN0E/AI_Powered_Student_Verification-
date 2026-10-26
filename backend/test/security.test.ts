import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/index.js';
import jwt from 'jsonwebtoken';

describe('AICTE APAAR Security & Compliance Engine Tests', async () => {
  let app: any;

  before(async () => {
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  // 1. Unauthenticated Request Rejection
  test('Negative Auth: GET /api/students without token must return 401 Unauthorized', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/students'
    });
    assert.equal(res.statusCode, 401);
    const body = JSON.parse(res.payload);
    assert.equal(body.error, 'Unauthorized');
  });

  // 2. Role Privilege Escalation Rejection
  test('Negative Auth: STUDENT attempting to access AICTE Admin Dashboard must return 403 Forbidden', async () => {
    const studentToken = app.jwt.sign({
      id: 'mock-student-id',
      email: 'student@example.com',
      role: 'STUDENT'
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/analytics/national',
      headers: {
        authorization: `Bearer ${studentToken}`
      }
    });

    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.payload);
    assert.equal(body.error, 'Forbidden');
  });

  // 3. Format Validation: 12-digit APAAR ID validation check
  test('Validation Engine: Invalid APAAR ID length (<12 digits) on single admission must be rejected', async () => {
    const adminToken = app.jwt.sign({
      id: 'admin-1',
      email: 'admin@college.edu',
      role: 'COLLEGE_ADMIN',
      institutionId: 'inst-1'
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/students/register',
      headers: {
        authorization: `Bearer ${adminToken}`
      },
      payload: {
        apaarId: '12345', // Invalid: only 5 digits
        fullName: 'Test Candidate',
        dob: '2004-05-12',
        gender: 'Female',
        programId: 'prog-1',
        academicYear: '2026-2027',
        rollNumber: '23CS01',
        category: 'APPROVED_INTAKE'
      }
    });

    assert.equal(res.statusCode, 400); // Fastify JSON schema validation reject
  });

  // 4. Credential Verification & Tamper Detection
  test('Digital Credential Engine: Tampered signature token must fail verification with 400 Bad Request', async () => {
    const validSecret = 'aicte-production-edupass-signing-key-sec-256';
    const fakeToken = jwt.sign({
      sub: 'fake-student',
      fullName: 'Hacked Candidate',
      degreeAwarded: true
    }, 'wrong-secret-key'); // Signed with rogue key

    const res = await app.inject({
      method: 'GET',
      url: `/api/credentials/verify?token=${fakeToken}`
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.payload);
    assert.equal(body.authentic, false);
    assert.equal(body.tampered, true);
  });
});
