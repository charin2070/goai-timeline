import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    storageDbHost: process.env.STORAGE_DB_HOST,
    storageDbPort: process.env.STORAGE_DB_PORT,
  });
}
