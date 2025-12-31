import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { NearbyFacility, FacilityType } from '@/types';

// MongoDB document interfaces
interface SpotDocument {
  _id: ObjectId;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface FacilityDocument {
  _id: ObjectId;
  name: string;
  type: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /api/spots/[id]/facilities - 근처 편의시설 조회
 * Requirements: 4.1, 4.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const radiusKm = parseFloat(searchParams.get('radius') || '2'); // Default 2km radius
    const maxResults = parseInt(searchParams.get('limit') || '50'); // Default 50 results

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid spot ID format' },
        { status: 400 }
      );
    }

    // Get spot coordinates
    const spotsCollection = await getCollection<SpotDocument>('spots');
    const spot = await spotsCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { coordinates: 1 } }
    );

    if (!spot) {
      return NextResponse.json(
        { error: 'Spot not found' },
        { status: 404 }
      );
    }

    // Get all facilities (in a real app, you'd use geospatial queries)
    const facilitiesCollection = await getCollection<FacilityDocument>('facilities');
    const allFacilities = await facilitiesCollection.find({}).toArray();

    // Calculate distances and filter by radius
    const nearbyFacilities: NearbyFacility[] = allFacilities
      .map(facility => {
        const distance = calculateDistance(
          spot.coordinates.lat,
          spot.coordinates.lng,
          facility.coordinates.lat,
          facility.coordinates.lng
        );

        return {
          id: facility._id.toString(),
          name: facility.name,
          type: facility.type as FacilityType,
          distance: Math.round(distance), // Round to nearest meter
          address: facility.address,
          coordinates: [facility.coordinates.lat, facility.coordinates.lng] as [number, number],
        };
      })
      .filter(facility => facility.distance <= radiusKm * 1000) // Convert km to meters
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, maxResults); // Limit results

    return NextResponse.json(nearbyFacilities);
  } catch (error) {
    console.error('Error fetching nearby facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby facilities' },
      { status: 500 }
    );
  }
}