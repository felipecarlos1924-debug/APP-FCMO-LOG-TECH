
import React, { useState } from 'react';
import { FleetDocument, Vehicle, DriverProfile, DocumentType } from '../types';
import { FileText, Calendar, AlertTriangle, CheckCircle, XCircle, Plus, Upload, Filter, Search, User, Truck, Paperclip } from 'lucide-react';

interface DocumentsModuleProps {
  documents: FleetDocument[];
  vehicles: Vehicle[];
  drivers: DriverProfile[];
  onAddDocument: (doc: FleetDocument) => void;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ documents, vehicles, drivers, onAddDocument }) => {
  const [activeTab, setActiveTab] = useState<'VEHICLE' | 'DRIVER'>('VEHICLE');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Logic
  const filteredDocs = documents.filter(d => d.entityType === activeTab);
  
  // Calculate Status
  const getStatus = (doc: FleetDocument) => {
     const now = new Date();
     const exp = new Date(doc.expirationDate);
     const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

     if (diffDays < 0) return 'EXPIRED';
     if (diffDays < 30) return 'WARNING';
     return 'VALID';
  };

  const getEntityName = (doc: FleetDocument) => {
     if (doc.entityType === 'VEHICLE') {
        const v = vehicles.find(veh => veh.id === doc.entityId);
        return v ? `${v.plate} - ${v.model}` : 'Veículo Desconhecido';
     } else {
        const d = drivers.find(drv => drv.id === doc.entityId);
        return d ? d.name : 'Motorista Desconhecido';
     }
  };

  const [formData, setFormData] = useState<Partial<FleetDocument>>({
     type: 'IPVA',
     entityType: 'VEHICLE',
     expirationDate: new Date().toISOString().split('T')[0]
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entityId || !formData.number) return;
    
    // Simulate File Upload by creating a temporary object URL
    let fileUrl = undefined;
    if (selectedFile) {
        fileUrl = URL.createObjectURL(selectedFile);
    }

    onAddDocument({
       id: Math.random().toString(36).substr(2, 9),
       type: formData.type as DocumentType,
       entityType: formData.entityType as 'VEHICLE' | 'DRIVER',
       entityId: formData.entityId,
       number: formData.number,
       issueDate: formData.issueDate || new Date().toISOString(),
       expirationDate: formData.expirationDate || new Date().toISOString(),
       status: 'VALID',
       fileUrl: fileUrl
    });
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const openAttachment = (url?: string) => {
    if (url) {
        window.open(url, '_blank');
    } else {
        alert("Nenhum arquivo anexado digitalmente a este registro.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
       <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Documentos</h2>
          <p className="text-slate-500">Controle de vencimentos de CNH, IPVA, Seguros e Licenciamentos.</p>
        </div>
        <button 
          onClick={() => {
             setFormData({ type: activeTab === 'VEHICLE' ? 'IPVA' : 'CNH', entityType: activeTab });
             setIsModalOpen(true);
             setSelectedFile(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Novo Documento
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit shrink-0">
          <button 
            onClick={() => setActiveTab('VEHICLE')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'VEHICLE' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Truck size={16} /> Documentos de Veículos
          </button>
          <button 
            onClick={() => setActiveTab('DRIVER')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'DRIVER' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={16} /> Documentos de Motoristas
          </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
         {filteredDocs.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">
               <FileText size={64} className="mx-auto mb-4 opacity-50" />
               <p>Nenhum documento cadastrado nesta categoria.</p>
            </div>
         ) : filteredDocs.map(doc => {
             const status = getStatus(doc);
             return (
               <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                     status === 'VALID' ? 'bg-green-500' : status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-3">
                     <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{doc.type.replace('_', ' ')}</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1 truncate max-w-[200px]" title={getEntityName(doc)}>
                           {getEntityName(doc)}
                        </h3>
                     </div>
                     <div className={`p-2 rounded-full ${status === 'VALID' ? 'bg-green-50 text-green-600' : status === 'WARNING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                        {status === 'VALID' ? <CheckCircle size={20} /> : status === 'WARNING' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
                     </div>
                  </div>

                  <div className="space-y-3 pl-3">
                     <div className="flex items-center gap-3 text-sm text-slate-600">
                        <FileText size={16} className="text-slate-400" />
                        <span className="font-mono">{doc.number}</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Vence em: <strong>{new Date(doc.expirationDate).toLocaleDateString('pt-BR')}</strong></span>
                     </div>
                  </div>

                  <div className="mt-6 pl-3 pt-4 border-t border-slate-100 flex justify-end">
                     <button 
                        onClick={() => openAttachment(doc.fileUrl)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                     >
                        <Paperclip size={16} /> {doc.fileUrl ? "Ver Anexo" : "Sem Anexo"}
                     </button>
                  </div>
               </div>
             )
         })}
      </div>

      {/* Modal Add Document */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">Novo Documento</h3>
               </div>
               <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
                     <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                     >
                        {activeTab === 'VEHICLE' ? (
                           <>
                              <option value="IPVA">IPVA</option>
                              <option value="LICENCIAMENTO">Licenciamento</option>
                              <option value="SEGURO_CARGA">Seguro de Carga</option>
                              <option value="ANTT">ANTT</option>
                           </>
                        ) : (
                           <>
                              <option value="CNH">CNH</option>
                              <option value="MOPP">Curso MOPP</option>
                           </>
                        )}
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">
                        {activeTab === 'VEHICLE' ? 'Veículo' : 'Motorista'}
                     </label>
                     <select 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                        value={formData.entityId || ''}
                        onChange={e => setFormData({...formData, entityId: e.target.value})}
                     >
                        <option value="">Selecione...</option>
                        {activeTab === 'VEHICLE' 
                           ? vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)
                           : drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                        }
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Número do Documento</label>
                     <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                        value={formData.number || ''}
                        onChange={e => setFormData({...formData, number: e.target.value})}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Emissão</label>
                        <input 
                           type="date" 
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                           value={formData.issueDate || ''}
                           onChange={e => setFormData({...formData, issueDate: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Vencimento</label>
                        <input 
                           type="date" 
                           required
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                           value={formData.expirationDate || ''}
                           onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                        />
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Anexar Arquivo (PDF/IMG)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 relative group">
                        <input 
                            type="file" 
                            accept="application/pdf,image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                                if(e.target.files && e.target.files.length > 0) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                        />
                        <div className="flex flex-col items-center">
                            <Upload className={`mx-auto mb-2 ${selectedFile ? 'text-green-500' : 'text-slate-400'}`} size={24} />
                            <span className={`text-sm ${selectedFile ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                                {selectedFile ? selectedFile.name : "Clique ou arraste o arquivo aqui"}
                            </span>
                        </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                     <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                     >
                        Cancelar
                     </button>
                     <button 
                        type="submit" 
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                     >
                        Salvar
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
