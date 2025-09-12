import { NextResponse } from 'next/server';
import { LogParser } from '@/lib/log-parser';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const logFilePath = path.join(process.cwd(), 'logs', 'examples', 'dotnet-service-cert-error.log');
    const logContent = fs.readFileSync(logFilePath, 'utf-8');

    const parser = new LogParser();
    const events = parser.parse(logContent, 'auto');

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
