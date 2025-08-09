# Social Media Integration Feature

## Overview

The Social Media Integration feature allows FlexHub sites to connect their social media channels (YouTube, Twitch, etc.) and expose selected statistics through a public API. This enables site owners to display their social media metrics on external websites, embed widgets, and provide real-time social proof.

## Features

- **Multi-Platform Support**: Currently supports YouTube and Twitch, with extensible architecture for more platforms
- **Selective Stats**: Users can choose which statistics to display publicly
- **Real-Time Data**: Stats are automatically updated via API calls (cached for performance)
- **Public API**: Read-only public endpoint with CORS support for cross-origin requests
- **Multiple Channels**: Support for multiple channels per platform per site

## Supported Platforms

### YouTube

- **Channel Statistics**:
  - Subscriber count
  - Total view count
  - Video count
  - Channel thumbnail (avatar image)
  - Channel description
  - Channel name
  - Channel URL
- **Data Source**: YouTube Data API v3
- **Update Frequency**: Every 10 minutes (configurable)

### Twitch

- **Channel Statistics**:
  - Follower count
  - Total views
  - Channel name
  - Channel URL
- **Status**: Framework ready, API integration pending

## Database Schema

### SocialMediaChannel

Stores individual social media channels for each site:

- `platform`: Enum (YOUTUBE, TWITCH, etc.)
- `channelId`: Platform-specific identifier
- `channelName`: Display name
- `channelUrl`: Full URL to channel
- `isActive`: Enable/disable channel
- `displayOrder`: Order for public display

### SocialMediaChannelStat

Stores individual statistics for each channel:

- `statType`: Type of statistic (YOUTUBE_SUBSCRIBERS, etc.)
- `displayName`: Human-readable name
- `isEnabled`: Show/hide this stat publicly
- `value`: Cached current value
- `lastUpdated`: When data was last fetched

## API Endpoints

### Admin Endpoints (Authentication Required)

#### GET /api/sites/[siteId]/social-media

Fetch all social media channels for a site

```json
{
  "channels": [
    {
      "id": "channel-uuid",
      "platform": "YOUTUBE",
      "channelId": "UCxxxxx",
      "channelName": "My Channel",
      "channelUrl": "https://youtube.com/channel/UCxxxxx",
      "isActive": true,
      "stats": [
        {
          "id": "stat-uuid",
          "statType": "YOUTUBE_SUBSCRIBERS",
          "displayName": "Subscribers",
          "isEnabled": true,
          "value": "1.2K",
          "lastUpdated": "2023-12-01T10:00:00Z"
        }
      ]
    }
  ]
}
```

#### POST /api/sites/[siteId]/social-media

Add a new social media channel

```json
{
  "platform": "YOUTUBE",
  "channelId": "UCxxxxx",
  "enabledStats": ["YOUTUBE_SUBSCRIBERS", "YOUTUBE_TOTAL_VIEWS"]
}
```

#### PUT /api/sites/[siteId]/social-media/[channelId]

Update channel settings or stats configuration

```json
{
  "isActive": true,
  "stats": [
    {
      "id": "stat-uuid",
      "isEnabled": false
    }
  ]
}
```

#### DELETE /api/sites/[siteId]/social-media/[channelId]

Remove a social media channel

### Public Endpoints (No Authentication)

#### GET /api/public/sites/[siteId]/social-media

Fetch public social media data for a site

```json
{
  "channels": [
    {
      "id": "channel-uuid",
      "platform": "YOUTUBE",
      "channelId": "UCxxxxx",
      "channelName": "My Channel",
      "channelUrl": "https://youtube.com/channel/UCxxxxx",
      "stats": [
        {
          "type": "YOUTUBE_SUBSCRIBERS",
          "displayName": "Subscribers",
          "value": "1.2K",
          "lastUpdated": "2023-12-01T10:00:00Z"
        }
      ]
    }
  ],
  "count": 1,
  "lastUpdated": "2023-12-01T10:00:00Z"
}
```

