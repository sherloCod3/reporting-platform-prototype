import { useState } from 'react';
import axios from 'axios';
import { Play, Download, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/reports';

interface QueryResult {
  success: boolean;
  data?: any[];
  meta?: {
    rowCount: number;
    executionTime: string;
  };
  message?: string;
  hint?: string;
}

function App() {
  const [query, setQuery] = useState('SELECT * FROM clientes LIMIT 10');
  const [resumeToPipeableStream, setResult] = useState<QueryResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Executar query
  const runQuery = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/execute`, { query });
      setResult(response.data);
    } catch (error: any) {
      setResult(
        error.response?.data || {
          success: false,
          message: 'Erro desconhecido ao executar consulta'
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Exportar PDF
  const exportPdf = async () => {
    const table = document.getElementById('result-table');
    if (!table) return;

    try {
      const response = await axios.post(
        `${API_URL}/export-pdf`,
        {
          htmlContent: table.outerHTML,
          title: 'Relatório de Dados'
        },
        { responseType: 'blob' }
      );

      // Download automático
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('❌ Erro ao gerar PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Ferramenta de Relatórios MVP
          </h1>
          <p className="text-gray-600">Conectado ao MySQL • Versão 1.0.0</p>
        </div>

        {/* Editor SQL */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            💻 Consulta SQL
          </label>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite sua query SQL aqui..."
          />

          {/* Botões de ação */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={runQuery}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Play size={20} />
              {loading ? 'Executando...' : 'Executar Query'}
            </button>

            {result?.success && result.data && result.data.length > 0 && (
              <button
                onClick={exportPdf}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download size={20} />
                Exportar PDF
              </button>
            )}
          </div>
        </div>

        {/* Sucesso */}
        {result?.success && result.data && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Metadados */}
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <CheckCircle size={24} />
              <span className="font-bold">
                {result.meta?.rowCount} registros • {result.meta?.executionTime}
              </span>
            </div>

            {/* Tabela */}
            {result.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table id="result-table" className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(result.data[0]).map(col => (
                        <th
                          key={col}
                          className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-700"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((val: any, j) => (
                          <td
                            key={j}
                            className="border border-gray-300 px-4 py-2 text-gray-800"
                          >
                            {val === null ? (
                              <span className="text-gray-400 italic">NULL</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                ℹ️ Consulta executada com sucesso, mas não retornou dados
              </p>
            )}
          </div>
        )}

        {/* Erro */}
        {result && !result.success && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  {result.message}
                </h3>
                {result.hint && (
                  <p className="text-red-700 mb-2">{result.hint}</p>
                )}
                <p className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded">
                  {(result as any).details || 'Detalhes não disponíveis'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
