// Mux Service - Video Streaming & HLS Integration
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const USE_MOCK = true; // Set to false when Mux API keys ready
const MUX_API_BASE = 'https://api.mux.com/video/v1';

export const createMuxLiveStream = async (streamKey, streamTitle) => {
  try {
    if (USE_MOCK) {
      return {
        success: true,
        playbackId: `mock_playback_${Date.now()}`,
        rtmpIngestUrl: 'rtmp://echo.nyxscream.tv/live',
        rtmpStreamKey: streamKey,
        status: 'ready'
      };
    }

    const response = await fetch(`${MUX_API_BASE}/live-streams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(process.env.REACT_APP_MUX_ACCESS_TOKEN + ':')}`
      },
      body: JSON.stringify({
        playback_policy: ['public'],
        reconnect_window: 60,
        test: false
      })
    });

    const data = await response.json();
    return {
      success: true,
      playbackId: data.data.playback_ids[0].id,
      rtmpIngestUrl: data.data.rtmp_server_url,
      rtmpStreamKey: data.data.stream_key,
      status: 'ready'
    };
  } catch (error) {
    console.error('◉ Mux stream creation failed:', error);
    return { success: false, error: error.message };
  }
};

export const getMuxStreamStatus = async (playbackId) => {
  try {
    if (USE_MOCK) {
      return {
        status: Math.random() > 0.5 ? 'active' : 'idle',
        viewerCount: Math.floor(Math.random() * 1000),
        bitrate: Math.floor(Math.random() * 5000) + 500
      };
    }

    const response = await fetch(`${MUX_API_BASE}/live-streams/${playbackId}`, {
      headers: {
        'Authorization': `Basic ${btoa(process.env.REACT_APP_MUX_ACCESS_TOKEN + ':')}`
      }
    });

    const data = await response.json();
    return {
      status: data.data.status,
      viewerCount: data.data.active_viewers || 0,
      bitrate: data.data.recent_checks?.[0]?.bitrate || 0
    };
  } catch (error) {
    console.error('◉ Status fetch failed:', error);
    return { status: 'unknown', viewerCount: 0, bitrate: 0 };
  }
};

export const endMuxLiveStream = async (liveStreamId) => {
  try {
    if (USE_MOCK) {
      return { success: true, message: 'Stream ended' };
    }

    const response = await fetch(`${MUX_API_BASE}/live-streams/${liveStreamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${btoa(process.env.REACT_APP_MUX_ACCESS_TOKEN + ':')}`
      }
    });

    return { success: response.ok, message: response.ok ? 'Stream ended' : 'Failed to end stream' };
  } catch (error) {
    console.error('◉ Stream end failed:', error);
    return { success: false, error: error.message };
  }
};

export const getHlsManifestUrl = (playbackId) => {
  return `https://image.mux.com/${playbackId}/manifest.m3u8`;
};

export const getRtmpIngestUrl = () => {
  return 'rtmp://echo.nyxscream.tv/live';
};

export const getStreamAnalytics = async (liveStreamId) => {
  try {
    if (USE_MOCK) {
      return {
        totalViewers: Math.floor(Math.random() * 5000),
        peakViewers: Math.floor(Math.random() * 10000),
        totalWatchTime: Math.floor(Math.random() * 100000),
        averageBitrate: Math.floor(Math.random() * 5000) + 500
      };
    }

    const response = await fetch(`${MUX_API_BASE}/live-streams/${liveStreamId}/metrics`, {
      headers: {
        'Authorization': `Basic ${btoa(process.env.REACT_APP_MUX_ACCESS_TOKEN + ':')}`
      }
    });

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('◉ Analytics fetch failed:', error);
    return { totalViewers: 0, peakViewers: 0, totalWatchTime: 0 };
  }
};

export const simulateViewerConnection = async (playbackId) => {
  try {
    if (USE_MOCK) {
      return {
        success: true,
        viewerId: `viewer_${Date.now()}`,
        status: 'connected'
      };
    }

    return {
      success: true,
      viewerId: `viewer_${Date.now()}`,
      status: 'connected'
    };
  } catch (error) {
    console.error('◉ Viewer simulation failed:', error);
    return { success: false, error: error.message };
  }
};

export const updateStreamMetadata = async (liveStreamId, metadata) => {
  try {
    if (USE_MOCK) {
      return { success: true, message: 'Metadata updated' };
    }

    const response = await fetch(`${MUX_API_BASE}/live-streams/${liveStreamId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(process.env.REACT_APP_MUX_ACCESS_TOKEN + ':')}`
      },
      body: JSON.stringify(metadata)
    });

    return { success: response.ok, message: response.ok ? 'Metadata updated' : 'Failed' };
  } catch (error) {
    console.error('◉ Metadata update failed:', error);
    return { success: false, error: error.message };
  }
};