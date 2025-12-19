
import { Vehicle, VehicleStatus, FuelLog, MaintenanceOrder, DriverProfile, Tire, Checklist, User, AuditLogEntry, Permission, Branch, FleetDocument, FinancialTransaction } from './types';

// Helper to get all permissions
const ALL_PERMISSIONS: Permission[] = [
  'VIEW_DASHBOARD', 'VIEW_FINANCIAL', 'MANAGE_FLEET', 'VIEW_FLEET', 
  'MANAGE_FUEL', 'APPROVE_FUEL', 'MANAGE_MAINTENANCE', 'APPROVE_MAINTENANCE', 
  'MANAGE_TIRES', 'MANAGE_USERS', 'VIEW_HISTORY', 'MANAGE_BRANCHES',
  'VIEW_TELEMETRY'
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
  { id: '3', userId: '2', userName: 'Fabricio', action: 'CRIOU_OS', details: 'Nova OS #102 - Troca de Pneus', timestamp: '2023-11-14T14:20:00', module: 'Manutenção' },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    plate: 'QBC-1234',
    model: 'Volvo FH 540',
    driver: 'Carlos Silva',
    status: VehicleStatus.TRIP,
    mileage: 154000,
    lastMaintenance: '2023-10-15',
    image: 'https://picsum.photos/400/300?random=1',
    branchId: '1',
    currentSpeed: 65,
    rpm: 1450,
    fuelLevel: 65,
    engineTemp: 92,
    // Cuiabá Center (Av. Historiador Rubens de Mendonça area)
    latitude: -15.5960,
    longitude: -56.0960,
    isLoaded: true,
    lastUpdate: 'Há 10 seg'
  },
  {
    id: '2',
    plate: 'RBD-9876',
    model: 'Scania R450',
    driver: 'Roberto Almeida',
    status: VehicleStatus.ACTIVE,
    mileage: 210500,
    lastMaintenance: '2023-09-20',
    image: 'https://picsum.photos/400/300?random=2',
    branchId: '1',
    currentSpeed: 45,
    rpm: 1200,
    fuelLevel: 40,
    engineTemp: 88,
    // Várzea Grande
    latitude: -15.6500,
    longitude: -56.1300,
    isLoaded: true,
    lastUpdate: 'Há 1 min'
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
    currentSpeed: 72,
    rpm: 1500,
    fuelLevel: 88,
    engineTemp: 90,
    // Road to Chapada
    latitude: -15.5500,
    longitude: -56.0500,
    isLoaded: true,
    lastUpdate: 'Agora'
  },
  {
    id: '4',
    plate: 'MTX-3456',
    model: 'Volkswagen Constellation',
    driver: 'Marcos Souza',
    status: VehicleStatus.STOPPED,
    mileage: 125000,
    lastMaintenance: '2023-10-05',
    image: 'https://picsum.photos/400/300?random=4',
    branchId: '3',
    currentSpeed: 0,
    rpm: 0,
    fuelLevel: 30,
    engineTemp: 45,
    // Industrial District
    latitude: -15.6300,
    longitude: -56.0200,
    isLoaded: false,
    lastUpdate: 'Há 15 min'
  }
];

export const MOCK_FUEL_LOGS: FuelLog[] = [
  { id: '1', vehicleId: '1', date: '2023-11-10', liters: 450, cost: 2790.00, station: 'Posto Graal', mileage: 153000, status: 'Aprovado' },
  { id: '2', vehicleId: '1', date: '2023-11-05', liters: 420, cost: 2604.00, station: 'Posto Shell', mileage: 152000, status: 'Aprovado' },
  { id: '3', vehicleId: '2', date: '2023-11-08', liters: 380, cost: 2356.00, station: 'Posto BR', mileage: 209500, status: 'Pendente' },
  { id: '4', vehicleId: '3', date: '2023-11-12', liters: 200, cost: 1240.00, station: 'Posto Ipiranga', mileage: 88500, status: 'Aprovado' },
];

export const MOCK_MAINTENANCE: MaintenanceOrder[] = [
  { id: '1', vehicleId: '2', description: 'Troca de Óleo e Filtros', type: 'Preventiva', cost: 1500, date: '2023-11-14', status: 'Em Andamento' },
  { id: '2', vehicleId: '1', description: 'Troca de Pastilhas de Freio', type: 'Preventiva', cost: 800, date: '2023-10-15', status: 'Concluído' },
  { id: '3', vehicleId: '4', description: 'Reparo no Alternador', type: 'Corretiva', cost: 2200, date: '2023-11-01', status: 'Pendente' },
];

export const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: '1', vehicleId: '1', date: '2023-11-15T07:30:00', driver: 'Carlos Silva', status: 'Aprovado',
    items: [{name: 'Pneus', ok: true}, {name: 'Freios', ok: true}, {name: 'Luzes', ok: true}, {name: 'Nível Óleo', ok: true}],
    earnedPoints: 60, gamificationTags: ['Foto Verificada']
  },
  {
    id: '2', vehicleId: '1', date: '2023-11-14T18:00:00', driver: 'Carlos Silva', status: 'Com Ressalvas',
    items: [{name: 'Pneus', ok: true}, {name: 'Freios', ok: true}, {name: 'Luzes', ok: false}, {name: 'Nível Óleo', ok: true}],
    notes: 'Lâmpada traseira direita queimada.',
    earnedPoints: 70, gamificationTags: ['Reporte de Avaria', 'Foto Verificada']
  },
  {
    id: '3', vehicleId: '2', date: '2023-11-10T08:00:00', driver: 'Roberto Almeida', status: 'Reprovado',
    items: [{name: 'Pneus', ok: false}, {name: 'Freios', ok: false}, {name: 'Luzes', ok: true}, {name: 'Nível Óleo', ok: true}],
    notes: 'Pneu dianteiro esquerdo careca. Freio baixo.',
    earnedPoints: 80, gamificationTags: ['Alerta de Risco', 'Foto Verificada']
  }
];

