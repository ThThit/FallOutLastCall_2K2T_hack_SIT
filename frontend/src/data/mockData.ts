// Mock data and helper factories for development
// Replace with real API calls in production

export const mockUsers = [
    {
        id: '1',
        username: 'survivor#001',
        reputationScore: 150,
    },
    {
        id: '2',
        username: 'thit#213',
        reputationScore: 325,
    },
];

export const mockSignals = [
    {
        id: '1',
        title: 'Safe Haven Found',
        message: 'Underground shelter discovered near sector 7',
        category: 'SHELTER',
        dangerLevel: 'LOW',
        trustScore: 0.95,
        verificationRate: 0.87,
        userId: '1',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Radiation Alert',
        message: 'High radiation detected in northern zone',
        category: 'DANGER',
        dangerLevel: 'CRITICAL',
        trustScore: 0.78,
        verificationRate: 0.92,
        userId: '2',
        createdAt: new Date().toISOString(),
    },
];
