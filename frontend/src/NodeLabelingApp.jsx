import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Server, 
  Play, 
  Check, 
  ChevronRight,
  Tag,
  Settings,
  Activity,
  Shield,
  Search,
  Save,
  RotateCcw
} from 'lucide-react';

const NodeLabelingApp = () => {
  const [activeView, setActiveView] = useState('clusters');
  const [clusters, setClusters] = useState([
    { id: 1, name: 'prod-cluster-01', status: 'connected', nodes: 12, lastUpdated: '2분 전' },
    { id: 2, name: 'dev-cluster-02', status: 'connected', nodes: 8, lastUpdated: '5분 전' },
    { id: 3, name: 'staging-cluster', status: 'disconnected', nodes: 6, lastUpdated: '1시간 전' }
  ]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [nodeLabels, setNodeLabels] = useState([]);
  const [editingLabels, setEditingLabels] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const nodesPerPage = 10;

  // Mock node labels data
  const mockNodeLabels = [
    {
      nodeName: 'worker-node-01',
      ip: '192.168.1.101',
      labels: {
        'node': 'web-server',
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/os': 'linux',
        'node.kubernetes.io/instance-type': 'm5.large',
        'topology.kubernetes.io/zone': 'us-west-2a',
        'environment': 'production',
        'team': 'frontend'
      }
    },
    {
      nodeName: 'worker-node-02',
      ip: '192.168.1.102',
      labels: {
        'node': 'database',
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/os': 'linux',
        'node.kubernetes.io/instance-type': 'm5.xlarge',
        'topology.kubernetes.io/zone': 'us-west-2b',
        'environment': 'production',
        'team': 'backend'
      }
    },
    {
      nodeName: 'worker-node-03',
      ip: '192.168.1.103',
      labels: {
        'node': 'cache',
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/os': 'linux',
        'node.kubernetes.io/instance-type': 'm5.large',
        'topology.kubernetes.io/zone': 'us-west-2c',
        'environment': 'production',
        'team': 'platform'
      }
    },
    {
      nodeName: 'worker-node-04',
      ip: '192.168.1.104',
      labels: {
        'node': 'monitoring',
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/os': 'linux',
        'node.kubernetes.io/instance-type': 'm5.medium',
        'topology.kubernetes.io/zone': 'us-west-2a',
        'environment': 'production',
        'team': 'devops'
      }
    },
    {
      nodeName: 'worker-node-05',
      ip: '192.168.1.105',
      labels: {
        'node': 'api-server',
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/os': 'linux',
        'node.kubernetes.io/instance-type': 'm5.large',
        'topology.kubernetes.io/zone': 'us-west-2b',
        'environment': 'staging',
        'team': 'backend'
      }
    },
    {
      nodeName: 'worker-node-06',
      ip: '192.168.1.106',
      labels: {
        'node': 'worker',
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/os': 'linux',
        'node.kubernetes.io/instance-type': 'm5.medium',
        'topology.kubernetes.io/zone': 'us-west-2c',
        'environment': 'staging',
        'team': 'platform'
      }
    }
  ];

  const testKubeConfig = async () => {
    setTestResult('testing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResult('success');
  };

  const saveConfig = () => {
    const newCluster = {
      id: clusters.length + 1,
      name: `cluster-${clusters.length + 1}`,
      status: 'connected',
      nodes: Math.floor(Math.random() * 20) + 5,
      lastUpdated: '방금 전'
    };
    setClusters([...clusters, newCluster]);
    setShowAddForm(false);
    setNewConfig('');
    setTestResult(null);
  };

  const deleteCluster = (id) => {
    setClusters(clusters.filter(c => c.id !== id));
  };

  const viewClusterNodes = (cluster) => {
    setSelectedCluster(cluster);
    setNodeLabels(mockNodeLabels);
    setActiveView('nodesOverview');
    setCurrentPage(1);
  };

  const viewNodeDetail = (node) => {
    setSelectedNode(node);
    setActiveView('nodeDetail');
  };

  const backToNodesOverview = () => {
    setSelectedNode(null);
    setActiveView('nodesOverview');
    setEditingLabels({});
  };

  const toggleLabelEdit = (nodeIndex, labelKey) => {
    const key = `${nodeIndex}-${labelKey}`;
    setEditingLabels(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateLabel = (nodeIndex, labelKey, newValue) => {
    const updatedLabels = [...nodeLabels];
    updatedLabels[nodeIndex].labels[labelKey] = newValue;
    setNodeLabels(updatedLabels);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': 
        return 'bg-emerald-500';
      case 'disconnected': 
        return 'bg-red-500';
      default: 
        return 'bg-gray-500';
    }
  };

  const isUserDefinedLabel = (key) => {
    return key === 'node' || key === 'environment' || key === 'team' || !key.includes('kubernetes.io');
  };

  const filteredNodes = nodeLabels.filter(node => 
    node.nodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.ip.includes(searchTerm)
  );

  // 페이징 계산
  const totalPages = Math.ceil(filteredNodes.length / nodesPerPage);
  const startIndex = (currentPage - 1) * nodesPerPage;
  const endIndex = startIndex + nodesPerPage;
  const currentNodes = filteredNodes.slice(startIndex, endIndex);

  // 모든 라벨 키 수집 (테이블 헤더용)
  const allLabelKeys = [...new Set(nodeLabels.flatMap(node => Object.keys(node.labels)))];
  const userDefinedKeys = allLabelKeys.filter(key => isUserDefinedLabel(key));
  const systemKeys = allLabelKeys.filter(key => !isUserDefinedLabel(key));

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          이전
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded border ${
              currentPage === number 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-slate-300 hover:bg-slate-50'
            }`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          다음
        </button>
      </div>
    );
  };

  // 개별 노드 상세 편집 화면
  if (activeView === 'nodeDetail' && selectedNode) {
    const nodeIndex = nodeLabels.findIndex(n => n.nodeName === selectedNode.nodeName);
    const node = nodeLabels[nodeIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={backToNodesOverview}
                  className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                  노드 목록
                </button>
                <div className="h-6 w-px bg-slate-300"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {node.nodeName} 라벨 편집
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{node.nodeName}</h3>
                    <p className="text-sm text-slate-600">IP: {node.ip}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {Object.keys(node.labels).length}개 라벨
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-purple-600" />
                사용자 정의 라벨
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(node.labels)
                  .filter(([key]) => isUserDefinedLabel(key))
                  .map(([key, value]) => {
                    const editKey = `${nodeIndex}-${key}`;
                    const isEditing = editingLabels[editKey];
                    const isModified = editingLabels[`${editKey}-modified`];
                    
                    return (
                      <div 
                        key={key} 
                        className={`p-3 rounded-lg border transition-all ${
                          isModified 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-600">{key}</span>
                          <button
                            onClick={() => toggleLabelEdit(nodeIndex, key)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={value}
                            onBlur={(e) => {
                              updateLabel(nodeIndex, key, e.target.value);
                              setEditingLabels(prev => ({
                                ...prev,
                                [editKey]: false,
                                [`${editKey}-modified`]: e.target.value !== value
                              }));
                            }}
                            className="w-full text-sm font-mono border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <span className={`text-sm font-mono ${isModified ? 'text-amber-700' : 'text-slate-900'}`}>
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-slate-600" />
                시스템 라벨
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(node.labels)
                  .filter(([key]) => !isUserDefinedLabel(key))
                  .map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 truncate">{key}</span>
                      </div>
                      <span className="text-sm font-mono text-gray-700">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              변경사항 저장
            </button>
            <button className="flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
              <RotateCcw className="w-4 h-4 mr-2" />
              변경사항 취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 노드 개요 테이블 화면
  if (activeView === 'nodesOverview' && selectedCluster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {setActiveView('clusters'); setSelectedCluster(null);}}
                  className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                  클러스터 목록
                </button>
                <div className="h-6 w-px bg-slate-300"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedCluster.name} 노드 관리
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="노드 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">노드 라벨 개요</h2>
                <div className="flex items-center space-x-4">
                  {Object.keys(editingLabels).some(key => key.includes('-modified') && editingLabels[key]) && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center">
                      <Edit className="w-3 h-3 mr-1" />
                      {Object.keys(editingLabels).filter(key => key.includes('-modified') && editingLabels[key]).length}개 변경됨
                    </span>
                  )}
                  <span className="text-sm text-slate-600">
                    총 {filteredNodes.length}개 노드 (페이지 {currentPage}/{totalPages})
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">💡 라벨 값을 클릭하여 직접 편집할 수 있습니다. Enter로 저장, Escape로 취소</p>
            </div>

            <div className="p-6 border-b border-slate-100">
              <h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-purple-600" />
                사용자 정의 라벨
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700 bg-slate-50 sticky left-0 z-10 min-w-[120px]">
                        라벨 키
                      </th>
                      {currentNodes.map(node => (
                        <th key={node.nodeName} className="text-center py-3 px-4 font-medium text-slate-700 bg-slate-50 min-w-[140px]">
                          <button
                            onClick={() => viewNodeDetail(node)}
                            className="hover:text-blue-600 transition-colors truncate max-w-[120px] block mx-auto"
                            title={node.nodeName}
                          >
                            {node.nodeName}
                          </button>
                          <div className="text-xs text-slate-500 mt-1">{node.ip}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userDefinedKeys.map(labelKey => (
                      <tr key={labelKey} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-sm text-slate-900 bg-white sticky left-0 z-10 border-r border-slate-200">
                          {labelKey}
                        </td>
                        {currentNodes.map(node => (
                          <td key={`${node.nodeName}-${labelKey}`} className="py-3 px-4 text-center">
                            {(() => {
                              const nodeIndex = nodeLabels.findIndex(n => n.nodeName === node.nodeName);
                              const editKey = `${nodeIndex}-${labelKey}`;
                              const isEditing = editingLabels[editKey];
                              const isModified = editingLabels[`${editKey}-modified`];
                              const value = node.labels[labelKey];
                              
                              return isEditing ? (
                                <input
                                  type="text"
                                  defaultValue={value || ''}
                                  onBlur={(e) => {
                                    const newValue = e.target.value;
                                    updateLabel(nodeIndex, labelKey, newValue);
                                    setEditingLabels(prev => ({
                                      ...prev,
                                      [editKey]: false,
                                      [`${editKey}-modified`]: newValue !== (value || '')
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingLabels(prev => ({
                                        ...prev,
                                        [editKey]: false
                                      }));
                                    }
                                  }}
                                  className="w-full text-xs font-medium bg-blue-50 border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                  autoFocus
                                />
                              ) : (
                                <button
                                  onClick={() => toggleLabelEdit(nodeIndex, labelKey)}
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium transition-all hover:shadow-sm ${
                                    value
                                      ? isModified
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                  title="클릭하여 편집"
                                >
                                  {value || '-'}
                                </button>
                              );
                            })()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-slate-600" />
                시스템 라벨 (주요)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700 bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                        라벨 키
                      </th>
                      {currentNodes.map(node => (
                        <th key={node.nodeName} className="text-center py-3 px-4 font-medium text-slate-700 bg-gray-50 min-w-[140px]">
                          <button
                            onClick={() => viewNodeDetail(node)}
                            className="hover:text-blue-600 transition-colors truncate max-w-[120px] block mx-auto"
                            title={node.nodeName}
                          >
                            {node.nodeName}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {systemKeys.slice(0, 4).map(labelKey => (
                      <tr key={labelKey} className="border-b border-slate-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs text-slate-700 bg-white sticky left-0 z-10 border-r border-slate-200 truncate">
                          {labelKey}
                        </td>
                        {currentNodes.map(node => (
                          <td key={`${node.nodeName}-${labelKey}`} className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                              {node.labels[labelKey] || '-'}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {systemKeys.length > 4 && (
                <p className="text-sm text-slate-500 mt-3 text-center">
                  더 많은 시스템 라벨을 보려면 개별 노드를 클릭하세요
                </p>
              )}
            </div>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={() => {
                // 변경된 라벨들을 실제로 저장하는 로직
                const modifiedLabels = Object.keys(editingLabels).filter(key => 
                  key.includes('-modified') && editingLabels[key]
                );
                if (modifiedLabels.length > 0) {
                  alert(`${modifiedLabels.length}개의 라벨 변경사항이 저장되었습니다.`);
                  // 실제 구현 시에는 여기서 API 호출
                  setEditingLabels({});
                } else {
                  alert('변경된 라벨이 없습니다.');
                }
              }}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              일괄 변경사항 저장
            </button>
            <button 
              onClick={() => {
                // 모든 변경사항 취소
                setEditingLabels({});
                setNodeLabels(mockNodeLabels); // 원본 데이터로 복원
              }}
              className="flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              변경사항 취소
            </button>
            <button 
              onClick={() => {
                // 빈 라벨 키를 선택한 노드들에 일괄 적용
                const selectedLabelKey = prompt('일괄 적용할 라벨 키를 입력하세요:');
                const labelValue = selectedLabelKey ? prompt(`'${selectedLabelKey}' 라벨의 값을 입력하세요:`) : null;
                
                if (selectedLabelKey && labelValue) {
                  const updatedNodes = nodeLabels.map(node => ({
                    ...node,
                    labels: { ...node.labels, [selectedLabelKey]: labelValue }
                  }));
                  setNodeLabels(updatedNodes);
                  alert(`모든 노드에 '${selectedLabelKey}: ${labelValue}' 라벨이 추가되었습니다.`);
                }
              }}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              일괄 라벨 추가
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 메인 클러스터 목록 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kubernetes Node Labeling
              </h1>
              <p className="text-slate-600 mt-1">클러스터 노드 라벨을 효율적으로 관리하세요</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              클러스터 추가
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showAddForm ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">총 클러스터</p>
                    <p className="text-2xl font-bold text-slate-900">{clusters.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">활성 노드</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {clusters.reduce((sum, cluster) => sum + cluster.nodes, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">연결된 클러스터</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {clusters.filter(c => c.status === 'connected').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(cluster.status)} mr-3`}></div>
                        <h3 className="text-lg font-semibold text-slate-900">{cluster.name}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteCluster(cluster.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">노드 수</span>
                        <span className="font-medium text-slate-900">{cluster.nodes}개</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">상태</span>
                        <span className={`font-medium ${cluster.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                          {cluster.status === 'connected' ? '연결됨' : '연결 끊김'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">마지막 업데이트</span>
                        <span className="text-slate-500">{cluster.lastUpdated}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => viewClusterNodes(cluster)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      노드 관리
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">클러스터 추가</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kubeconfig 설정
                  </label>
                  <textarea
                    value={newConfig}
                    onChange={(e) => setNewConfig(e.target.value)}
                    placeholder="kubeconfig 내용을 입력하세요..."
                    rows={12}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg ${
                    testResult === 'success' ? 'bg-green-50 border border-green-200' :
                    testResult === 'testing' ? 'bg-blue-50 border border-blue-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {testResult === 'success' && <Check className="w-5 h-5 text-green-600 mr-2" />}
                      {testResult === 'testing' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>}
                      <span className={`font-medium ${
                        testResult === 'success' ? 'text-green-800' :
                        testResult === 'testing' ? 'text-blue-800' :
                        'text-red-800'
                      }`}>
                        {testResult === 'success' && '연결 테스트 성공!'}
                        {testResult === 'testing' && '연결 테스트 중...'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={testKubeConfig}
                    disabled={!newConfig || testResult === 'testing'}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    연결 테스트
                  </button>
                  {testResult === 'success' && (
                    <button
                      onClick={saveConfig}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      저장
                    </button>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewConfig('');
                      setTestResult(null);
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeLabelingApp;