export const MOCK_DRIVERS: DriverProfile[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    avatar: 'https://i.pravatar.cc/150?u=1',
    level: 12,
    currentPoints: 4500,
    monthlyScore: 94,
    safetyScore: 98,
    efficiencyScore: 88,
    complianceScore: 100,
    badges: ['Eco-Driver', '1 Ano Sem Acidentes'],
    rankChange: 'up'
  },
  {
    id: '2',
    name: 'Roberto Almeida',
    avatar: 'https://i.pravatar.cc/150?u=2',
    level: 8,
    currentPoints: 2800,
    monthlyScore: 78,
    safetyScore: 85,
    efficiencyScore: 72,
    complianceScore: 80,
    badges: ['Pontualidade'],
    rankChange: 'down'
  },
  {
    id: '3',
    name: 'Raquel',
    avatar: 'https://i.pravatar.cc/150?u=raquel',
    level: 15,
    currentPoints: 6200,
    monthlyScore: 98,
    safetyScore: 99,
    efficiencyScore: 96,
    complianceScore: 99,
    badges: ['Top Performance', 'Rei da Economia', 'Mentor'],
    rankChange: 'same'
  },
  {
    id: '4',
    name: 'Marcos Souza',
    avatar: 'https://i.pravatar.cc/150?u=4',
    level: 5,
    currentPoints: 1200,
    monthlyScore: 82,
    safetyScore: 90,
    efficiencyScore: 75,
    complianceScore: 85,
    badges: [],
    rankChange: 'up'
  }
];

export const MOCK_TIRES: Tire[] = [
  { id: '101', brand: 'Michelin', model: 'X Multi Z', size: '295/80R22.5', serialNumber: 'MIC-8842', status: 'Bom', treadDepth: 12, originalTreadDepth: 18, vehicleId: '1', position: 'Dianteiro Esq', location: 'Veículo', lifespan: 66 },
  { id: '102', brand: 'Michelin', model: 'X Multi Z', size: '295/80R22.5', serialNumber: 'MIC-8843', status: 'Bom', treadDepth: 11.5, originalTreadDepth: 18, vehicleId: '1', position: 'Dianteiro Dir', location: 'Veículo', lifespan: 63 },
  { id: '103', brand: 'Bridgestone', model: 'R268', size: '295/80R22.5', serialNumber: 'BRI-1102', status: 'Crítico', treadDepth: 2.5, originalTreadDepth: 17, vehicleId: '2', position: 'Tração Esq Ext', location: 'Veículo', lifespan: 14 },
  { id: '104', brand: 'Bridgestone', model: 'R268', size: '295/80R22.5', serialNumber: 'BRI-1103', status: 'Crítico', treadDepth: 2.4, originalTreadDepth: 17, vehicleId: '2', position: 'Tração Dir Ext', location: 'Veículo', lifespan: 14 },
  { id: '105', brand: 'Goodyear', model: 'KMax S', size: '295/80R22.5', serialNumber: 'GDY-5590', status: 'Novo', treadDepth: 18, originalTreadDepth: 18, location: 'Estoque', lifespan: 100 },
  { id: '106', brand: 'Pirelli', model: 'G:01', size: '295/80R22.5', serialNumber: 'PIR-3321', status: 'Recapado', treadDepth: 14, originalTreadDepth: 16, vehicleId: '3', position: 'Truck Esq', location: 'Veículo', lifespan: 87 },
];

export const MOCK_FINANCIAL: FinancialTransaction[] = [
  { id: '1', type: 'INCOME', category: 'Frete', description: 'Frete Soja - Sorriso/MT', amount: 15000, date: '2023-11-01', status: 'PAID', paymentMethod: 'PIX', documentNumber: 'NF-10023' },
  { id: '2', type: 'INCOME', category: 'Frete', description: 'Carga Frigorificada - SP', amount: 8500, date: '2023-11-05', status: 'PAID', paymentMethod: 'TRANSFER', documentNumber: 'NF-10024' },
  { id: '3', type: 'EXPENSE', category: 'Combustível', description: 'Abastecimento Posto Graal', amount: 2790, date: '2023-11-10', status: 'PAID', paymentMethod: 'CREDIT', documentNumber: 'NFC-5544' },
  { id: '4', type: 'EXPENSE', category: 'Manutenção', description: 'Troca de Pneus (Michelin)', amount: 4800, date: '2023-11-12', status: 'PENDING', paymentMethod: 'BOLETO', documentNumber: 'NF-9988' },
  { id: '5', type: 'EXPENSE', category: 'Salário', description: 'Adiantamento Motorista', amount: 1500, date: '2023-11-15', status: 'PAID', paymentMethod: 'PIX' },
  { id: '6', type: 'INCOME', category: 'Frete', description: 'Retorno Carga Seca', amount: 4200, date: '2023-11-16', status: 'PENDING', paymentMethod: 'BOLETO', documentNumber: 'NF-10025' },
];

export const MOCK_DOCUMENTS: FleetDocument[] = [];
