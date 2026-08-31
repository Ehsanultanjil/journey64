import {
  DistrictUserData,
  Visit,
  Trip,
  TravelStats,
  DivisionStat,
  Achievement,
} from '../../types';
import { DISTRICTS } from '../../data/districts';
import { DIVISIONS } from '../../data/divisions';
import { INITIAL_ACHIEVEMENTS } from '../../data/achievements';

export function calculateTravelStats(
  userData: Record<string, DistrictUserData>,
  visits: Visit[],
  trips: Trip[]
): TravelStats {
  const visitedDistricts = DISTRICTS.filter(
    (d) => userData[d.id]?.status === 'visited'
  );
  const wantToVisitDistricts = DISTRICTS.filter(
    (d) => userData[d.id]?.status === 'want_to_visit'
  );

  const visitedCount = visitedDistricts.length;
  const wantToVisitCount = wantToVisitDistricts.length;
  const notVisitedCount = 64 - visitedCount - wantToVisitCount;
  const percentageExplored = Number(((visitedCount / 64) * 100).toFixed(1));

  // Count divisions with at least 1 visited district
  const exploredDivisionsSet = new Set(visitedDistricts.map((d) => d.division));
  const divisionsExploredCount = exploredDivisionsSet.size;

  // Total photos
  const totalPhotos = visits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);

  // Total memories written
  const totalMemories = visits.filter(
    (v) => (v.notes && v.notes.trim().length > 0) || (v.photos && v.photos.length > 0)
  ).length;

  // Most visited district
  const visitCounts: Record<string, number> = {};
  visits.forEach((v) => {
    visitCounts[v.districtId] = (visitCounts[v.districtId] || 0) + 1;
  });

  let mostVisitedDistrict: { id: string; name: string; visits: number } | undefined = undefined;
  let maxVisits = 0;
  for (const [dId, count] of Object.entries(visitCounts)) {
    if (count > maxVisits) {
      maxVisits = count;
      const district = DISTRICTS.find((d) => d.id === dId);
      if (district) {
        mostVisitedDistrict = { id: district.id, name: district.name, visits: count };
      }
    }
  }

  // If no visits recorded yet but visited status exists, pick the first visited
  if (!mostVisitedDistrict && visitedDistricts.length > 0) {
    mostVisitedDistrict = {
      id: visitedDistricts[0].id,
      name: visitedDistricts[0].name,
      visits: 1,
    };
  }

  // Most explored division (highest percentage / count)
  let mostExploredDivision: { division: any; visited: number; total: number } | undefined = undefined;
  let maxDivPercentage = -1;
  for (const div of DIVISIONS) {
    const divDistricts = DISTRICTS.filter((d) => d.division === div.name);
    const divVisited = divDistricts.filter(
      (d) => userData[d.id]?.status === 'visited'
    ).length;
    const percentage = (divVisited / divDistricts.length) * 100;
    if (divVisited > 0 && percentage > maxDivPercentage) {
      maxDivPercentage = percentage;
      mostExploredDivision = {
        division: div.name,
        visited: divVisited,
        total: divDistricts.length,
      };
    }
  }

  // First visited district & Most recent visited district
  let firstVisitedDistrict: { id: string; name: string; date: string; photoUrl?: string } | undefined = undefined;
  let latestVisitedDistrict: { id: string; name: string; date: string; photoUrl?: string } | undefined = undefined;

  // Sort visits by date
  const sortedVisits = [...visits].filter((v) => v.visitDate).sort((a, b) => {
    return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
  });

  if (sortedVisits.length > 0) {
    const first = sortedVisits[0];
    const latest = sortedVisits[sortedVisits.length - 1];

    const firstDist = DISTRICTS.find((d) => d.id === first.districtId);
    const latestDist = DISTRICTS.find((d) => d.id === latest.districtId);

    if (firstDist) {
      firstVisitedDistrict = {
        id: firstDist.id,
        name: firstDist.name,
        date: first.visitDate,
        photoUrl: first.photos?.[0]?.url,
      };
    }
    if (latestDist) {
      latestVisitedDistrict = {
        id: latestDist.id,
        name: latestDist.name,
        date: latest.visitDate,
        photoUrl: latest.photos?.[0]?.url,
      };
    }
  } else if (visitedDistricts.length > 0) {
    // Fallback to user data date
    const withDate = visitedDistricts
      .map((d) => ({
        dist: d,
        date: userData[d.id]?.firstVisitedDate || '2023-01-01',
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const first = withDate[0];
    const latest = withDate[withDate.length - 1];

    firstVisitedDistrict = {
      id: first.dist.id,
      name: first.dist.name,
      date: first.date,
    };
    latestVisitedDistrict = {
      id: latest.dist.id,
      name: latest.dist.name,
      date: latest.date,
    };
  }

  return {
    visitedCount,
    wantToVisitCount,
    notVisitedCount,
    percentageExplored,
    divisionsExploredCount,
    totalTrips: trips.length,
    totalPhotos,
    totalMemories,
    mostVisitedDistrict,
    mostExploredDivision,
    firstVisitedDistrict,
    latestVisitedDistrict,
  };
}

export function calculateDivisionStats(
  userData: Record<string, DistrictUserData>
): DivisionStat[] {
  return DIVISIONS.map((div) => {
    const districts = DISTRICTS.filter((d) => d.division === div.name);
    const visited = districts.filter((d) => userData[d.id]?.status === 'visited').length;
    const wantToVisit = districts.filter((d) => userData[d.id]?.status === 'want_to_visit').length;
    const total = districts.length;
    const percentage = Number(((visited / total) * 100).toFixed(0));

    return {
      division: div.name,
      visited,
      wantToVisit,
      total,
      percentage,
      districts,
    };
  });
}

export function evaluateAchievements(
  userData: Record<string, DistrictUserData>,
  visits: Visit[],
  trips: Trip[]
): Achievement[] {
  const visitedDistricts = DISTRICTS.filter(
    (d) => userData[d.id]?.status === 'visited'
  );
  const visitedCount = visitedDistricts.length;

  const coastalVisited = visitedDistricts.filter((d) => d.isCoastal).length;
  const hillVisited = visitedDistricts.filter((d) => d.isHill).length;

  // Division completion check
  let completedDivisions = 0;
  for (const div of DIVISIONS) {
    const divDistricts = DISTRICTS.filter((d) => d.division === div.name);
    const divVisited = divDistricts.filter((d) => userData[d.id]?.status === 'visited').length;
    if (divVisited === divDistricts.length && divDistricts.length > 0) {
      completedDivisions++;
    }
  }

  const multiDistrictTrips = trips.filter((t) => t.districtIds && t.districtIds.length >= 2).length;

  const writtenMemoriesCount = visitedDistricts.filter((d) => {
    const u = userData[d.id];
    if (u?.notes && u.notes.trim().length > 0) return true;
    return visits.some((v) => v.districtId === d.id && v.notes && v.notes.trim().length > 0);
  }).length;

  const totalPhotos = visits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);

  return INITIAL_ACHIEVEMENTS.map((ach) => {
    let currentValue = 0;
    let isUnlocked = false;

    switch (ach.key) {
      case 'first_step':
        currentValue = Math.min(visitedCount, 1);
        isUnlocked = visitedCount >= 1;
        break;
      case 'getting_started':
        currentValue = Math.min(visitedCount, 5);
        isUnlocked = visitedCount >= 5;
        break;
      case 'explorer':
        currentValue = Math.min(visitedCount, 10);
        isUnlocked = visitedCount >= 10;
        break;
      case 'adventurer':
        currentValue = Math.min(visitedCount, 25);
        isUnlocked = visitedCount >= 25;
        break;
      case 'half_the_country':
        currentValue = Math.min(visitedCount, 32);
        isUnlocked = visitedCount >= 32;
        break;
      case 'bangladesh_traveler':
        currentValue = Math.min(visitedCount, 50);
        isUnlocked = visitedCount >= 50;
        break;
      case 'bangladesh_complete':
        currentValue = Math.min(visitedCount, 64);
        isUnlocked = visitedCount >= 64;
        break;
      case 'beach_lover':
        currentValue = Math.min(coastalVisited, 5);
        isUnlocked = coastalVisited >= 5;
        break;
      case 'hill_explorer':
        currentValue = Math.min(hillVisited, 3);
        isUnlocked = hillVisited >= 3;
        break;
      case 'division_complete':
        currentValue = Math.min(completedDivisions, 1);
        isUnlocked = completedDivisions >= 1;
        break;
      case 'road_trip':
        currentValue = Math.min(multiDistrictTrips, 1);
        isUnlocked = multiDistrictTrips >= 1;
        break;
      case 'storyteller':
        currentValue = Math.min(writtenMemoriesCount, 10);
        isUnlocked = writtenMemoriesCount >= 10;
        break;
      case 'memory_maker':
        currentValue = Math.min(totalPhotos, 25);
        isUnlocked = totalPhotos >= 25;
        break;
      default:
        break;
    }

    return {
      ...ach,
      currentValue,
      isUnlocked,
    };
  });
}
