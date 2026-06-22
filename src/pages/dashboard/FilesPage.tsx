import { useState } from 'react';
import {
  FileText, Image as ImageIcon, Video, Folder, Upload, Download
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export default function FilesPage() {
  const { project, uploadFile } = useProject();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [simulatedFileName, setSimulatedFileName] = useState('');

  if (!project) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await startUploadSimulation(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await startUploadSimulation(e.target.files[0]);
    }
  };

  const startUploadSimulation = async (file: File) => {
    setUploading(true);
    setSimulatedFileName(file.name);
    setUploadProgress(0);

    // Simulated progress tick
    for (let i = 10; i <= 100; i += 15) {
      await new Promise(r => setTimeout(r, 150));
      setUploadProgress(Math.min(i, 100));
    }

    // Determine type
    let fileType: 'image' | 'document' | 'video' | 'other' = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text')) {
      fileType = 'document';
    }

    // Call store context
    await uploadFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: fileType,
    });

    setUploading(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-amber-500" />;
      default:
        return <Folder className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-2">Enviar materiais do site</h3>
        <p className="text-gray-400 text-xs mb-5">
          Envie o logotipo, paleta de cores, fotos dos seus produtos, descrições de texto ou referências.
        </p>

        {/* Drop zone */}
        <label
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-[#5B4FE9] bg-[#eef2ff]'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'
          }`}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
            multiple
          />
          
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 text-[#5B4FE9]">
            <Upload className="w-5 h-5" />
          </div>

          <div className="text-sm font-bold text-gray-900 mb-1">
            Arraste seus arquivos aqui ou clique para buscar
          </div>
          <div className="text-gray-400 text-xs">
            Formatos aceitos: PNG, JPG, PDF, SVG, ZIP, DOCX (Max: 50MB)
          </div>
        </label>

        {/* Upload progress */}
        {uploading && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2 animate-fade-in">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-700 truncate max-w-[200px] sm:max-w-md">
                Enviando {simulatedFileName}
              </span>
              <span className="text-[#5B4FE9] font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Uploaded files list */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-4">Arquivos enviados</h3>

        {project.files.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum arquivo enviado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {project.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between py-3.5 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate max-w-[150px] sm:max-w-md">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {file.size} · Enviado por {file.uploadedBy} em {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={file.url}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    title="Baixar arquivo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
