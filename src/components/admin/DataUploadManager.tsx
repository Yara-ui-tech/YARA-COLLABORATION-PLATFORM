import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Upload, Download, CheckCircle, AlertTriangle, FileText, 
  Database, RefreshCw, XCircle, ArrowRight 
} from 'lucide-react';

interface ContainerConfig {
  id: string;
  name: string;
  stagingTable: string;
  validateRpc: string;
  importRpc: string;
  templateFile: string;
  description: string;
}

const CONTAINERS: ContainerConfig[] = [
  { id: 'courses', name: 'LMS Courses', stagingTable: 'staging_courses', validateRpc: 'validate_courses', importRpc: 'import_courses', templateFile: 'courses.csv', description: 'Curriculum tracks, courses, tiers and codes' },
  { id: 'course_modules', name: 'Course Modules', stagingTable: 'staging_course_modules', validateRpc: 'validate_course_modules', importRpc: 'import_course_modules', templateFile: 'course_modules.csv', description: 'Theory, labs, assignments & troubleshooting components' },
  { id: 'course_projects', name: 'Capstone Projects', stagingTable: 'staging_course_projects', validateRpc: 'validate_course_projects', importRpc: 'import_course_projects', templateFile: 'course_projects.csv', description: 'R&D capstones and assigned design project rubrics' },
  { id: 'impact_ledger', name: 'Verified Impact Ledger', stagingTable: 'staging_impact_ledger', validateRpc: 'validate_impact_ledger', importRpc: 'import_impact_ledger', templateFile: 'impact_ledger.csv', description: 'Audited metrics, learner counts & verification sources' },
  { id: 'testimonials', name: 'Testimonials', stagingTable: 'staging_testimonials', validateRpc: 'validate_testimonials', importRpc: 'import_testimonials', templateFile: 'testimonials.csv', description: 'Verified feedback from patrons, engineers & youth' },
  { id: 'sponsors', name: 'Ecosystem Sponsors', stagingTable: 'staging_sponsors', validateRpc: 'validate_sponsors', importRpc: 'import_sponsors', templateFile: 'sponsors.csv', description: 'Corporate, title and technical hardware partners' },
  { id: 'partners', name: 'Strategic Partners', stagingTable: 'staging_partners', validateRpc: 'validate_partners', importRpc: 'import_partners', templateFile: 'partners.csv', description: 'Pan-African university and institutional partners' },
  { id: 'chapters', name: 'Provincial Chapters', stagingTable: 'staging_chapters', validateRpc: 'validate_chapters', importRpc: 'import_chapters', templateFile: 'chapters.csv', description: 'Regional charters, member tallies and patrons' },
  { id: 'schools', name: 'Secondary Schools', stagingTable: 'staging_schools', validateRpc: 'validate_schools', importRpc: 'import_schools', templateFile: 'schools.csv', description: 'Equipped school STEM clubs and teacher contacts' },
  { id: 'events', name: 'Events & Workshops', stagingTable: 'staging_events', validateRpc: 'validate_events', importRpc: 'import_events', templateFile: 'events.csv', description: 'Webinars, masterclasses, qualifiers & bootcamps' },
  { id: 'competitions', name: 'Robotics Competitions', stagingTable: 'staging_competitions', validateRpc: 'validate_competitions', importRpc: 'import_competitions', templateFile: 'competitions.csv', description: 'Annual arenas, themes, dates & prize pools' },
  { id: 'competition_categories', name: 'Competition Categories', stagingTable: 'staging_competition_categories', validateRpc: 'validate_competition_categories', importRpc: 'import_competition_categories', templateFile: 'competition_categories.csv', description: 'Autonomous sprint, underwater & innovation tracks' },
  { id: 'training_programs', name: 'Training Programs', stagingTable: 'staging_training_programs', validateRpc: 'validate_training_programs', importRpc: 'import_training_programs', templateFile: 'training_programs.csv', description: 'Patron coaching and robotics educator certifications' },
  { id: 'brainstorming_quizzes', name: 'Diagnostic Quizzes', stagingTable: 'staging_brainstorming_quizzes', validateRpc: 'validate_brainstorming_quizzes', importRpc: 'import_brainstorming_quizzes', templateFile: 'brainstorming_quizzes.csv', description: 'Circuit faults, state machines & engineering puzzles' }
];

