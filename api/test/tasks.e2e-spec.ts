import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const rows: any[] = []; let seq = 1;
const fake = {
  task: {
    findMany: async () => [...rows].reverse(),
    findUnique: async ({ where }: any) => rows.find((r) => r.id === where.id) ?? null,
    create: async ({ data }: any) => { const r = { id: seq++, description: null, dueDate: null, status: 'TODO', createdAt: new Date(), ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) }; rows.push(r); return r; },
    update: async ({ where, data }: any) => { const r = rows.find((x) => x.id === where.id); Object.assign(r, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))); return r; },
    delete: async ({ where }: any) => { rows.splice(rows.findIndex((x) => x.id === where.id), 1); },
  },
  onModuleInit() {}, onModuleDestroy() {},
};

describe('Tasks API (in-memory Prisma fake)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const m = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(PrismaService).useValue(fake).compile();
    app = m.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });
  afterAll(() => app.close());
  const s = () => request(app.getHttpServer());

  it('creates, reads, updates and deletes a task', async () => {
    const c = await s().post('/tasks').send({ title: 'A', dueDate: '2026-12-01' }).expect(201);
    expect(c.body.status).toBe('TODO');
    await s().get(`/tasks/${c.body.id}`).expect(200);
    const u = await s().patch(`/tasks/${c.body.id}`).send({ status: 'DONE', dueDate: null, description: null }).expect(200);
    expect(u.body.status).toBe('DONE'); expect(u.body.dueDate).toBeNull();
    expect((await s().get('/tasks').expect(200)).body).toHaveLength(1);
    await s().delete(`/tasks/${c.body.id}`).expect(204);
    await s().get(`/tasks/${c.body.id}`).expect(404);
  });
  it('returns 400 for invalid input', async () => {
    await s().post('/tasks').send({}).expect(400);
    await s().post('/tasks').send({ title: '' }).expect(400);
    await s().post('/tasks').send({ title: 'x', status: 'NOPE' }).expect(400);
    await s().post('/tasks').send({ title: 'x', dueDate: 'tomorrow' }).expect(400);
    await s().post('/tasks').send({ title: 'x', extra: 1 }).expect(400);
    await s().get('/tasks/abc').expect(400);
  });
  it('returns 404 for a missing task', async () => {
    await s().get('/tasks/9999').expect(404);
    await s().patch('/tasks/9999').send({ title: 'x' }).expect(404);
    await s().delete('/tasks/9999').expect(404);
  });
});
