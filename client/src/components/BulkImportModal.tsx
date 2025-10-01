import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { pantryApi } from '../services/api';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface BulkImportModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ categories, onClose, onSuccess }) => {
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const csvTemplate = `name,category,quantity,unit,expiration_date,notes
Organic Tomatoes,Vegetables,5,pieces,2024-01-15,Fresh from farmer's market
Whole Milk,Dairy & Eggs,1,l,2024-01-10,
Ground Beef,Meat & Poultry,500,g,2024-01-12,For tonight's dinner
Olive Oil,Condiments & Sauces,750,ml,,Extra virgin
Bananas,Fruits,6,pieces,2024-01-08,Getting ripe`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pantry_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCsvData = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const item: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'quantity') {
          item[header] = parseFloat(value) || 0;
        } else if (header === 'expiration_date' && value === '') {
          item[header] = null;
        } else {
          item[header] = value || null;
        }
      });

      // Validate required fields
      if (item.name && item.category && item.quantity !== undefined) {
        items.push(item);
      }
    }

    return items;
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      alert('Please paste CSV data or use the template');
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      const items = parseCsvData(csvData);

      if (items.length === 0) {
        alert('No valid items found in CSV data. Please check the format.');
        setImporting(false);
        return;
      }

      const response = await pantryApi.bulkImport(items);
      setResults(response.data);

      if (response.data.errorCount === 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Bulk import error:', error);
      alert('Failed to import items. Please check the format and try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Import Items</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How to use bulk import:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Download the CSV template or use the format shown below</li>
              <li>2. Fill in your items data in the same format</li>
              <li>3. Upload the file or paste the CSV data directly</li>
              <li>4. Click "Import Items" to add them to your pantry</li>
            </ol>
          </div>

          {/* Template Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">CSV Template</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FileText size={16} />
                  <span>{showTemplate ? 'Hide' : 'Show'} Template</span>
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Download size={16} />
                  <span>Download Template</span>
                </button>
              </div>
            </div>

            {showTemplate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {csvTemplate}
                </pre>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          </div>

          {/* CSV Data Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Paste CSV Data
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Paste your CSV data here..."
            />
          </div>

          {/* Available Categories */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mb-6 p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-3">
                {results.errorCount === 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-orange-600" size={20} />
                )}
                <h4 className="font-medium">Import Results</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
                  <div className="text-sm text-gray-600">Items Added</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.errorCount}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-red-700 mb-2">Errors:</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {results.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm text-red-600 mb-1">
                        Row {error.index + 2}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !csvData.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Import Items</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;