export const DataUploadManager: React.FC = () => {
  const [selectedContainer, setSelectedContainer] = useState<ContainerConfig>(CONTAINERS[0]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{ validated: number; rejected: number } | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; rejected: number } | null>(null);
  const [rejectedRows, setRejectedRows] = useState<any[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [targetBucket, setTargetBucket] = useState<string>('materials');

  // Simple CSV parser supporting quotes and commas
  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return;

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headerCols = parseLine(lines[0]);
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      // Skip commented or clearly marked example lines
      if (cols.some(c => c.toLowerCase().includes('[example to delete]'))) {
        continue;
      }
      const row: Record<string, string> = {};
      headerCols.forEach((h, idx) => {
        row[h] = cols[idx] || '';
      });
      data.push(row);
    }

    setHeaders(headerCols);
    setParsedRows(data);
    setBatchId(crypto.randomUUID());
    setValidationResult(null);
    setImportResult(null);
    setRejectedRows([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!batchId || parsedRows.length === 0) return;
    setIsLoading(true);
    try {
      // 1. Stage records into the staging table
      const stagedPayload = parsedRows.map(row => ({
        ...row,
        batch_id: batchId,
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from(selectedContainer.stagingTable)
        .insert(stagedPayload);

      if (insertError) throw insertError;

      // 2. Invoke remote validation RPC
      const { data, error: rpcError } = await supabase.rpc(selectedContainer.validateRpc, {
        p_batch_id: batchId
      });

      if (rpcError) throw rpcError;
      setValidationResult(data);

      // Check rejected rows
      const { data: rejData } = await supabase
        .from(selectedContainer.stagingTable)
        .select('*')
        .eq('batch_id', batchId)
        .eq('status', 'rejected');

      setRejectedRows(rejData || []);
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!batchId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(selectedContainer.importRpc, {
        p_batch_id: batchId
      });
      if (error) throw error;
      setImportResult(data);

      // Refresh rejected list
      const { data: rejData } = await supabase
        .from(selectedContainer.stagingTable)
        .select('*')
        .eq('batch_id', batchId)
        .eq('status', 'rejected');

      setRejectedRows(rejData || []);
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = `/templates/${selectedContainer.templateFile}`;
    link.download = selectedContainer.templateFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRejected = () => {
    if (rejectedRows.length === 0) return;
    const keys = Object.keys(rejectedRows[0]);
    const csvContent = [
      keys.join(','),
      ...rejectedRows.map(r => keys.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedContainer.id}_rejected.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMediaUpload = async () => {
    if (!mediaFile) return;
    setIsLoading(true);
    try {
      const ext = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, mediaFile);

      if (error) throw error;
      const { data: publicData } = supabase.storage.from(targetBucket).getPublicUrl(data.path);
      setUploadedMediaUrl(publicData.publicUrl);
    } catch (err: any) {
      alert(`Media upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Database className="w-7 h-7 text-emerald-400" />
            Admin Data Ingestion & Staging Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Zero Mock Data Architecture: Upload real curriculum, metrics, and institutional records safely.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Download className="w-4 h-4" />
          Download {selectedContainer.name} Template (.CSV)
        </button>
      </div>

      {/* Container Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {CONTAINERS.map(c => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedContainer(c);
              setParsedRows([]);
              setBatchId(null);
              setValidationResult(null);
              setImportResult(null);
              setRejectedRows([]);
            }}
            className={`p-3 rounded-lg text-left border text-xs font-medium transition flex flex-col justify-between ${
              selectedContainer.id === c.id
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className="font-semibold block truncate">{c.name}</span>
            <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{c.description}</span>
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-8 transition cursor-pointer relative bg-slate-900/40">
          <Upload className="w-10 h-10 text-emerald-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Upload {selectedContainer.name} Data File
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Drag & drop your populated CSV here or click to browse.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Data Preview & Empty State */}
      {parsedRows.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-medium text-slate-300">No data loaded yet</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Upload a CSV to get started. No mock or test data is populated by default.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              CSV Preview ({parsedRows.length} rows detected)
            </h3>
            <div className="flex items-center gap-3">
              <button
                disabled={isLoading}
                onClick={handleValidate}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Validate Batch
              </button>
              <button
                disabled={isLoading || !validationResult || validationResult.validated === 0}
                onClick={handleImport}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Import to Production
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-72">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/80 text-slate-300 uppercase sticky top-0">
                <tr>
                  <th className="p-2.5 border-b border-slate-700">#</th>
                  {headers.map(h => (
                    <th key={h} className="p-2.5 border-b border-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {parsedRows.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-2.5 text-slate-500">{idx + 1}</td>
                    {headers.map(h => (
                      <td key={h} className="p-2.5 max-w-xs truncate text-slate-300">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 15 && (
            <p className="text-xs text-slate-500 text-right">Showing preview of first 15 rows.</p>
          )}
        </div>
      )}

      {/* Results Panel */}
      {(validationResult || importResult) && (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200">Execution Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {validationResult && (
              <>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Validated Rows</span>
                  <span className="text-xl font-bold text-emerald-400">{validationResult.validated}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Rejected Rows</span>
                  <span className="text-xl font-bold text-rose-400">{validationResult.rejected}</span>
                </div>
              </>
            )}
            {importResult && (
              <>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Imported into Live DB</span>
                  <span className="text-xl font-bold text-emerald-400">{importResult.imported}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 block">Failed on Upsert</span>
                  <span className="text-xl font-bold text-rose-400">{importResult.rejected}</span>
                </div>
              </>
            )}
          </div>

          {rejectedRows.length > 0 && (
            <div className="pt-2">
              <button
                onClick={downloadRejected}
                className="flex items-center gap-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                Download {rejectedRows.length} Rejected Rows (.CSV with error details)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Media & Asset Direct Storage Uploader */}
      <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          Direct Storage Asset Upload (PDFs, Videos, Schematics, Images)
        </h4>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={targetBucket}
            onChange={(e) => setTargetBucket(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs"
          >
            <option value="materials">materials (Curriculum Videos & Docs)</option>
            <option value="resources">resources (Datasheets & Schematics)</option>
            <option value="avatars">avatars (Profile & Badges)</option>
            <option value="certificates">certificates (Templates)</option>
            <option value="data-uploads">data-uploads (Private Backups)</option>
          </select>
          <input
            type="file"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            className="text-xs text-slate-400 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded-lg file:px-3 file:py-1.5"
          />
          <button
            disabled={!mediaFile || isLoading}
            onClick={handleMediaUpload}
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Upload to Storage
          </button>
        </div>
        {uploadedMediaUrl && (
          <div className="bg-slate-900 p-3 rounded-lg border border-emerald-500/40 text-xs flex items-center justify-between">
            <span className="font-mono text-emerald-400 truncate max-w-lg">{uploadedMediaUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(uploadedMediaUrl)}
              className="text-slate-400 hover:text-white text-[10px] uppercase font-bold"
            >
              Copy URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
