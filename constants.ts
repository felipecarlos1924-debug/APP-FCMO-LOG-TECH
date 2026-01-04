
import { Vehicle, VehicleStatus, User, AppNotification, Branch, AuditLogEntry, Permission } from './types';

const ALL_PERMISSIONS: Permission[] = [
  'VIEW_DASHBOARD', 'VIEW_FINANCIAL', 'MANAGE_FLEET', 'VIEW_FLEET', 
  'MANAGE_FUEL', 'APPROVE_FUEL', 'MANAGE_MAINTENANCE', 'APPROVE_MAINTENANCE', 
  'MANAGE_TIRES', 'MANAGE_USERS', 'VIEW_HISTORY', 'MANAGE_BRANCHES',
  'VIEW_TELEMETRY'
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Pneu Crítico',
    message: 'O veículo NMT-5678 possui um pneu abaixo de 3mm.',
    type: 'alert',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'Abastecimento Pendente',
    message: 'Novo lançamento de R$ 2.450,00 aguardando aprovação.',
    type: 'info',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: '3',
    title: 'Manutenção Concluída',
    message: 'OS #442 do Volvo FH 540 foi finalizada com sucesso.',
    type: 'success',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true
  }
];

export const MOCK_BRANCHES: Branch[] = [
  { id: '1', name: 'FCMO Matriz - Cuiabá', type: 'MATRIZ', location: 'Cuiabá, MT' },
  { id: '2', name: 'Filial Sul - Curitiba', type: 'FILIAL', location: 'Curitiba, PR' },
  { id: '3', name: 'Filial Porto - Santos', type: 'FILIAL', location: 'Santos, SP' },
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Felipe',
    email: 'felipe@fcmo.com',
    role: 'OWNER',
    avatar: 'https://i.pravatar.cc/150?u=felipe',
    password: '062005ff',
    isActive: true,
    permissions: ALL_PERMISSIONS,
    branchId: '1'
  },
  {
    id: '2',
    name: 'Fabricio',
    email: 'fabricio@fcmo.com',
    role: 'MANAGER',
    avatar: 'https://i.pravatar.cc/150?u=fabricio',
    password: '062005f',
    isActive: true,
    permissions: [
      'VIEW_DASHBOARD', 'MANAGE_FLEET', 'VIEW_FLEET', 'MANAGE_FUEL', 
      'MANAGE_MAINTENANCE', 'MANAGE_TIRES', 'VIEW_TELEMETRY'
    ],
    branchId: '2'
  },
  {
    id: '3',
    name: 'Raquel',
    email: 'raquel@fcmo.com',
    role: 'DRIVER',
    avatar: 'https://i.pravatar.cc/150?u=raquel',
    password: '062005',
    isActive: true,
    permissions: ['VIEW_FLEET', 'MANAGE_FUEL', 'VIEW_TELEMETRY'],
    branchId: '1'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: '1', userId: '1', userName: 'Felipe', action: 'APROVOU_ABASTECIMENTO', details: 'Aprovou abastecimento R$ 2.790,00 - Volvo FH 540', timestamp: '2023-11-15T10:30:00', module: 'Combustível' },
  { id: '2', userId: '3', userName: 'Raquel', action: 'NOVO_CHECKLIST', details: 'Realizou checklist de saída - Mercedes Actros', timestamp: '2023-11-15T07:30:00', module: 'Frota' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    plate: 'QBC-1234',
    model: 'Volvo FH 540',
    driver: 'Sem Condutor',
    status: VehicleStatus.STOPPED,
    mileage: 154000,
    lastMaintenance: '2023-10-15',
    image: 'https://picsum.photos/400/300?random=1',
    branchId: '1',
    currentSpeed: 0,
    rpm: 0,
    fuelLevel: 65,
    engineTemp: 25,
    latitude: -15.5960,
    longitude: -56.0960,
    isLoaded: false,
    lastUpdate: 'Estacionado'
  },
  {
    id: '3',
    plate: 'NMT-5678',
    model: 'Mercedes Actros',
    driver: 'Raquel',
    status: VehicleStatus.ACTIVE,
    mileage: 89000,
    lastMaintenance: '2023-11-01',
    image: 'https://picsum.photos/400/300?random=3',
    branchId: '1',
    currentSpeed: 0,
    rpm: 0,
    fuelLevel: 88,
    engineTemp: 25,
    latitude: -15.653342,
    longitude: -55.988658,
    isLoaded: true,
    lastUpdate: 'Agora'
  }
];

export const MOCK_FUEL_LOGS = [];
export const MOCK_MAINTENANCE = [];
export const MOCK_CHECKLISTS = [];
export const MOCK_DRIVERS = [];
export const MOCK_TIRES = [];
export const MOCK_FINANCIAL = [];
export const MOCK_DOCUMENTS = [];
