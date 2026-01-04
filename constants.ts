
import { Vehicle, VehicleStatus, User, AppNotification, Branch, AuditLogEntry, Permission, UserRole } from './types';

export const ALL_PERMISSIONS: Permission[] = [
  'VIEW_DASHBOARD', 'VIEW_FINANCIAL', 'MANAGE_FLEET', 'VIEW_FLEET', 
  'MANAGE_FUEL', 'APPROVE_FUEL', 'MANAGE_MAINTENANCE', 'APPROVE_MAINTENANCE', 
  'MANAGE_TIRES', 'MANAGE_USERS', 'VIEW_HISTORY', 'MANAGE_BRANCHES',
  'VIEW_TELEMETRY'
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [...ALL_PERMISSIONS],
  MANAGER: [
    'VIEW_DASHBOARD', 'MANAGE_FLEET', 'VIEW_FLEET', 'MANAGE_FUEL', 
    'APPROVE_FUEL', 'MANAGE_MAINTENANCE', 'APPROVE_MAINTENANCE', 
    'MANAGE_TIRES', 'VIEW_HISTORY', 'VIEW_TELEMETRY'
  ],
  DRIVER: ['VIEW_FLEET', 'MANAGE_FUEL', 'VIEW_TELEMETRY'],
  MECHANIC: ['VIEW_FLEET', 'MANAGE_MAINTENANCE', 'MANAGE_TIRES']
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Pneu Crítico',
    message: 'O veículo NMT-5678 possui um pneu abaixo de 3mm.',
    type: 'alert',
    timestamp: new Date().toISOString(),
    read: false
  }
];

export const MOCK_BRANCHES: Branch[] = [
  { id: '1', name: 'FCMO Matriz - Cuiabá', type: 'MATRIZ', location: 'Cuiabá, MT' },
  { id: '2', name: 'Filial Sul - Curitiba', type: 'FILIAL', location: 'Curitiba, PR' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'otavio_01',
    name: 'Teste',
    email: 'tavinhotkh@gmail.com',
    role: 'OWNER',
    avatar: 'https://i.pravatar.cc/150?u=teste_user',
    password: 'teste',
    isActive: true,
    permissions: [...ALL_PERMISSIONS],
    branchId: '1'
  },
  {
    id: '1',
    name: 'Felipe',
    email: 'felipe@fcmo.com',
    role: 'OWNER',
    avatar: 'https://i.pravatar.cc/150?u=felipe',
    password: '062005ff',
    isActive: true,
    permissions: [...ALL_PERMISSIONS],
    branchId: '1'
  },
  {
    id: '2',
    name: 'Fabricio',
    email: 'fabricio@fcmo.com',
    role: 'MANAGER',
    avatar: 'https://i.pravatar.cc/150?u=fabricio',
    password: '062005',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS.MANAGER,
    branchId: '1'
  },
  {
    id: '3',
    name: 'Raquel',
    email: 'raquel@fcmo.com',
    role: 'DRIVER',
    avatar: 'https://i.pravatar.cc/150?u=raquel',
    password: '062005',
    isActive: true,
    permissions: ROLE_DEFAULT_PERMISSIONS.DRIVER,
    branchId: '1'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: '1', userId: '1', userName: 'Sistema', action: 'INICIO', details: 'Banco de dados inicializado', timestamp: new Date().toISOString(), module: 'Core' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    plate: 'QBC-1234',
    model: 'Volvo FH 540',
    driver: 'Fabricio',
    status: VehicleStatus.STOPPED,
    mileage: 154000,
    lastMaintenance: '2023-10-15',
    image: 'https://picsum.photos/400/300?random=1',
    branchId: '1',
    currentSpeed: 0,
    latitude: -15.5960,
    longitude: -56.0960,
    lastUpdate: '' 
  },
  {
    id: '3',
    plate: 'NMT-5678',
    model: 'Mercedes Actros',
    driver: 'Raquel',
    status: VehicleStatus.STOPPED, 
    mileage: 89000,
    lastMaintenance: '2023-11-01',
    image: 'https://picsum.photos/400/300?random=3',
    branchId: '1',
    currentSpeed: 0,
    latitude: -15.653342,
    longitude: -55.988658,
    lastUpdate: '' 
  }
];

export const MOCK_FUEL_LOGS = [];
export const MOCK_MAINTENANCE = [];
export const MOCK_CHECKLISTS = [];
export const MOCK_TIRES = [];
export const MOCK_FINANCIAL = [];
