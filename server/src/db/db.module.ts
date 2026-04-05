import { Module, Global } from '@nestjs/common';
import { databaseProvider } from './database.provider';

@Global() // <--- هذي تخلي الـ DB تمشي في المشروع الكل
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider], // <--- هذي تسمح للـ Modules الأخرى باستعمال الـ DB
})
export class DbModule {}