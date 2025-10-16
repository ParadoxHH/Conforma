import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './src/prisma/schema.prisma',
  seed: 'ts-node src/prisma/seed.ts',
});
