
export enum VehicleStatus {
  ACTIVE = 'Ativo',
  MAINTENANCE = 'Manutenção',
  TRIP = 'Em Viagem',
  STOPPED = 'Parado'
}

export type UserRole = 'OWNER' | 'MANAGER' | 'DRIVER' | 'MECHANIC';

// Granular Permissions
export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_FINANCIAL'
  | 'MANAGE_FLEET'      // Create/Edit vehicles
  | 'VIEW_FLEET'
  | 'MANAGE_FUEL'       // Add logs
  | 'APPROVE_FUEL'      // Approve logs
  | 'MANAGE_MAINTENANCE'
  | 'APPROVE_MAINTENANCE'
  | 'MANAGE_TIRES'
  | 'MANAGE_USERS'
  | 'VIEW_HISTORY'      // Audit Log
  | 'MANAGE_BRANCHES'   // Manage subsidiaries
  | 'VIEW_TELEMETRY';    // GPS tracking

export interface Branch {
  id: string;
  name: string;
  type: 'MATRIZ' | 'FILIAL';
  location: string;
  managerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; 
  isActive: boolean;
  verificationCode?: string;
  permissions: Permission[];
  branchId?: string; // Link user to a branch
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  module: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver: string;
  status: VehicleStatus;
  mileage: number;
  lastMaintenance: string;
  image: string;
  branchId?: string; // Link vehicle to a branch
  
  // Telemetry Extensions
  currentSpeed?: number;
  rpm?: number;
  fuelLevel?: number;
  engineTemp?: number;
  latitude?: number;
  longitude?: number;
  isLoaded?: boolean;
  lastUpdate?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  station: string;
  mileage: number;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado' | 'Aguardando Dono';
}

export interface MaintenanceOrder {
  id: string;
  vehicleId: string;
  description: string;
  type: 'Preventiva' | 'Corretiva';
  cost: number;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Concluído' | 'Em Andamento' | 'Recusado' | 'Aguardando Dono';
}

export interface Checklist {
  id: string;
  vehicleId: string;
  date: string;
  driver: string;
  status: 'Aprovado' | 'Com Ressalvas' | 'Reprovado';
  items: {
    name: string;
    ok: boolean;
  }[];
  notes?: string;
  earnedPoints?: number;
  gamificationTags?: string[];
}

export interface DriverProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  currentPoints: number;
  monthlyScore: number; 
  safetyScore: number; 
  efficiencyScore: number; 
  complianceScore: number; 
  badges: string[];
  rankChange: 'up' | 'down' | 'same';
}

export type TireStatus = 'Novo' | 'Bom' | 'Regular' | 'Crítico' | 'Recapado';

export interface Tire {
  id: string;
  brand: string;
  model: string;
  size: string;
  serialNumber: string;
  status: TireStatus;
  treadDepth: number; 
  originalTreadDepth: number; 
  vehicleId?: string; 
  position?: string; 
  location: 'Veículo' | 'Estoque';
  lifespan: number; 
}

export type DocumentType = 'CNH' | 'MOPP' | 'IPVA' | 'LICENCIAMENTO' | 'SEGURO_CARGA' | 'ANTT';

export interface FleetDocument {
  id: string;
  type: DocumentType;
  entityId: string; // Vehicle ID or User ID
  entityType: 'VEHICLE' | 'DRIVER';
  number: string;
  issueDate: string;
  expirationDate: string;
  status: 'VALID' | 'WARNING' | 'EXPIRED';
  fileUrl?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING';
  paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT' | 'TRANSFER';
  documentNumber?: string; // Nota Fiscal
}

export type ViewState = 'dashboard' | 'fleet' | 'fuel' | 'maintenance' | 'tires' | 'reports' | 'employees' | 'settings' | 'history' | 'telemetry';