**Features**:

- CORS enabled for cross-origin requests
- Cached responses (5 minutes)
- Only returns active channels and enabled stats
- Automatically refreshes stale data

## Admin Interface

The admin interface is integrated into the site management dashboard:

### Features

- **Add Channels**: Select platform and enter channel ID/URL
- **Configure Stats**: Choose which statistics to display publicly
- **Toggle Channels**: Enable/disable channels without deleting
- **Visual Management**: Icons and colors for different platforms
- **Real-time Validation**: Validates channel IDs when adding

### Channel Configuration

1. Navigate to site admin page
2. Scroll to "Social Media Integration" section
3. Click "Add Channel"
4. Select platform (YouTube, Twitch, etc.)
5. Enter channel ID or URL
6. Choose which stats to display
7. Save channel

### Stats Management

- Toggle individual statistics on/off
- Reorder stats for display
- Update display names
- View last updated timestamps

## Usage Examples

### Basic JavaScript Integration

```javascript
// Fetch social media data
async function loadSocialMediaStats(siteId) {
  try {
    const response = await fetch(`/api/public/sites/${siteId}/social-media`);
    const data = await response.json();

    data.channels.forEach((channel) => {
      console.log(`${channel.channelName} (${channel.platform}):`);
      channel.stats.forEach((stat) => {
        console.log(`  ${stat.displayName}: ${stat.value}`);
      });
    });
  } catch (error) {
    console.error("Failed to load social media stats:", error);
  }
}
```

### React Component Example

