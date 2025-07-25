import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { 
  detectTimezone, 
  isValidTimezone, 
  isValidLanguage, 
  isValidDateFormat, 
  isValidTimeFormat, 
  isValidTheme 
} from '@/lib/utils/timezone';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences, create default if not exists
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          timezone: detectTimezone(),
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          theme: 'system',
          autoSave: true,
          showTutorials: true,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching general settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch general settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      timezone,
      language,
      dateFormat,
      timeFormat,
      theme,
      autoSave,
      showTutorials,
    } = body;

    // Validate input
    if (timezone && !isValidTimezone(timezone)) {
      return NextResponse.json(
        { error: 'Invalid timezone' },
        { status: 400 }
      );
    }

    if (language && !isValidLanguage(language)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }

    if (dateFormat && !isValidDateFormat(dateFormat)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (timeFormat && !isValidTimeFormat(timeFormat)) {
      return NextResponse.json(
        { error: 'Invalid time format' },
        { status: 400 }
      );
    }

    if (theme && !isValidTheme(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...(timezone !== undefined && { timezone }),
        ...(language !== undefined && { language }),
        ...(dateFormat !== undefined && { dateFormat }),
        ...(timeFormat !== undefined && { timeFormat }),
        ...(theme !== undefined && { theme }),
        ...(autoSave !== undefined && { autoSave }),
        ...(showTutorials !== undefined && { showTutorials }),
      },
      create: {
        userId: session.user.id,
        timezone: timezone || detectTimezone(),
        language: language || 'en',
        dateFormat: dateFormat || 'MM/DD/YYYY',
        timeFormat: timeFormat || '12h',
        theme: theme || 'system',
        autoSave: autoSave !== undefined ? autoSave : true,
        showTutorials: showTutorials !== undefined ? showTutorials : true,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating general settings:', error);
    return NextResponse.json(
      { error: 'Failed to update general settings' },
      { status: 500 }
    );
  }
} 