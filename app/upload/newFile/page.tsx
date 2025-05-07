/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

// Define a type for the JSON data structure
type ExcelJsonData = Record<string, string | number | boolean | null>;

// Process stage types
type ProcessStage = 'idle' | 'preparing' | 'creating-refs' | 'creating-users' | 'completed';

// Define types for progress tracking
interface ProgressState {
  stage: ProcessStage;
  currentProgress: number;
  processedRecords: number;
  totalRecords: number;
  stageMessage: string;
}

interface UploadResults {
  success: number;
  failed: number;
}

// Function to convert keys to camelCase (first word lowercase, subsequent words capitalized)
const toCamelCase = (str: string): string => {
  return str
    .split(' ')
    .map((word, index) => {
      // Skip empty words (consecutive spaces)
      if (word === '') return '';
      
      // First word should be lowercase, others capitalized
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join('');
};

// Helper function to chunk array into batches
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  
  return result;
};

export default function ExcelToJsonConverter() {
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // New state for multi-stage progress tracking
  const [progress, setProgress] = useState<ProgressState>({
    stage: 'idle',
    currentProgress: 0,
    processedRecords: 0,
    totalRecords: 0,
    stageMessage: ''
  });

  const [uploadResults, setUploadResults] = useState<UploadResults>({ 
    success: 0, 
    failed: 0 
  });
  
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  
  // Constants for batch processing
  const BATCH_SIZE = 50; // Number of records to process in each batch

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    resetProgress();

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert the worksheet to JSON
        const jsonResult = XLSX.utils.sheet_to_json(worksheet) as ExcelJsonData[];
        
        // Transform the keys to camelCase format
        const transformedData = jsonResult.map(row => {
          const newRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            const camelCaseKey = toCamelCase(key);
            newRow[camelCaseKey] = row[key];
          });

          if (newRow.email === ''){ 
            return {...newRow, email: `${newRow.employeeCode}@mobilitycairo.com`}
          }
          return newRow;
        });

        setJsonData(transformedData);
        setProgress(prev => ({
          ...prev,
          totalRecords: transformedData.length,
          stageMessage: `${transformedData.length} records ready to process`
        }));
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Error processing Excel file. Please make sure it\'s a valid Excel file.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      alert('Error reading file');
    };

    reader.readAsBinaryString(file);
  };

  // Reset progress state
  const resetProgress = () => {
    setProgress({
      stage: 'idle',
      currentProgress: 0,
      processedRecords: 0,
      totalRecords: 0,
      stageMessage: ''
    });
    setUploadResults({ success: 0, failed: 0 });
    setErrorMessages([]);
  };

  // Function to analyze data and extract unique reference values
  const analyzeData = (data: any[]) => {
    const analysis = {
      entities: new Set<string>(),
      departments: new Set<string>(),
      positions: new Set<string>(),
      // Add other reference tables as needed
    };

    data.forEach(row => {
      if (row.entity) analysis.entities.add(row.entity);
      if (row.department) analysis.departments.add(row.department);
      if (row.position) analysis.positions.add(row.position);
      // Add other fields
    });

    return {
      entities: analysis.entities.size,
      departments: analysis.departments.size,
      positions: analysis.positions.size,
      // Return counts of other reference tables
    };
  };

  // Process user data in batches
  const processUserData = async () => {
    if (!jsonData || jsonData.length === 0) return;

    // Reset states
    resetProgress();
    setProgress(prev => ({ 
      ...prev, 
      stage: 'preparing',
      stageMessage: 'Analyzing data...',
      totalRecords: jsonData.length
    }));

    try {
      // Analyze data to get information about reference values
      const analysis = analyzeData(jsonData);
      
      // First update the progress to show preparing phase
      setProgress(prev => ({ 
        ...prev,
        currentProgress: 100,
        stageMessage: `Identified ${analysis.positions} positions, ${analysis.departments} departments, etc.`,
      }));

      // Wait a brief moment to show the analysis results
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Move to creating reference data stage
      setProgress(prev => ({ 
        ...prev, 
        stage: 'creating-refs',
        currentProgress: 0, 
        stageMessage: 'Creating reference data...',
      }));

      // Split data into smaller batches for processing
      const batches = chunkArray(jsonData, BATCH_SIZE);
      
      let successCount = 0;
      let failedCount = 0;
      const newErrors: string[] = [];
      
      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batchData = batches[batchIndex];
        
        try {
          // Send the batch to the API
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(batchData),
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const result = await response.json();
          
          // Update progress for creating users
          setProgress(prev => {
            const processedSoFar = (batchIndex + 1) * BATCH_SIZE;
            const processed = Math.min(processedSoFar, jsonData.length);
            const percentage = Math.round((processed / jsonData.length) * 100);
            
            return {
              ...prev,
              stage: 'creating-users',
              currentProgress: percentage,
              processedRecords: processed,
              stageMessage: `Processed ${processed} of ${jsonData.length} records`,
            };
          });
          
          // Process individual results
          if (result.results) {
            result.results.forEach((userResult: any, index: number) => {
              const userData = batchData[index];
              if (userResult.success) {
                successCount++;
              } else {
                failedCount++;
                newErrors.push(`Error with employee ${userData.employeeCode || 'unknown'}: ${userResult.error}`);
              }
            });
          }
          
          // Update results
          setUploadResults({ success: successCount, failed: failedCount });
          setErrorMessages(newErrors);
          
        } catch (error: any) {
          console.error('Error processing batch:', error);
          
          // Mark all records in this batch as failed
          failedCount += batchData.length;
          newErrors.push(`Failed to process batch ${batchIndex + 1}: ${error.message || 'Unknown error'}`);
          
          setUploadResults({ success: successCount, failed: failedCount });
          setErrorMessages(newErrors);
        }
      }
      
      // Mark process as completed
      setProgress(prev => ({ 
        ...prev, 
        stage: 'completed',
        currentProgress: 100,
        processedRecords: jsonData.length,
        stageMessage: 'Processing completed',
      }));
      
    } catch (error: any) {
      console.error('Error during batch processing:', error);
      setErrorMessages([...errorMessages, `Processing error: ${error.message || 'Unknown error'}`]);
      
      setProgress(prev => ({ 
        ...prev, 
        stage: 'completed',
        stageMessage: `Error: ${error.message || 'Unknown error'}`
      }));
    }
  };

  const downloadJson = () => {
    if (!jsonData) return;
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, '.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get stage label for display
  const getStageLabel = (stage: ProcessStage): string => {
    switch (stage) {
      case 'idle': return 'Ready';
      case 'preparing': return 'Analyzing Data';
      case 'creating-refs': return 'Creating Reference Data';
      case 'creating-users': return 'Creating Users';
      case 'completed': return 'Completed';
      default: return 'Processing';
    }
  };

  // Get color for each stage
  const getStageColor = (stage: ProcessStage): string => {
    switch (stage) {
      case 'idle': return 'bg-gray-200';
      case 'preparing': return 'bg-yellow-500';
      case 'creating-refs': return 'bg-blue-500';
      case 'creating-users': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Excel to JSON Converter</h1>

      <div className="mb-6">
        <label 
          htmlFor="excel-file" 
          className="block w-full px-4 py-2 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-2"
        >
          {loading ? 'Processing...' : 'Upload Excel File'}
        </label>
        <input
          type="file"
          id="excel-file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-sm text-gray-500">Supported formats: .xlsx, .xls</p>
      </div>

      {jsonData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Results ({jsonData.length} {jsonData.length === 1 ? 'row' : 'rows'})
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={downloadJson}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download JSON
              </button>
              <button 
                onClick={processUserData}
                disabled={progress.stage !== 'idle' && progress.stage !== 'completed'}
                className={`px-4 py-2 text-white rounded ${
                  progress.stage !== 'idle' && progress.stage !== 'completed' 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {progress.stage !== 'idle' && progress.stage !== 'completed' ? 'Processing...' : 'Upload to Database'}
              </button>
            </div>
          </div>

          {progress.stage !== 'idle' && (
            <div className="mb-6 space-y-4">
              {/* Multi-stage progress bars */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="font-medium">Stage: </span>
                    <span className="font-semibold">{getStageLabel(progress.stage)}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {progress.processedRecords} of {progress.totalRecords} records
                  </div>
                </div>
                
                {/* Main progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${getStageColor(progress.stage)} w-[${progress.currentProgress}%] h-2.5 rounded-full transition-all duration-300`} 
                   
                  ></div>
                </div>
                <div className="text-sm mt-1 text-gray-600">
                  {progress.stageMessage}
                </div>
              </div>

              {/* Visual stage progress */}
              <div className="flex justify-between">
                {['preparing', 'creating-refs', 'creating-users', 'completed'].map((stage, index) => (
                  <div key={stage} className="flex flex-col items-center w-1/4">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        progress.stage === stage || 
                        ['creating-refs', 'creating-users', 'completed'].includes(progress.stage) && stage === 'preparing' ||
                        ['creating-users', 'completed'].includes(progress.stage) && stage === 'creating-refs' ||
                        progress.stage === 'completed' && stage === 'creating-users'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="mt-1 text-xs text-center">
                      {getStageLabel(stage as ProcessStage)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results summary */}
              <div className="flex justify-between mb-1 mt-4">
                <span className="text-sm font-medium">
                  Results Summary
                </span>
                <span className="text-sm font-medium">
                  Success: <span className="text-green-600">{uploadResults.success}</span> | 
                  Failed: <span className="text-red-600">{uploadResults.failed}</span>
                </span>
              </div>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="mt-4 mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Errors</h3>
              <ul className="list-disc pl-5 space-y-1">
                {errorMessages.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <pre className="text-sm max-h-96 overflow-auto">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}