```jsx
import { useState, useEffect } from "react";

function SocialMediaWidget({ siteId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/sites/${siteId}/social-media`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load social media data:", err);
        setLoading(false);
      });
  }, [siteId]);

  if (loading) return <div>Loading...</div>;
  if (!data?.channels?.length) return <div>No social media channels</div>;

  return (
    <div className="social-media-widget">
      {data.channels.map((channel) => (
        <div key={channel.id} className="channel">
          <h3>{channel.channelName}</h3>
          <div className="stats">
            {channel.stats.map((stat) => (
              <div key={stat.type} className="stat">
                <span className="value">{stat.value}</span>
                <span className="label">{stat.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Enhanced Widget with Thumbnails and Descriptions

```jsx
function EnhancedSocialMediaWidget({ siteId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/public/sites/${siteId}/social-media`)
      .then((res) => res.json())
      .then(setData);
  }, [siteId]);

  if (!data?.channels?.length) return null;

  return (
    <div className="social-media-widget">
      {data.channels.map((channel) => {
        // Extract specific stats for special display
        const thumbnail = channel.stats.find(
          (s) => s.type === "YOUTUBE_THUMBNAIL"
        )?.value;
        const description = channel.stats.find(
          (s) => s.type === "YOUTUBE_DESCRIPTION"
        )?.value;
        const subscribers = channel.stats.find(
          (s) => s.type === "YOUTUBE_SUBSCRIBERS"
        )?.value;
        const views = channel.stats.find(
          (s) => s.type === "YOUTUBE_TOTAL_VIEWS"
        )?.value;

        return (
          <div key={channel.id} className="channel-card">
            <div className="channel-header">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={`${channel.channelName} avatar`}
                  className="channel-avatar"
                  style={{ width: "48px", height: "48px", borderRadius: "50%" }}
                />
              )}
              <div className="channel-info">
                <h3>{channel.channelName}</h3>
                <a
                  href={channel.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Channel
                </a>
              </div>
            </div>

            {description && (
              <p className="channel-description">
                {description.length > 100
                  ? `${description.substring(0, 100)}...`
                  : description}
              </p>
            )}

            <div className="channel-stats">
              {subscribers && (
                <div className="stat-highlight">
                  <strong>{subscribers}</strong> Subscribers
                </div>
              )}
              {views && (
                <div className="stat-highlight">
                  <strong>{views}</strong> Total Views
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### WordPress Integration

```php
// WordPress shortcode for displaying social media stats
function flexhub_social_media_stats($atts) {
    $atts = shortcode_atts(array(
        'site_id' => '',
        'flexhub_url' => ''
    ), $atts);

    if (empty($atts['site_id']) || empty($atts['flexhub_url'])) {
        return '<p>Please provide site_id and flexhub_url parameters.</p>';
    }

    $api_url = $atts['flexhub_url'] . '/api/public/sites/' . $atts['site_id'] . '/social-media';
    $response = wp_remote_get($api_url);

    if (is_wp_error($response)) {
        return '<p>Failed to load social media stats.</p>';
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);

    if (empty($data['channels'])) {
        return '<p>No social media channels configured.</p>';
    }

    $output = '<div class="flexhub-social-stats">';
    foreach ($data['channels'] as $channel) {
        $output .= '<div class="channel">';
        $output .= '<h4>' . esc_html($channel['channelName']) . '</h4>';
        foreach ($channel['stats'] as $stat) {
            $output .= '<div class="stat">';
            $output .= '<span class="value">' . esc_html($stat['value']) . '</span>';
            $output .= '<span class="label">' . esc_html($stat['displayName']) . '</span>';
            $output .= '</div>';
        }
        $output .= '</div>';
    }
    $output .= '</div>';

    return $output;
}
add_shortcode('flexhub_social_stats', 'flexhub_social_media_stats');
```

## Configuration

### Environment Variables

```env
# Required for YouTube integration
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your environment variables

### Feature Enablement

The social media integration must be enabled for each site:

1. Go to site admin panel
2. Navigate to "Features Management"
3. Add "Social Media Integration" feature
4. Enable the feature

## Security & Privacy

### Data Protection

- Only publicly available social media data is fetched
- No private user data is accessed
- Channel owners must explicitly add their channels

### Rate Limiting

- API calls are cached to prevent excessive requests
- YouTube API quotas are respected
- Stale data is served if APIs are unavailable

### CORS Configuration

CORS is enabled centrally via the app’s headers configuration for all /api/public/* routes. No per-endpoint CORS headers are required.

## Troubleshooting

### Common Issues

#### "Invalid YouTube channel ID"

- Ensure the channel ID starts with "UC" (24 characters)
- Try using the full channel URL instead
- Check that the channel is public

#### "Social media integration not enabled"

- Verify the feature is enabled in site admin
- Check user permissions (admin/superadmin required)

#### "Failed to load social media stats"

- Check API endpoint URL
- Verify CORS configuration
- Ensure site ID is correct

### Error Codes

- `404`: Site not found or feature not enabled
- `403`: Feature disabled or insufficient permissions
- `500`: Server error (check logs)

## Extending the Feature

### Adding New Platforms

1. Add platform to `SocialMediaPlatform` enum in schema
2. Add stat types to `SocialMediaStatType` enum
3. Implement platform-specific service (like `YouTubeService`)
4. Update API endpoints to handle new platform
5. Add platform info to admin UI

### Custom Statistics

1. Add new stat types to enum
2. Update platform services to fetch new data
3. Update admin UI to show new options
4. Test with public API

## Testing

### Demo Page

Visit `/social-media-api-example.html` for an interactive demo of the public API.

### Manual Testing

1. Enable social media integration feature for a site
2. Add a YouTube channel with valid channel ID
3. Configure which stats to display
4. Test public API endpoint
5. Verify data updates after cache expiry

## Performance Considerations

- API responses are cached for 5 minutes
- Database queries are optimized with proper indexes
- Only active channels and enabled stats are processed
- Background updates prevent API timeouts

## Future Enhancements

- [ ] Twitch API integration
- [ ] Instagram Basic Display API
- [ ] Twitter API v2 integration
- [ ] TikTok for Developers API
- [ ] Webhook support for real-time updates
- [ ] Advanced analytics and historical data
- [ ] Customizable stat formatting
- [ ] Bulk channel management
- [ ] API rate limiting per site
