import html2canvas from 'html2canvas';

// Format time in 12-hour format with AM/PM
const formatTime12Hour = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes || '00';
  
  if (hour === 0) {
    return `12:${min} AM`;
  } else if (hour < 12) {
    return `${hour}:${min} AM`;
  } else if (hour === 12) {
    return `12:${min} PM`;
  } else {
    return `${hour - 12}:${min} PM`;
  }
};

// Create a shareable event card image
export const createEventCardImage = async (event: any): Promise<Blob | null> => {
  try {
    // Create a temporary container for the event card
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 400px;
      z-index: -1;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    `;

    // Format the date
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const timeRange = event.endTime 
      ? `${formatTime12Hour(event.time)} - ${formatTime12Hour(event.endTime)}`
      : formatTime12Hour(event.time);

    // Create the HTML content matching the event card design
    container.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <!-- Cover Image -->
        <div style="
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-image: url('${event.coverImage || ''}');
          background-size: cover;
          background-position: center;
          position: relative;
        ">
          ${event.trending ? `
            <div style="
              position: absolute;
              top: 12px;
              right: 12px;
              background: linear-gradient(135deg, #FFD700, #FFA500);
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            ">🔥 Trending</div>
          ` : ''}
          
          <div style="
            position: absolute;
            top: 12px;
            left: 12px;
            background: ${getCategoryColor(event.category)};
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          ">${event.category}</div>
          
          <div style="
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: white;
            border-radius: 12px;
            padding: 8px 12px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          ">
            <div style="font-size: 20px; font-weight: 700; color: #2fce98;">${day}</div>
            <div style="font-size: 10px; color: #666; text-transform: uppercase;">${month}</div>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 20px;">
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
          ">${event.title}</h3>
          
          <div style="
            font-size: 13px;
            color: #666;
            margin-bottom: 6px;
          ">🕐 ${timeRange}</div>
          
          <div style="
            font-size: 13px;
            color: #666;
            margin-bottom: 12px;
          ">📍 ${event.location} ${event.venue ? `• ${event.venue}` : ''}</div>
          
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e5e5e5;
          ">
            <div style="
              font-size: 12px;
              color: #999;
            ">
              ${event.organizer ? `Hosted by ${event.organizer}` : ''}
              ${event.attendees ? ` • ${event.attendees} attending` : ''}
            </div>
            
            <div style="
              background: ${event.price === 0 ? '#2fce98' : '#4A90A4'};
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            ">${event.price === 0 ? 'FREE' : `${event.currency || 'RM'} ${event.price}`}</div>
          </div>
          
          <!-- App branding and link -->
          <div style="
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
          ">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #2fce98;
              margin-bottom: 4px;
            ">BerseMuka</div>
            <div style="
              background: #f0f9f6;
              padding: 8px 12px;
              border-radius: 8px;
              margin: 8px 0;
            ">
              <div style="
                font-size: 12px;
                color: #2fce98;
                font-weight: 600;
                margin-bottom: 4px;
              ">🔗 Join this event:</div>
              <div style="
                font-size: 11px;
                color: #4A90A4;
                word-break: break-all;
                font-family: monospace;
              ">berse.app/event/${event.id}</div>
            </div>
            <div style="
              font-size: 10px;
              color: #999;
              margin-top: 4px;
            ">Scan or visit link to register</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Generate the image
    const canvas = await html2canvas(container, {
      background: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true, // Allow cross-origin images
      allowTaint: true
    });

    document.body.removeChild(container);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.95);
    });
  } catch (error) {
    console.error('Error creating event card image:', error);
    return null;
  }
};

// Create a shareable profile card image
export const createProfileCardImage = async (profile: any): Promise<Blob | null> => {
  try {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 400px;
      z-index: -1;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    `;

    // Create the HTML content for profile card
    container.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <!-- Profile Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px 20px;
          text-align: center;
          position: relative;
        ">
          <!-- Avatar -->
          <div style="
            width: 100px;
            height: 100px;
            margin: 0 auto 16px;
            background: ${profile.avatarColor || '#4A90A4'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 600;
            color: white;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          ">
            ${profile.avatar || profile.initials || '👤'}
          </div>
          
          <h2 style="
            margin: 0 0 4px 0;
            font-size: 24px;
            font-weight: 600;
            color: white;
          ">${profile.fullName || profile.name}</h2>
          
          <div style="
            font-size: 14px;
            color: rgba(255,255,255,0.9);
          ">${profile.profession || 'Professional'}</div>
        </div>

        <!-- Content -->
        <div style="padding: 20px;">
          ${profile.bio ? `
            <div style="
              font-size: 14px;
              color: #666;
              line-height: 1.5;
              margin-bottom: 20px;
              text-align: center;
              font-style: italic;
            ">"${profile.bio}"</div>
          ` : ''}
          
          <!-- Stats -->
          <div style="
            display: flex;
            justify-content: space-around;
            padding: 16px 0;
            border-top: 1px solid #e5e5e5;
            border-bottom: 1px solid #e5e5e5;
          ">
            ${profile.age ? `
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #333;">${profile.age}</div>
                <div style="font-size: 11px; color: #999;">Age</div>
              </div>
            ` : ''}
            
            ${profile.location ? `
              <div style="text-align: center;">
                <div style="font-size: 14px; font-weight: 600; color: #333;">📍</div>
                <div style="font-size: 11px; color: #999;">${profile.location}</div>
              </div>
            ` : ''}
            
            ${profile.interests ? `
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #333;">${profile.interests.length}</div>
                <div style="font-size: 11px; color: #999;">Interests</div>
              </div>
            ` : ''}
          </div>
          
          <!-- Interests -->
          ${profile.interests && profile.interests.length > 0 ? `
            <div style="margin-top: 16px;">
              <div style="font-size: 12px; color: #999; margin-bottom: 8px;">Interests</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${profile.interests.slice(0, 5).map((interest: string) => `
                  <span style="
                    background: #f0f9f6;
                    color: #2fce98;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                  ">${interest}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- App branding -->
          <div style="
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
          ">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #2fce98;
              margin-bottom: 4px;
            ">BerseMuka</div>
            <div style="
              background: #f0f9f6;
              padding: 8px 12px;
              border-radius: 8px;
              margin: 8px 0;
            ">
              <div style="
                font-size: 12px;
                color: #2fce98;
                font-weight: 600;
                margin-bottom: 4px;
              ">🔗 Connect with me:</div>
              <div style="
                font-size: 11px;
                color: #4A90A4;
                word-break: break-all;
                font-family: monospace;
              ">berse.app/profile/${profile.id}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      background: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    document.body.removeChild(container);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.95);
    });
  } catch (error) {
    console.error('Error creating profile card image:', error);
    return null;
  }
};

// Share event with image
export const shareEventWithImage = async (event: any) => {
  try {
    // Generate the image
    const imageBlob = await createEventCardImage(event);
    
    if (!imageBlob) {
      // Fallback to text-only sharing
      return shareEventText(event);
    }

    const imageFile = new File([imageBlob], `event-${event.id}.png`, { type: 'image/png' });
    
    // Generate event URL
    const eventUrl = `https://berse.app/event/${event.id}`;
    
    // Prepare share data with link
    const shareData: any = {
      title: event.title,
      text: `🎉 ${event.title}\n📅 ${event.date} at ${formatTime12Hour(event.time)}\n📍 ${event.location}\n\n🔗 Join here: ${eventUrl}\n\nRegister now on BerseMuka!`,
      files: [imageFile],
      url: eventUrl
    };

    // Check if Web Share API is available and supports file sharing
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share(shareData);
    } else {
      // Fallback: Download the image
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BerseMuka-Event-${event.title.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Event image downloaded! You can now share it on WhatsApp, Instagram, or any other platform.');
    }
  } catch (error) {
    console.error('Error sharing event:', error);
    // Fallback to text sharing
    shareEventText(event);
  }
};

// Share profile with image
export const shareProfileWithImage = async (profile: any) => {
  try {
    const imageBlob = await createProfileCardImage(profile);
    
    if (!imageBlob) {
      return shareProfileText(profile);
    }

    const imageFile = new File([imageBlob], `profile-${profile.id}.png`, { type: 'image/png' });
    
    const profileUrl = `https://berse.app/profile/${profile.id}`;
    
    const shareData: any = {
      title: `Connect with ${profile.fullName || profile.name}`,
      text: `👋 Meet ${profile.fullName || profile.name} on BerseMuka!\n${profile.bio || ''}\n\n🔗 Connect here: ${profileUrl}\n\nJoin the Berse community!`,
      files: [imageFile],
      url: profileUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share(shareData);
    } else {
      // Fallback: Download the image
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BerseMuka-Profile-${(profile.fullName || profile.name).replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Profile image downloaded! You can now share it on WhatsApp, Instagram, or any other platform.');
    }
  } catch (error) {
    console.error('Error sharing profile:', error);
    shareProfileText(profile);
  }
};

// Fallback text-only sharing
const shareEventText = (event: any) => {
  const eventUrl = `https://berse.app/event/${event.id}`;
  const shareText = `🎉 ${event.title}\n📅 ${event.date} at ${formatTime12Hour(event.time)}\n📍 ${event.location}\n💰 ${event.price === 0 ? 'FREE' : `${event.currency || 'RM'} ${event.price}`}\n\n🔗 Join here: ${eventUrl}\n\nRegister on BerseMuka!`;
  
  if (navigator.share) {
    navigator.share({
      title: event.title,
      text: shareText,
      url: eventUrl
    }).catch(() => {
      copyToClipboard(shareText);
    });
  } else {
    copyToClipboard(shareText);
  }
};

const shareProfileText = (profile: any) => {
  const profileUrl = `https://berse.app/profile/${profile.id}`;
  const shareText = `👋 Meet ${profile.fullName || profile.name} on BerseMuka!\n${profile.bio || ''}\n\n🔗 Connect here: ${profileUrl}`;
  
  if (navigator.share) {
    navigator.share({
      title: `Connect with ${profile.fullName || profile.name}`,
      text: shareText,
      url: profileUrl
    }).catch(() => {
      copyToClipboard(shareText);
    });
  } else {
    copyToClipboard(shareText);
  }
};

// Helper function to copy text to clipboard
const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('Copied to clipboard! You can now paste and share.');
};

// Get category color
const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    social: '#667eea',
    sports: '#f97316',
    volunteer: '#10b981',
    donate: '#ec4899',
    trips: '#06b6d4'
  };
  return colors[category?.toLowerCase()] || '#4A90A4';
};