import { NextResponse } from 'next/server';
import { LogEvent } from '@/lib/log-parser';

// This is an in-memory store and will reset on server restarts.
// For persistent storage, a database (e.g., Supabase, PostgreSQL, MongoDB) would be required.
const globalEvents: LogEvent[] = [];

export async function POST(request: Request) {
  try {
    const newEvent: LogEvent = await request.json();
    globalEvents.push(newEvent);
    console.log('New event added:', newEvent);
    return NextResponse.json({ message: 'Event added successfully', event: newEvent, currentTotalEvents: globalEvents.length }, { status: 200 });
  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json({ error: 'Failed to add event', details: error.message }, { status: 400 });
  }
}

// Optional: GET route to view current events (for debugging)
export async function GET() {
  return NextResponse.json({ events: globalEvents, totalEvents: globalEvents.length }, { status: 200 });
}