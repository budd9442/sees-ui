
export interface SystemMetricData {
  timestamp: Date;
  cpu: number;
  memory: number;
  health: number;
  active_users: number;
  [key: string]: any;
}

export function downsampleMetrics<T extends SystemMetricData>(data: T[], targetPoints: number): T[] {
  if (data.length <= targetPoints || targetPoints <= 0) return data;

  const result: T[] = [];
  const bucketSize = data.length / targetPoints;

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    const bucket = data.slice(start, end);

    if (bucket.length === 0) continue;

    // Average the numeric values
    const averaged = { ...bucket[0] };
    const numericKeys = ['cpu', 'memory', 'health', 'active_users'];

    numericKeys.forEach(key => {
      const sum = bucket.reduce((s, item) => s + (item[key] || 0), 0);
      (averaged as any)[key] = Math.round(sum / bucket.length);
    });

    // Use the middle timestamp for the bucket
    averaged.timestamp = bucket[Math.floor(bucket.length / 2)].timestamp;

    result.push(averaged);
  }

  return result;
}

const mockData: SystemMetricData[] = Array.from({ length: 1000 }, (_, i) => ({
  timestamp: new Date(Date.now() - i * 60000),
  cpu: Math.floor(Math.random() * 100),
  memory: Math.floor(Math.random() * 100),
  health: 100,
  active_users: 10,
}));

console.log('Original length:', mockData.length);

const downsampled = downsampleMetrics(mockData, 100);
console.log('Downsampled length:', downsampled.length);

if (downsampled.length === 100) {
  console.log('Test Passed: Correct number of points returned.');
} else {
  console.error('Test Failed: Expected 100 points, got', downsampled.length);
}

const averagedCpu = downsampled[0].cpu;
console.log('First point averaged CPU:', averagedCpu);
